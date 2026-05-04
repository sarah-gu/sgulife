import {
  HUBS_BASE,
  tripSlug,
  type BrainData,
  type Hub,
  type HubId,
  type NeuronContent,
  type SubDot,
  type Thought,
  type DetailContent,
} from "./brain";
import content from "@/data/brain-content.json";

type RawContent = {
  hubs: Record<HubId, { stat: string; recent: string }>;
  neurons: Record<HubId, NeuronContent>;
  thoughts: Thought[];
  details: DetailContent;
};

function buildSubDots(details: DetailContent): SubDot[] {
  const subs: SubDot[] = [];

  details.projects.forEach((p) => {
    subs.push({
      id: `projects:${p.slug}`,
      parentId: "projects",
      label: p.name,
      slug: p.slug,
      kind: "project",
    });
  });

  details.experience.forEach((e) => {
    subs.push({
      id: `experience:${e.slug}`,
      parentId: "experience",
      label: e.company,
      slug: e.slug,
      kind: "experience",
    });
  });

  const seenTrips = new Set<string>();
  details.travel.photos.forEach((photo) => {
    if (seenTrips.has(photo.trip)) return;
    seenTrips.add(photo.trip);
    const slug = tripSlug(photo.trip);
    subs.push({
      id: `travel:${slug}`,
      parentId: "travel",
      label: photo.trip,
      slug,
      kind: "trip",
    });
  });

  details.about.links.forEach((link) => {
    const slug = tripSlug(link.label);
    subs.push({
      id: `about:${slug}`,
      parentId: "about",
      label: link.label,
      slug,
      kind: "link",
    });
  });

  return subs;
}

export function loadBrainData(): BrainData {
  const c = content as unknown as RawContent;

  const hubs: Hub[] = HUBS_BASE.map((b) => ({
    ...b,
    stat: c.hubs[b.id].stat,
    recent: c.hubs[b.id].recent,
  }));

  const visitedCount = c.details.travel.visited.length;
  const neurons: typeof c.neurons = {
    ...c.neurons,
    travel: {
      ...c.neurons.travel,
      metric: { ...c.neurons.travel.metric, value: String(visitedCount) },
    },
  };

  return {
    hubs,
    neurons,
    thoughts: c.thoughts,
    details: c.details,
    subDots: buildSubDots(c.details),
  };
}
