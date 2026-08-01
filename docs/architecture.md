# Architecture notes

Status: stack, SRS scheduling, pet state engine, and the data model are now
decided (see below). Pet visual states and hosting are still open.

## Constraints from the vision

- Pet state must be **derived from** SRS review data (due dates, accuracy,
  streaks), not stored independently as a separate source of truth. The
  review history is canonical; pet stats are a computed/cached view over it.
- Web-first. Whatever we pick should not block a later mobile client reusing
  the backend/API.

## Decisions

### SRS scheduling

**Decided: roll our own SM-2-style scheduler.**

Per-card state lives on `Card` (see data model below): ease factor,
repetition count, and interval, all updated after each review via the
standard SM-2 formula. `submitReview` (tRPC) is the single hook point where a
review event updates this state and appends a `ReviewLog` row.

### Pet state engine

**Decided: single health stat, one pet per user, computed on-demand.**

- One `Pet` per `User` (not per-deck) — it reflects the health of the user's
  entire review queue across all decks.
- A single `health` stat (0-100), not multiple stats — simplest for MVP, can
  be split into multiple bars later (Phase 2) without a data model change
  since it's derived, not stored.
- `health` is **computed at read time**, not materialized/cached. Overdue
  cards must cause decay purely from time passing (per vision.md), and
  nothing would trigger that decay on a cache invalidated only by review
  events. Computing on read also satisfies the "recomputable, not
  incrementally updated" constraint above directly. Revisit if this becomes a
  perf problem at scale.
- Inputs: overdue card count/age, recent accuracy, streak length, all
  aggregated from `ReviewLog` + `Card.dueAt`. Exact formula TBD when the pet
  UI is built.

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
- **Prisma** — ORM, maps directly onto the data model below.
- **NextAuth (Auth.js)** — accounts, since `User`/`Deck` ownership implies we
  need auth from the start rather than deferring to local-only storage.
- **Tailwind CSS** — styling, including whatever the pet's visual states
  turn out to be (sprite/CSS-driven, TBD).
- Hosting: TBD (Vercel is the natural default for a T3 app but not decided).

### Data model

- `User` / `Account` / `Session` / `VerificationToken` — standard NextAuth
  tables, unmodified.

- `Deck`
  - `id`, `userId` (FK → `User`), `name`, `description?`, `createdAt`

- `Card` — belongs to a `Deck`
  - `id`, `deckId` (FK → `Deck`), `front`, `back`
  - SM-2 scheduling state: `easeFactor` (float, default 2.5), `intervalDays`
    (int, default 0), `repetitions` (int, default 0), `dueAt` (datetime,
    defaults to now so new cards are immediately due)
  - `createdAt`, `updatedAt`

- `ReviewLog` — one row per review, canonical review history
  - `id`, `cardId` (FK → `Card`), `reviewedAt`, `grade` (0-5, SM-2 style)
  - `previousInterval`, `newInterval`, `previousEase`, `newEase` — snapshot of
    the SM-2 transition, so past scheduling decisions can be inspected/debugged
    without recomputing them

- `Pet`
  - `id`, `userId` (FK → `User`, unique — one pet per user)
  - No stored `health` column — computed at read time (see pet state engine
    above). May hold cosmetic fields later (e.g. a name) if the pet becomes
    nameable, but no stat data.

This satisfies the Phase 0 roadmap item "rough data model: users, decks,
cards, review history, pet state." Next step is turning this into an actual
`prisma/schema.prisma`.
