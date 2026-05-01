import "server-only";
import { promises as fs } from "fs";
import path from "path";
import {
  HUBS_BASE,
  type BrainData,
  type Hub,
  type HubId,
  type HealthData,
  type NeuronContent,
  type Thought,
  type ThoughtKind,
  type WorkoutRecord,
} from "./brain";

// brain-web/ is expected to live inside the wiki repo. Walk up one level
// to reach the repo root containing wiki/ and raw/.
const REPO_ROOT = path.resolve(process.cwd(), "..");
const WIKI = path.join(REPO_ROOT, "wiki");
const RAW = path.join(REPO_ROOT, "raw");
const HEALTH_DAILY = path.join(RAW, "health", "daily");
const ENTITIES = path.join(WIKI, "entities");
const SYNTHESES = path.join(WIKI, "syntheses");

const TODAY_ISO = (): string => new Date().toISOString().slice(0, 10);

// ── Content file ────────────────────────────────────────────────────────
// Hand-curated copy lives in data/brain-content.json. The recipient writes
// this file (or has Claude Code generate it from their wiki). If it is
// missing, we fall back to data/brain-content.example.json so the app boots
// with placeholder copy on first run.
type Template = string;
type HubCopy = { stat: Template; recent: Template };
type NeuronCopy = {
  headline: Template;
  summary: Template;
  threads: { label: string; text: Template }[];
  metric: { value: Template; unit: string; sub: Template };
};
type Connection = { from: string; to: string; note: string };
type Spotlight = { label: string; value: Template; unit: string; delta: Template };
type ZoneStat = { zone: string; pct: number; count: number; meaning: string };

type BrainContent = {
  hubs: Record<HubId, HubCopy>;
  neurons: Record<HubId, NeuronCopy>;
  health: {
    headline: Template;
    summary: Template;
    spotlight: Spotlight;
    chartFootnote: Template;
    zoneFootnote: Template;
    connections: Connection[];
    highlight: { title: string; detail: string; metric: string };
  };
  zoneStats: ZoneStat[];
};

async function loadContent(): Promise<BrainContent> {
  const dataDir = path.join(process.cwd(), "data");
  for (const name of ["brain-content.json", "brain-content.example.json"]) {
    const p = path.join(dataDir, name);
    try {
      const raw = await fs.readFile(p, "utf-8");
      return JSON.parse(raw) as BrainContent;
    } catch {
      // try next
    }
  }
  throw new Error(
    "No data/brain-content.json or data/brain-content.example.json found.",
  );
}

// ── Filesystem helpers ──────────────────────────────────────────────────
async function readDir(dir: string): Promise<string[]> {
  try {
    return await fs.readdir(dir);
  } catch {
    return [];
  }
}

async function readFile(p: string): Promise<string> {
  try {
    return await fs.readFile(p, "utf-8");
  } catch {
    return "";
  }
}

function daysBetween(fromISO: string, toISO: string): number {
  const a = new Date(fromISO + "T00:00:00Z").getTime();
  const b = new Date(toISO + "T00:00:00Z").getTime();
  return Math.round((b - a) / 86400000);
}

function relativeDay(dateISO: string, todayISO: string): string {
  const d = daysBetween(dateISO, todayISO);
  if (d <= 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 7) return `${d} days ago`;
  if (d < 14) return "last week";
  if (d < 30) return `${Math.round(d / 7)} weeks ago`;
  if (d < 60) return "last month";
  return `${Math.round(d / 30)} months ago`;
}

// Replace {key} placeholders in a string with values from a context object.
function fill(template: string, ctx: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in ctx ? String(ctx[k]) : `{${k}}`,
  );
}

// ── Journals (wiki/journals/source-journal-YYYY-MM-DD.md) ───────────────
async function loadJournals() {
  const files = await readDir(path.join(WIKI, "journals"));
  const dates = files
    .map((f) => f.match(/^source-journal-(\d{4}-\d{2}-\d{2})\.md$/)?.[1])
    .filter((d): d is string => !!d)
    .sort();
  const latest = dates[dates.length - 1];
  return { count: dates.length, latest };
}

