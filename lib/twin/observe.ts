// Records each exchange with the twin to PostHog's AI observability, so Sarah can read what people
// text it. Optional: with no POSTHOG_KEY set, nothing is sent and the twin works the same.

import "server-only";
import { PostHog } from "posthog-node";
import type { TwinTurn } from "./prompt";

const KEY = process.env.POSTHOG_KEY;
const HOST = process.env.POSTHOG_HOST ?? "https://us.i.posthog.com";

// One client per server process, created on first use.
let client: PostHog | null = null;
let warned = false;
function posthog(): PostHog | null {
  if (!KEY) {
    if (!warned && process.env.NODE_ENV !== "production") {
      warned = true;
      console.warn(
        "POSTHOG_KEY variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once POSTHOG_KEY is configured",
      );
    }
    return null;
  }
  client ??= new PostHog(KEY, { host: HOST, flushAt: 1, flushInterval: 0 });
  return client;
}

export type Exchange = {
  conversationId: string; // random id the page makes for one visit
  turns: TwinTurn[]; // the conversation the twin was replying to
  reaction: string | null;
  texts: string[];
  model: string;
  latencySeconds: number;
  inputTokens?: number;
  outputTokens?: number;
  error?: string;
};

/** Queues one exchange. Never throws: analytics must not break a reply. */
export function recordExchange(x: Exchange): void {
  const ph = posthog();
  if (!ph) return;
  try {
    const lastVisitor = [...x.turns].reverse().find((t) => t.from === "visitor")?.text ?? "";
    const reply = [x.reaction ? `[${x.reaction}]` : "", ...x.texts].filter(Boolean).join("\n");
    ph.capture({
      distinctId: x.conversationId,
      event: "$ai_generation",
      properties: {
        $ai_trace_id: crypto.randomUUID(),
        $ai_session_id: x.conversationId, // groups a visit's exchanges into one conversation
        $ai_span_name: "twin reply",
        $ai_model: x.model,
        $ai_provider: "anthropic",
        $ai_input: x.turns.map((t) => ({ role: t.from === "sarah" ? "assistant" : "user", content: t.text })),
        $ai_output_choices: [{ role: "assistant", content: reply }],
        $ai_input_tokens: x.inputTokens,
        $ai_output_tokens: x.outputTokens,
        $ai_latency: x.latencySeconds,
        ...(x.error ? { $ai_is_error: true, $ai_error: x.error } : {}),
        // Plain copies, easy to scan in an events list.
        twin_visitor_text: lastVisitor,
        twin_reply: reply,
        twin_turn_count: x.turns.length,
        // Visitors are anonymous: no person profile, and no location from the server's address.
        $process_person_profile: false,
        $geoip_disable: true,
      },
    });
  } catch (err) {
    console.error("twin: could not queue analytics event", err);
  }
}

/** Sends anything queued. Call after the response; waits briefly and swallows failures. */
export async function flushExchanges(): Promise<void> {
  if (!client) return;
  try {
    await Promise.race([client.flush(), new Promise((resolve) => setTimeout(resolve, 2500))]);
  } catch (err) {
    console.error("twin: could not send analytics", err);
  }
}
