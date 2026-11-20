// POST /api/twin: given the conversation so far, returns what Sarah's twin sends next:
// { reaction, texts }, where reaction is an optional tapback on the visitor's last text.
// Needs Anthropic credentials on the server (ANTHROPIC_API_KEY in production).
// Local dev without an API key: run with TWIN_DEV_USE_PLAN=1 to answer through the `claude` CLI
// on the logged-in Claude plan instead. That path never runs in production.

import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import Anthropic from "@anthropic-ai/sdk";
import { after } from "next/server";
import { flushExchanges, recordExchange } from "@/lib/twin/observe";
import { twinSystemPrompt, twinUserMessage, type TwinTurn } from "@/lib/twin/prompt";

export const runtime = "nodejs";
export const maxDuration = 30; // seconds; a stuck upstream call can't hold a function open longer

const MODEL = process.env.TWIN_MODEL ?? "claude-sonnet-5-5";

// Every limit here bounds what one request, or one visitor, can cost.
const MAX_BODY_BYTES = 16_000;
const MAX_TURNS = 30; // texts of conversation sent to the model
const MAX_TEXT_CHARS = 300; // per text, matching the input field
const MAX_TOTAL_CHARS = 5_000; // whole conversation
const MAX_REPLY_TEXTS = 5;
const MAX_REPLY_CHARS = 300;
const PER_MINUTE = 10; // per address
const PER_DAY = 80; // per address
const INSTANCE_PER_HOUR = 600; // all visitors on this server instance

const client = new Anthropic({ timeout: 20_000, maxRetries: 1 });

// Best-effort limits, held in memory. They are per server instance, so they slow one abuser down
// but are not a guarantee: the real backstops are a firewall rate limit on this path and a spend
// limit on the API key.
const hits = new Map<string, number[]>();
let instanceHits: number[] = [];
function allowed(ip: string): boolean {
  const now = Date.now();
  instanceHits = instanceHits.filter((t) => now - t < 60 * 60 * 1000);
  if (instanceHits.length >= INSTANCE_PER_HOUR) return false;
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 24 * 60 * 60 * 1000);
  const lastMinute = recent.filter((t) => now - t < 60 * 1000).length;
  if (lastMinute >= PER_MINUTE || recent.length >= PER_DAY) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  instanceHits.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return true;
}

/** The visitor's address as the platform reports it. On Vercel these headers are set by the edge, not the client. */
function clientIp(req: Request): string {
  const h = req.headers;
  return (h.get("x-vercel-forwarded-for") ?? h.get("x-real-ip") ?? h.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
}

/** Only the site's own pages may call this: the browser's Origin must be the host being served. */
function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function parseTurns(body: unknown): TwinTurn[] | null {
  const raw = (body as { turns?: unknown } | null)?.turns;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 200) return null;
  const turns: TwinTurn[] = [];
  let total = 0;
  for (const t of raw.slice(-MAX_TURNS)) {
    const from = (t as TwinTurn | null)?.from;
    const text = (t as TwinTurn | null)?.text;
    if ((from !== "visitor" && from !== "sarah") || typeof text !== "string") return null;
    // Drop control characters, collapse whitespace, and cap the length.
    const clean = text.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, MAX_TEXT_CHARS);
    if (!clean) continue;
    total += clean.length;
    turns.push({ from, text: clean });
  }
  if (total > MAX_TOTAL_CHARS) return null;
  if (!turns.length || turns[turns.length - 1].from !== "visitor") return null;
  return turns;
}

/** Reads the JSON body without trusting its declared size. */
async function readBody(req: Request): Promise<unknown | null> {
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return null;
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES || !req.body) return null;
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

const DEV_USE_PLAN = process.env.NODE_ENV !== "production" && process.env.TWIN_DEV_USE_PLAN === "1";

