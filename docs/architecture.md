# Architecture notes

Status: stub. Stack is now decided (T3, see below); everything else here
(SRS scheduling, pet state engine, data model) is still open.

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

**Decided: [T3 stack](https://create.t3.gg/).**

- **Next.js** — frontend + backend in one app (satisfies the web-first
  constraint; also the most reusable base if we ever want a React Native
  mobile client later, per the vision doc's mobile-stretch goal).
- **TypeScript** — end-to-end types, including through tRPC into the pet
  engine and SRS scheduler.
- **tRPC** — typed API layer between client and server; good fit for the
  review-event → pet-state-recompute flow since the client can call a single
  typed `submitReview` procedure.
- **Prisma** — ORM, maps directly onto the data model sketch below.
- **NextAuth (Auth.js)** — accounts, since `User`/`Deck` ownership implies we
  need auth from the start rather than deferring to local-only storage.
- **Tailwind CSS** — styling, including whatever the pet's visual states
  turn out to be (sprite/CSS-driven, TBD).
- Hosting: TBD (Vercel is the natural default for a T3 app but not decided).

### Data model (sketch, not final)

- `User` — via NextAuth
- `Deck` — belongs to a user
- `Card` — belongs to a deck; front/back content
- `ReviewLog` — one row per review: card, timestamp, grade/result, resulting
  interval
- `Pet` — state derived from `ReviewLog` aggregates; exact shape depends on
  the stat model decision in vision.md

This will get fleshed out once Phase 0 decisions in the
[roadmap](./roadmap.md) are made.
