# Roadmap

Status: early planning, no code written yet. This is a first pass at
sequencing — expect it to shift once we start building.

## Phase 0 — Foundations

- [x] Pick stack for the web app — [T3 stack](https://create.t3.gg/)
      (Next.js, TypeScript, tRPC, Prisma, NextAuth, Tailwind); see
      [architecture.md](./architecture.md)
- [x] Pick/design the SRS algorithm — roll our own SM-2 (see
      [architecture.md](./architecture.md))
- [x] Decide the pet stat model — single health stat, one pet per user,
      computed on-demand (see [architecture.md](./architecture.md))
- [x] Rough data model: users, decks, cards, review history, pet state (see
      [architecture.md](./architecture.md))

## Phase 1 — MVP (web)

Goal: a single user can create a deck, review cards on an SRS schedule, and
watch a pet react to that review history.

- [ ] Deck/card CRUD (create, edit, delete decks and cards)
- [ ] Review session flow (show due cards, capture pass/fail or graded
      recall, reschedule per SRS algorithm)
- [ ] Pet state engine: compute pet stats from review history/overdue state
- [ ] Pet UI: at minimum a visual state (sprite/mood) that reflects current
      stats
- [ ] Persistence via Prisma + NextAuth accounts (local-only storage is off
      the table now that the stack is decided)

## Phase 2 — Depth

- [ ] Pet growth/evolution stages tied to sustained streaks
- [ ] Richer stat model if MVP shipped with a single bar
- [ ] Neglect/recovery states (what happens if you abandon the app for weeks)
- [ ] Deck import/export or sharing

## Phase 3 — Mobile (stretch)

Only after web MVP is solid. Framework choice (native vs. React
Native/Flutter) deferred until this phase starts.

- [ ] Evaluate reusing web frontend vs. native rebuild
- [ ] Mobile-specific pet engagement (notifications for due reviews /
      neglected pet)

## Non-goals (for now)

- Multiplayer/social features — explicitly deferred, see vision doc open
  questions.
- Multiple pets per user / per-deck pets — deferred until stat model is
  settled.
