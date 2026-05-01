// Brain hero — structural + math constants, types, and palette.
// Dynamic content (hub stats, neuron synthesis, floating thoughts, health)
// lives in `lib/brain-data.server.ts` and is loaded at request time so the
// brain stays in sync with the wiki as it grows.

export const ICE = {
  bg1: "#050810",
  hi: "#e6f4ff",
  mid: "rgba(190, 220, 255, 0.78)",
  low: "rgba(190, 220, 255, 0.45)",
  hairline: "rgba(140, 200, 255, 0.18)",
  accent: "#9cd5ff",
} as const;

// ── Particle / scene constants ──────────────────────────────────────────
export const N_CORTEX_CLUSTERS = 180;
export const N_CEREB_CLUSTERS = 28;
export const PARTICLES_PER_CLUSTER_AVG = 95;
export const N_CORTEX_FOG = 1800;
export const POINT_SIZE = 0.02;
export const BRAIN_SCALE = 1.55;
export const ROTATE_SENSITIVITY = 0.005;

// ── Procedural brain shape ──────────────────────────────────────────────
export function cortexRadius(dx: number, dy: number, dz: number): number {
  const a = 1.0,
    b = 1.22,
    c = 0.88;
  let r =
    1 / Math.sqrt((dx * dx) / (a * a) + (dy * dy) / (b * b) + (dz * dz) / (c * c));

  if (dy > 0) r *= 1.0 + 0.04 * dy;
  else r *= 1.0 + 0.05 * dy;

  if (dz < -0.45) r *= 1.0 - 0.18 * (-dz - 0.45);

  const lateralLow =
    Math.max(0, Math.abs(dx) - 0.45) * Math.max(0, -dz - 0.05);
  r += 0.12 * lateralLow;

  const sulci =
    0.075 * Math.sin(dx * 6.8 + dy * 5.1) * Math.cos(dz * 6.5) +
    0.06 * Math.cos(dy * 8.2 + dz * 4.3) * Math.sin(dx * 5.7) +
    0.05 * Math.sin(dx * 6.5 + dy * 7.9 + dz * 5.3) +
    0.04 * Math.cos(dx * 10.5) * Math.sin(dy * 8.7) +
    0.03 * Math.sin(dz * 11.3 + dx * 4.9);
  r += sulci;

  return r;
}

export const CEREB_CENTER: [number, number, number] = [0, -0.78, -0.42];
export const CEREB_RADIUS = 0.42;

export function cerebellumRadius(dx: number, dy: number, dz: number): number {
  const a = 1.0,
    b = 0.85,
    c = 0.75;
  let r =
    1 / Math.sqrt((dx * dx) / (a * a) + (dy * dy) / (b * b) + (dz * dz) / (c * c));
  r += 0.04 * Math.sin(dy * 18 + dx * 4) + 0.03 * Math.sin(dz * 14);
  return r * CEREB_RADIUS;
}

export function fissureKeep(x: number, y: number, z: number): number {
  if (z < -0.1) return 1;
  const ySoftStart = Math.max(0, 1 - Math.abs(y - 0.0) / 1.1);
  const fissureWidth = 0.05 * ySoftStart;
  const dx = Math.abs(x);
  if (dx > fissureWidth + 0.04) return 1;
  const t = Math.max(0, dx / (fissureWidth + 0.04));
  return Math.max(0.05, t);
}

// ── Hubs ────────────────────────────────────────────────────────────────
export type HubId = "ideas" | "journal" | "health" | "people" | "travel";

// Structural — direction, region, label. Stat + recent come from the loader.
export type HubBase = {
  id: HubId;
  label: string;
  region: string;
  dir: [number, number, number];
  cerebellum?: boolean;
};

export type Hub = HubBase & {
  stat: string;
  recent: string;
};

export const HUBS_BASE: HubBase[] = [
  {
    id: "ideas",
    label: "Ideas & projects",
    region: "Frontal",
    dir: [-0.45, 0.8, 0.4],
  },
  {
    id: "journal",
    label: "Daily journal",
    region: "Prefrontal",
    dir: [-0.75, 0.55, 0.35],
  },
  {
    id: "health",
    label: "Health metrics",
    region: "Cerebellum",
    dir: [0.3, -0.85, -0.3],
    cerebellum: true,
  },
  {
    id: "people",
    label: "People",
    region: "Temporal",
    dir: [-0.55, -0.3, -0.55],
  },
  {
    id: "travel",
    label: "Travel",
    region: "Parietal",
    dir: [0.55, 0.2, 0.75],
  },
];

export type ResolvedHub = HubBase & {
  pos: [number, number, number];
  stat: string;
  recent: string;
};

export function computeHubPositions(hubs: Hub[]): ResolvedHub[] {
  return hubs.map((h) => {
    const len = Math.hypot(h.dir[0], h.dir[1], h.dir[2]);
    const ux = h.dir[0] / len,
      uy = h.dir[1] / len,
      uz = h.dir[2] / len;
    let pos: [number, number, number];
    if (h.cerebellum) {
      const r = cerebellumRadius(ux, uy, uz);
      pos = [
        CEREB_CENTER[0] + ux * r * 1.05,
        CEREB_CENTER[1] + uy * r * 1.05,
        CEREB_CENTER[2] + uz * r * 1.05,
      ];
    } else {
      const r = cortexRadius(ux, uy, uz) * 1.06;
      pos = [ux * r, uy * r, uz * r];
    }
    return { ...h, pos };
  });
}

// ── Content types ───────────────────────────────────────────────────────
export type Thread = { label: string; text: string };
export type NeuronContent = {
  headline: string;
  summary: string;
  threads: Thread[];
  metric: { value: string; unit: string; sub: string };
};

export type ThoughtKind = "question" | "reminder" | "pattern";
export type Thought = { kind: ThoughtKind; text: string };

export const THOUGHT_KIND_LABELS: Record<ThoughtKind, string> = {
  question: "asking",
  reminder: "noticing",
  pattern: "pattern",
};

// ── Health detail data (real Hevy/Strava archive) ───────────────────────
export type WorkoutRecord = {
  date: string; // YYYY-MM-DD
  title: string;
  type: "run" | "ride" | "hike" | "studio" | "strength" | "other";
  durationMin?: number;
  distanceMi?: number;
  pace?: string; // "10:41/mi"
  avgHR?: number;
  maxHR?: number;
  sufferScore?: number;
};

export type Connection = { from: string; to: string; note: string };
export type Spotlight = {
  label: string;
  value: string;
  unit: string;
  delta: string;
};

export type HealthData = {
  totalSessions: number;
  thisYearSessions: number;
  headline: string;
  summary: string;
  spotlight: Spotlight;
  chartFootnote: string;
  zoneFootnote: string;
  connections: Connection[];
  highlight: { title: string; detail: string; metric: string };
  recent: WorkoutRecord[];
  hrSeries: { date: string; avgHR: number; distanceMi?: number }[];
  zoneStats: { zone: string; pct: number; count: number; meaning: string }[];
};

// ── The full payload ────────────────────────────────────────────────────
export type BrainData = {
  hubs: Hub[];
  neurons: Record<HubId, NeuronContent>;
  thoughts: Thought[];
  health: HealthData;
};
