import {
  HUBS_BASE,
  type BrainData,
  type Hub,
  type HubId,
  type NeuronContent,
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
  };
}