// ── Workouts (raw/health/daily/YYYY/YYYY-MM-DD-slug.md) ─────────────────
async function loadWorkouts(): Promise<{
  hevyTotal: number;
  stravaTotal: number;
  thisYear: number;
  recent: WorkoutRecord[];
  hrSeries: { date: string; avgHR: number; distanceMi?: number }[];
  totalSessions: number;
}> {
  const years = await readDir(HEALTH_DAILY);
  type FileInfo = { year: string; file: string; text: string; tags: string };
  const all: FileInfo[] = [];
  const yearNow = TODAY_ISO().slice(0, 4);
  for (const year of years.sort()) {
    if (!/^\d{4}$/.test(year)) continue;
    const files = await readDir(path.join(HEALTH_DAILY, year));
    for (const f of files) {
      if (!f.endsWith(".md")) continue;
      if (/^\d{4}\.md$/.test(f)) continue; // skip year hub index
      const text = await readFile(path.join(HEALTH_DAILY, year, f));
      const tags = text.match(/^tags:\s*\[([^\]]*)\]/m)?.[1] ?? "";
      all.push({ year, file: f, text, tags });
    }
  }

  const hevyTotal = all.filter((f) => f.tags.includes("hevy")).length;
  const stravaTotal = all.filter(
    (f) => f.tags.includes("strava") && !f.tags.includes("hevy"),
  ).length;
  const thisYear = all.filter((f) => f.year === yearNow).length;

  const sorted = all.sort((a, b) => (a.file > b.file ? -1 : 1));

  const records: WorkoutRecord[] = [];
  for (const { file, text } of sorted.slice(0, 90)) {
    const rec = parseWorkout(file, text);
    if (rec) records.push(rec);
  }

  const hrSeries = records
    .filter((r) => r.avgHR !== undefined && r.type === "run")
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((r) => ({
      date: r.date,
      avgHR: r.avgHR!,
      distanceMi: r.distanceMi,
    }));

  return {
    hevyTotal,
    stravaTotal,
    thisYear,
    recent: records.slice(0, 14),
    hrSeries,
    totalSessions: hevyTotal + stravaTotal,
  };
}

function parseWorkout(filename: string, text: string): WorkoutRecord | null {
  const m = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
  if (!m) return null;
  const date = m[1];
  const slug = m[2];

  const titleMatch = text.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : slug.replace(/-/g, " ");

  const stravaSection = text.split("## Strava Data").pop() ?? "";

  const get = (re: RegExp): string | undefined => {
    const m = stravaSection.match(re);
    return m ? m[1].trim() : undefined;
  };

  const distanceStr = get(/\*\*Distance:\*\*\s*([\d.]+)\s*mi/);
  const movingStr = get(/\*\*Moving time:\*\*\s*([^\n]+)/);
  const paceStr = get(/\*\*Avg pace:\*\*\s*([^\n]+)/);
  const avgHRStr = get(/\*\*Avg HR:\*\*\s*(\d+)/);
  const maxHRStr = get(/\*\*Max HR:\*\*\s*(\d+)/);
  const sufferStr = get(/\*\*Suffer score:\*\*\s*([\d.]+)/);
  const activityKind = stravaSection.match(/\(([\w\s]+)\)\s*$/m)?.[1];

  const type = inferType(slug, title, activityKind, paceStr);

  return {
    date,
    title,
    type,
    distanceMi: distanceStr ? Number(distanceStr) : undefined,
    durationMin: movingStr ? parseDurationToMin(movingStr) : undefined,
    pace: paceStr,
    avgHR: avgHRStr ? Number(avgHRStr) : undefined,
    maxHR: maxHRStr ? Number(maxHRStr) : undefined,
    sufferScore: sufferStr ? Number(sufferStr) : undefined,
  };
}

function inferType(
  slug: string,
  title: string,
  activityKind: string | undefined,
  paceStr: string | undefined,
): WorkoutRecord["type"] {
  const blob = `${slug} ${title}`.toLowerCase();
  const k = (activityKind || "").toLowerCase();
  if (k.includes("ride") || blob.includes("cycling") || blob.includes("bike"))
    return "ride";
  if (k.includes("hike") || blob.includes("hike")) return "hike";
  if (k.includes("run") || blob.includes("run") || blob.includes("marathon"))
    return "run";
  if (paceStr) return "run";
  if (
    blob.includes("solidcore") ||
    blob.includes("soulcycle") ||
    blob.includes("f45") ||
    blob.includes("orangetheory") ||
    blob.includes("barrys") ||
    blob.includes("yoga") ||
    blob.includes("pilates")
  )
    return "studio";
  if (
    blob.includes("strength") ||
    blob.includes("arms") ||
    blob.includes("legs") ||
    blob.includes("gym") ||
    blob.includes("lift")
  )
    return "strength";
  return "other";
}