/** Dev only: one reply through the `claude` CLI, with no tools and none of the machine's instructions. */
function viaClaudeCli(system: string, prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "claude",
      ["-p", "--model", "sonnet", "--system-prompt", system, "--tools", "", "--strict-mcp-config", "--setting-sources", "",
        "--disable-slash-commands", "--no-session-persistence", "--output-format", "json"],
      { cwd: tmpdir(), stdio: ["pipe", "pipe", "ignore"] },
    );
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.on("error", reject);
    child.on("close", () => {
      try {
        const parsed = JSON.parse(out) as { result?: string; is_error?: boolean };
        if (parsed.is_error || !parsed.result) throw new Error("claude CLI returned no result");
        resolve(parsed.result);
      } catch (err) {
        reject(err);
      }
    });
    child.stdin.end(prompt);
  });
}

const TAPBACK = /^\[(heart|!!|haha|like|\?)\]$/;

/** Splits the model's output into an optional tapback on the visitor's last text, then her texts. */
function toReply(text: string): { reaction: string | null; texts: string[] } {
  const lines = text
    .split("\n")
    .map((l) => l.replace(/^Sarah:\s*/i, "").trim())
    .filter(Boolean);
  const first = lines[0]?.match(TAPBACK);
  const reaction = first ? first[1] : null;
  const texts = lines.filter((l) => !TAPBACK.test(l)).slice(0, MAX_REPLY_TEXTS).map((l) => l.slice(0, MAX_REPLY_CHARS));
  if (!reaction && !texts.length) return { reaction: null, texts: ["?"] };
  return { reaction, texts };
}

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" } });

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  if (!allowed(clientIp(req))) return json({ error: "slow down" }, 429);

  const body = await readBody(req);
  const turns = parseTurns(body);
  if (!turns) return json({ error: "bad request" }, 400);

  // The page sends a random id per visit so one visitor's exchanges group into a conversation.
  const cid = (body as { cid?: unknown }).cid;
  const conversationId = typeof cid === "string" && /^[a-zA-Z0-9-]{8,64}$/.test(cid) ? cid : crypto.randomUUID();
  const started = Date.now();
  const record = (reply: { reaction: string | null; texts: string[] }, extra: { inputTokens?: number; outputTokens?: number; error?: string } = {}) =>
    recordExchange({ conversationId, turns, ...reply, model: MODEL, latencySeconds: (Date.now() - started) / 1000, ...extra });
  after(flushExchanges); // send analytics once the reply is on its way

  try {
    if (DEV_USE_PLAN) {
      const reply = toReply(await viaClaudeCli(twinSystemPrompt(), twinUserMessage(turns)));
      record(reply);
      return json(reply);
    }

    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 400, // replies are a few short texts
      // If the model declines a message, the API retries it on a fallback model in the same call.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      thinking: { type: "between_tools" }, // no reasoning pass: this is a quick chat reply
      output_config: { effort: "low" },
      system: [{ type: "text", text: twinSystemPrompt(), cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: twinUserMessage(turns) }],
    });

    const usage = { inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens };
    if (response.stop_reason === "refusal") {
      const reply = { reaction: null, texts: ["lol idk what to say to that"] };
      record(reply, { ...usage, error: "model declined" });
      return json(reply);
    }
    const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n");
    const reply = toReply(text);
    record(reply, usage);
    return json(reply);
  } catch (error) {
    record({ reaction: null, texts: [] }, { error: error instanceof Error ? error.name : "unknown error" });
    if (error instanceof Anthropic.RateLimitError) return json({ error: "busy" }, 429);
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("twin: no valid Anthropic credentials on the server");
      return json({ error: "not configured" }, 503);
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`twin: API error ${error.status}: ${error.message}`);
      return json({ error: "upstream" }, 502);
    }
    if (error instanceof Error && error.name === "WorkloadIdentityError") {
      console.error(`twin: Anthropic credentials are not usable: ${error.message}`);
      return json({ error: "not configured" }, 503);
    }
    console.error("twin: unexpected error", error);
    return json({ error: "server" }, 500);
  }
}
