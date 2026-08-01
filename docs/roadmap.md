# Roadmap

Status: early planning, no code written yet. This is a first pass at
sequencing — expect it to shift once we start building.

## Phase 0 — Foundations

- [ ] Pick stack for the web app (framework, language, hosting)
- [ ] Pick/design the SRS algorithm (see [architecture.md](./architecture.md))
- [ ] Decide the pet stat model (see open questions in
      [vision.md](./vision.md))
- [ ] Rough data model: users, decks, cards, review history, pet state

## Phase 1 — MVP (web)

Goal: a single user can create a deck, review cards on an SRS schedule, and
watch a pet react to that review history.

- [ ] Deck/card CRUD (create, edit, delete decks and cards)
- [ ] Review session flow (show due cards, capture pass/fail or graded
      recall, reschedule per SRS algorithm)
- [ ] Pet state engine: compute pet stats from review history/overdue state
- [ ] Pet UI: at minimum a visual state (sprite/mood) that reflects current
      stats
- [ ] Persistence (accounts or local-only for MVP — TBD)

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