function parseDurationToMin(s: string): number {
  const h = s.match(/(\d+)\s*h/);
  const m = s.match(/(\d+)\s*m(?!i)/);
  const sec = s.match(/(\d+)\s*s/);
  return (
    (h ? Number(h[1]) * 60 : 0) +
    (m ? Number(m[1]) : 0) +
    (sec ? Number(sec[1]) / 60 : 0)
  );
}

// ── Floating thoughts (wiki/MEMORY.md ## Floating thoughts section) ─────
async function loadMemoryThoughts(): Promise<Thought[]> {
  const memory = await readFile(path.join(WIKI, "MEMORY.md"));
  const section = memory.match(
    /## Floating thoughts[\s\S]*?(?=\n## |\n<!--|\n---|$)/,
  );
  if (!section) return [];
  const out: Thought[] = [];
  for (const line of section[0].split("\n")) {
    const m = line.match(/^- (question|reminder|pattern):\s*(.+)$/);
    if (m) out.push({ kind: m[1] as ThoughtKind, text: m[2].trim() });
  }
  return out;
}

// ── Counts (schema-driven) ──────────────────────────────────────────────
async function countEntities(): Promise<number> {
  const files = await readDir(ENTITIES);
  return files.filter((f) => f.endsWith(".md")).length;
}

async function countSyntheses(): Promise<number> {
  const files = await readDir(SYNTHESES);
  return files.filter((f) => f.endsWith(".md")).length;
}

// ── Build the brain payload ─────────────────────────────────────────────
export async function loadBrainData(): Promise<BrainData> {
  const today = TODAY_ISO();
  const [content, journals, workouts, thoughts, entityCount, synthesisCount] =
    await Promise.all([
      loadContent(),
      loadJournals(),
      loadWorkouts(),
      loadMemoryThoughts(),
      countEntities(),
      countSyntheses(),
    ]);

  const journalRecent = journals.latest
    ? relativeDay(journals.latest, today)
    : "—";
  const latestWorkout = workouts.recent[0];
  const workoutRecent = latestWorkout
    ? relativeDay(latestWorkout.date, today)
    : "—";

  // Substitution context per hub. Recipient can extend their content file
  // to use any of these placeholders.
  const ctxByHub: Record<HubId, Record<string, string | number>> = {
    ideas: { count: synthesisCount, syntheses: synthesisCount },
    journal: {
      count: journals.count,
      latest_relative: journalRecent,
      latest_date: journals.latest ?? "",
    },
    health: {
      count: workouts.totalSessions,
      hevy: workouts.hevyTotal,
      strava: workouts.stravaTotal,
      this_year: workouts.thisYear,
      latest_workout_relative: workoutRecent,
      latest_workout_title: latestWorkout?.title ?? "",
    },
    people: { count: entityCount, entities: entityCount },
    travel: { count: 0 },
  };

  const hubs: Hub[] = HUBS_BASE.map((b) => {
    const ctx = ctxByHub[b.id];
    const copy = content.hubs[b.id];
    return {
      ...b,
      stat: fill(copy.stat, ctx),
      recent: fill(copy.recent, ctx),
    };
  });

  const neurons: Record<HubId, NeuronContent> = Object.fromEntries(
    HUBS_BASE.map((b) => {
      const ctx = ctxByHub[b.id];
      const c = content.neurons[b.id];
      const filled: NeuronContent = {
        headline: fill(c.headline, ctx),
        summary: fill(c.summary, ctx),
        threads: c.threads.map((t) => ({
          label: t.label,
          text: fill(t.text, ctx),
        })),
        metric: {
          value: fill(c.metric.value, ctx),
          unit: c.metric.unit,
          sub: fill(c.metric.sub, ctx),
        },
      };
      return [b.id, filled];
    }),
  ) as Record<HubId, NeuronContent>;

  const healthCtx = ctxByHub.health;
  const health: HealthData = {
    totalSessions: workouts.totalSessions,
    thisYearSessions: workouts.thisYear,
    headline: fill(content.health.headline, healthCtx),
    summary: fill(content.health.summary, healthCtx),
    spotlight: {
      label: content.health.spotlight.label,
      value: fill(content.health.spotlight.value, healthCtx),
      unit: content.health.spotlight.unit,
      delta: fill(content.health.spotlight.delta, healthCtx),
    },
    chartFootnote: fill(content.health.chartFootnote, healthCtx),
    zoneFootnote: fill(content.health.zoneFootnote, healthCtx),
    connections: content.health.connections,
    highlight: content.health.highlight,
    recent: workouts.recent,
    hrSeries: workouts.hrSeries,
    zoneStats: content.zoneStats,
  };

  return { hubs, neurons, thoughts, health };
}
