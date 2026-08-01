# Architecture notes

Status: stub. No stack decisions are final — this doc exists to collect
options and constraints as we make them, not to declare a design.

## Constraints from the vision

- Pet state must be **derived from** SRS review data (due dates, accuracy,
  streaks), not stored independently as a separate source of truth. The
  review history is canonical; pet stats are a computed/cached view over it.
- Web-first. Whatever we pick should not block a later mobile client reusing
  the backend/API.

## Open decisions

### SRS scheduling

- Roll our own (SM-2-style) scheduler, or use an existing library?
- Needs: per-card interval + ease/difficulty, due-date computation, and a
  clean hook point for "this review just happened" so the pet engine can
  react.

### Pet state engine

- Likely a function of: overdue card count/age, recent accuracy, streak
  length. Needs to be recomputable (not just incrementally updated) so we can
  change the formula later without corrupting history.
- Decide whether pet stats are computed on-demand (derived at read time) or
  materialized/cached and invalidated on review events.

### Stack

- Frontend framework: TBD (React/Vue/Svelte all reasonable; no constraint
  yet).
- Backend: TBD — depends on whether MVP needs accounts/multi-device sync or
  can start local-only (e.g. IndexedDB/localStorage) and add a backend later.
- Hosting: TBD.

### Data model (sketch, not final)

- `User` — if accounts exist in MVP
- `Deck` — belongs to a user
- `Card` — belongs to a deck; front/back content
- `ReviewLog` — one row per review: card, timestamp, grade/result, resulting
  interval
- `Pet` — state derived from `ReviewLog` aggregates; exact shape depends on
  the stat model decision in vision.md

This will get fleshed out once Phase 0 decisions in the
[roadmap](./roadmap.md) are made.
