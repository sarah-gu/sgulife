// Brain hero - structural + math constants, types, and palette.
// Hub geometry is unchanged from the template; only the labels/regions/IDs
// were re-themed for a personal landing page.

export const ICE = {
  bg1: "#050810",
  hi: "#e6f4ff",
  mid: "rgba(190, 220, 255, 0.78)",
  low: "rgba(190, 220, 255, 0.45)",
  hairline: "rgba(140, 200, 255, 0.18)",
  accent: "#9cd5ff",
} as const;

// ── Particle / scene constants ──────────────────────────────────────────
export const N_CORTEX_CLUSTERS = 145;
export const N_CEREB_CLUSTERS = 22;
export const PARTICLES_PER_CLUSTER_AVG = 76;
export const N_CORTEX_FOG = 1400;
export const POINT_SIZE = 0.02;
export const BRAIN_SCALE = 1.55;
export const ROTATE_SENSITIVITY = 0.005;

// ── Procedural brain shape ──────────────────────────────────────────────
export function cortexRadius(dx: number, dy: number, dz: number): number {
  const a = 1.0,
    b = 1.22,
    c = 0.88;
  let r =
    1 /
    Math.sqrt((dx * dx) / (a * a) + (dy * dy) / (b * b) + (dz * dz) / (c * c));

  if (dy > 0) r *= 1.0 + 0.04 * dy;
  else r *= 1.0 + 0.05 * dy;

  if (dz < -0.45) r *= 1.0 - 0.18 * (-dz - 0.45);

  const lateralLow = Math.max(0, Math.abs(dx) - 0.45) * Math.max(0, -dz - 0.05);
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
    1 /
    Math.sqrt((dx * dx) / (a * a) + (dy * dy) / (b * b) + (dz * dz) / (c * c));
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
export type HubId = "projects" | "about" | "experience" | "travel";

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
    id: "about",
    label: "About",
    region: "Occipital",
    dir: [0.15, 0.45, -0.85],
  },
  {
    id: "experience",
    label: "Experience",
    region: "Temporal",
    dir: [-0.55, -0.3, -0.55],
  },
  {
    id: "projects",
    label: "Projects",
    region: "Frontal",
    dir: [-0.45, 0.8, 0.4],
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

// ── Detail content (deep-dive views per hub) ────────────────────────────
export type LinkRef = { label: string; href: string };

export type AboutDetail = {
  photo: string;
  name: string;
  tagline: string;
  paragraphs: string[];
  contactCta: string;
  links: LinkRef[];
};

export type ExperienceItem = {
  company: string;
  role: string;
  dates: string;
  logo: string;
  blurb: string;
  details: string;
};

export type ProjectItem = {
  name: string;
  award?: string;
  description: string;
  link?: string;
  image: string;
};

export type VisitedCountry = {
  name: string;
  year: number | string;
  trek?: string;
};

export type TravelPhoto = {
  src: string;
  title: string;
  where: string;
  trip: string;
};

export type TravelDetail = {
  headline: string;
  summary: string;
  home: string;
  visited: VisitedCountry[];
  photos: TravelPhoto[];
};

export type DetailContent = {
  about: AboutDetail;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  travel: TravelDetail;
};

// ── The full payload ────────────────────────────────────────────────────
export type BrainData = {
  hubs: Hub[];
  neurons: Record<HubId, NeuronContent>;
  thoughts: Thought[];
  details: DetailContent;
};
