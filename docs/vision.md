# Vision

## Pitch

A flashcard app crossed with a Tamagotchi. You keep a virtual pet alive and
happy by studying — the pet's state is a direct readout of your spaced
repetition (SRS) performance, not a cosmetic layer bolted on top.

## Core loop

The pet's stats are driven by SRS mechanics, not by "studying in general":

- **Reviews come due** on an SRS schedule per card (e.g. SM-2/Anki-style
  intervals).
- **On-time, accurate reviews** raise the pet's stats (happiness, energy,
  health — exact stat set TBD).
- **Overdue cards** cause stats to decay over time. A pile of overdue reviews
  should visibly stress the pet (mood drop, "hungry"/"neglected" states),
  not just sit as a number in a queue.
- **Streaks and accuracy** are the main levers for growth/evolution, mirroring
  how SRS itself rewards consistency over cramming.

The intent is that the pet becomes an emotionally legible proxy for "is my
review queue healthy," so the incentive to open the app and clear reviews is
stronger than a plain flashcard app's.

## Why this framing (vs. a reward-layer pet)

We explicitly chose **stats-derived-from-SRS** over **currency-for-studying**.
A reward-layer pet (earn coins, spend on pet) decouples pet state from study
health — you could neglect reviews for a week and still have a happy, well-fed
pet from banked currency. Tying stats directly to SRS state keeps the pet
honest: it reflects your actual review debt.

## Platform

- **Web app first.** Primary target, build here first.
- **Mobile app is a stretch goal** if time allows — likely after the web MVP
  is solid, not in parallel. Framework choice for mobile (native vs.
  React Native/Flutter) is deferred until we get there.

## Open questions

These are unresolved and worth revisiting as the roadmap firms up:

- What's the exact stat model for the pet (single "health" bar vs. multiple
  stats like hunger/happiness/energy)?
- What happens at the extremes — can the pet "die"/get sick, and is that
  recoverable, or is it a soft-fail (stats just floor out and recover)?
- Do users manage multiple decks with one shared pet, or a pet per deck?
- Any social/multiplayer angle (comparing pets, sharing decks) or strictly
  single-player for v1?
- SRS algorithm choice — roll our own SM-2-style scheduler or lean on an
  existing library?
