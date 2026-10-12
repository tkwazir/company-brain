# Company Brain

A demo front end for a "company brain": ask questions in natural language, watch
the system route the query through governed datasets, and get back an answer —
all visualized as a three-tower skyscraper where floors are datasets.

This is a **demo-first front end** built for a hackathon. The backend is mocked
behind a typed API layer so a real backend can be swapped in later with a
one-line env change.

**Live:** https://company-brain-three-flame.vercel.app

## Stack

Vite + React + TypeScript, Three.js via `@react-three/fiber` / `@react-three/drei`,
`@react-three/postprocessing` for bloom, Tailwind CSS v4, Framer Motion, Zustand.

## Running it

```bash
npm install
npm run dev
```

## Mock vs. real API

All backend calls go through `BrainClient` (`src/api/client.ts`). By default the
app uses the deterministic mock implementation (`src/api/mockClient.ts`).

- `VITE_USE_MOCK=true` (default) — mock client, scripted responses, no network calls.
- `VITE_USE_MOCK=false` — real client (`src/api/httpClient.ts`), calls `VITE_API_URL`.

Set these in a `.env.local` file (not committed).

## Demo shortcuts

_(filled in as the presenter-mode features land)_

## Status

Build in progress. Done so far:

- Static 3D building: three towers, config-driven floors, instanced windows, beacons, bloom, idle camera drift.
- UI shell: layout, role badge, feed, input bar (text + voice), suggested questions.
- Typed mock API: governance policy table, 4 scripted demo questions, keyword fallback.
- Full query animation: thinking → routing → governance → beams → answer card, with collapsible SQL, masked columns, clickable source chips, and a governance summary.

Not yet built: role switching / "Re-run as…" / audit drawer, the ingest flow and modal, and ambient polish + presenter keyboard shortcuts.
