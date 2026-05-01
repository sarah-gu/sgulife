# brain-web

A 3D particle-cloud "brain" you can traverse — neurons (hubs) light up the structure of your knowledge, and clicking one opens an AI synthesis panel for that domain. Hover thoughts drift across the canvas.

This is a template. It assumes you have an Obsidian vault organized as an LLM Wiki (Karpathy-style), and reads live counts from your `wiki/` and `raw/` directories. Hand-curated synthesis prose lives in a single JSON file.

## Setup (for Claude Code)

This package is meant to be unzipped *inside* an existing wiki repo as a sibling of `wiki/` and `raw/`:

```
your-wiki-repo/
├── wiki/                 # existing
├── raw/                  # existing
└── brain-web/            # this package
```

Then, from `brain-web/`:

```bash
bun install
bun dev
```

Open http://localhost:3000.

It will boot with placeholder copy from `data/brain-content.example.json`. Live counts (journals, workouts, entities, syntheses) will be real.

## What you (Claude Code) need to wire up

### 1. Verify the wiki schema matches

The data adapter at `lib/brain-data.server.ts` reads:

| What                | Where                                                   |
| ------------------- | ------------------------------------------------------- |
| Journal count       | `wiki/journals/source-journal-YYYY-MM-DD.md`            |
| Workout records     | `raw/health/daily/YYYY/YYYY-MM-DD-slug.md`              |
| Entity count        | `wiki/entities/*.md`                                    |
| Synthesis count     | `wiki/syntheses/*.md`                                   |
| Floating thoughts   | `wiki/MEMORY.md` `## Floating thoughts` section         |

The workout parser expects a `## Strava Data` section with bold-prefixed fields (`**Distance:** 4.2 mi`, `**Avg HR:** 156`, etc.) and an `^tags: [hevy, strava, ...]` line in frontmatter. If the user's setup differs, edit the regexes in `parseWorkout()` and the readers in `lib/brain-data.server.ts`.

The MEMORY.md `## Floating thoughts` section expects bullets like:

```
- question: A literal question that's pulling on me
- reminder: Something to keep top-of-mind
- pattern: A recurring observation
```

### 2. Generate `data/brain-content.json` from the user's wiki

Copy `data/brain-content.example.json` → `data/brain-content.json` and replace every placeholder with synthesis prose drawn from the user's actual wiki. This is where Claude Code earns its keep:

- For each of the 5 hubs (`ideas`, `journal`, `health`, `people`, `travel`), read the relevant wiki content and write:
  - **headline** — one line that names the dominant story in that domain right now
  - **summary** — 2–4 sentences synthesizing across multiple sources
  - **threads** — three labeled signals (recurring theme, anomaly, connection, etc.)
  - **metric** — a number + unit + caption. Use `{placeholders}` for live counts (see "Available placeholders" below).
- Fill in the `health` block:
  - **headline** + **summary** for the health detail page
  - **spotlight** — one stat tile (e.g. a recent race time)
  - **chartFootnote** — a sentence about the HR chart pattern
  - **zoneFootnote** — link to the supporting synthesis page
  - **connections** — 4 cross-hub notes
- Fill in **zoneStats** with the actual Z2/Z3/Z4/Z5 distribution from a running HR analysis. If the user has a synthesis page for this, copy the numbers from there.

### 3. Restart the dev server

`bun dev` re-reads the content file on every request (`force-dynamic`), so just refresh.

## Available placeholders

In any string in `brain-content.json`, you can use `{placeholders}` that get filled with live counts at render time. Each hub has its own context — see `loadBrainData()` in `lib/brain-data.server.ts` for the exact set. Common ones:

- `{count}` — the canonical count for that hub (journals, workouts, entities, syntheses)
- `{latest_relative}` — "yesterday", "3 days ago" for the latest journal
- `{latest_workout_relative}` — same, for the latest workout
- `{this_year}` — workouts this year
- `{hevy}`, `{strava}` — split workout counts

The `health` neuron and detail page share the same context, so any of the workout placeholders work there.

## Customizing the hubs themselves

The 5 hubs (their labels, brain regions, 3D positions) are defined in `lib/brain.ts` under `HUBS_BASE`. The 3D positions are tuned for 5 hubs spread across the cortex + cerebellum. Renaming labels is safe; adding/removing hubs requires also updating the position vectors and the `HubId` union.

## Tech notes

- Next.js 16 (with App Router). See `AGENTS.md`.
- Three.js for the brain particle cloud. The procedural shape is in `cortexRadius()` / `cerebellumRadius()` in `lib/brain.ts`.
- Server-side data loading via a single `loadBrainData()` call on every request. No caching layer — the brain stays in sync with the wiki as it grows.
- Original Three.js prototype lives in `design_handoff_brain_particle_cloud/` for reference.

## File map

```
brain-web/
├── app/
│   ├── layout.tsx          # fonts + metadata
│   ├── page.tsx            # entry — calls loadBrainData() and renders <BrainPage>
│   └── globals.css
├── components/
│   ├── Markdown.tsx        # tiny inline-markdown helper
│   └── brain/
│       ├── Brain3D.tsx           # Three.js particle cloud + hub picking
│       ├── BrainPage.tsx         # top-level UI: brain ↔ health detail switcher
│       ├── FloatingThoughts.tsx  # ambient drifting thought bubbles
│       ├── HealthDetail.tsx      # the deep dive page when you "enter" the health neuron
│       └── NeuronPanel.tsx       # the synthesis modal that opens on hub click
├── lib/
│   ├── brain.ts                # types, palette, hub definitions, procedural shape math
│   ├── brain-data.server.ts    # the data adapter — reads wiki/raw, merges with brain-content.json
│   └── text.ts                 # inline-markdown + wikilink helpers
├── data/
│   └── brain-content.example.json  # copy → brain-content.json and edit
└── design_handoff_brain_particle_cloud/  # original Three.js prototype for reference
```
