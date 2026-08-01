# Vision

## Pitch

Spaced repetition works, but nobody sticks with it — because the cost of
skipping a day is invisible. We made the cost visible: a creature that
depends on you learning your material to survive until your deadline. Same
neuroscience that makes people doomscroll — immediate feedback, a living
thing to check on — pointed at your flashcards instead of your feed.

## The actual problem

The real competitor isn't Quizlet or Anki. It's your phone's dopamine loop.
So the problem is about attention economics, not pedagogy:

Spaced repetition is proven to work, but it fails in practice because it has
none of the psychological pull that keeps people opening TikTok forty times a
day. Studying is effortful and its payoff is weeks away. Doomscrolling is
effortless and its payoff is instant. Every study app tries to fix this with
reminders and streaks, which feel like nagging, not stakes.

That's the gap: existing SRS tools have the right mechanism (repetition) but
the wrong motivational engine (guilt/streaks). We're proposing to swap the
engine, not the mechanism.

## Why the tamagotchi framing actually solves it

The specific psychological levers being borrowed — this is what makes it
more than a gimmick, and it's what should keep getting checked against as
features get built:

- **Loss aversion > goal pursuit.** "Study or your grade goal slips" is
  abstract. "Study or your pet dies" is visceral and immediate — the same
  trick mobile games use to bring people back daily (Duolingo streaks,
  Tamagotchi itself, farm games).
- **A living stake, not a static checklist.** Doomscrolling wins because it
  has continuous feedback (new content every swipe). The pet gives
  continuous feedback too — it's visibly better or worse right now based on
  what you did today, not "12% through the deck."
- **Externalized responsibility.** People skip self-care obligations far more
  easily than obligations to another being (this is well-documented — it's
  why plant/pet-care apps for medication adherence and habit tracking work).
  We're not asking "did you study," we're asking "did you take care of
  something."
- **Deadline-bound survival, not infinite streak.** Duolingo's streak model
  is actually a weakness — infinite maintenance leads to streak-anxiety and
  eventual abandonment. This app should have a goal date (exam, deadline),
  so the stakes have a natural climax instead of guilt forever. This is not
  yet reflected in the data model — see open questions below.

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

**This is the load-bearing constraint on the whole pitch:** the pet's fate
must track quality of recall, not just frequency of opening the app. If it's
just "opened app = pet fed," this is a streak counter with cuter art — the
differentiator only holds if survival is tied to actual retention
performance (cards being forgotten should visibly hurt the pet more than
cards being known). `architecture.md`'s pet state engine (accuracy +
overdue-age as inputs, not just a login check) is what keeps this honest;
any future change to that formula should be checked against this bar.

## Why stats-derived-from-SRS (vs. a reward-layer pet)

We explicitly chose **stats-derived-from-SRS** over **currency-for-studying**.
A reward-layer pet (earn coins, spend on pet) decouples pet state from study
health — you could neglect reviews for a week and still have a happy, well-fed
pet from banked currency. Tying stats directly to SRS state keeps the pet
honest: it reflects your actual review debt.

## Visual style reference

![Pet style reference](./assets/pet-style-reference.png)

Target look for the pet: flat two-tone illustration (navy outline/fill +
white body), thick uniform linework, minimal dot eyes with blush cheeks, a
simple rounded blob body with small stubby limbs. No shading/gradients or
fine detail — the style needs to read clearly at small sizes and hold up
across the stat-driven mood variations (happy/neglected/etc.) without
needing a full redraw per state.

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
- **Is the pet deadline-bound (tied to a user-set goal date, e.g. an exam)
  or an infinite-maintenance pet?** The "why the tamagotchi framing works"
  argument above depends on a deadline giving the stakes a natural climax
  instead of open-ended streak-anxiety — but neither `vision.md`'s current
  data model nor `architecture.md`'s `Pet`/`Card` schema has a goal date
  anywhere. Needs a decision, and a schema change if we want it (likely a
  `goalAt` on `Deck` or `Pet`).
- **What happens after the deadline passes?** If the pet just stops
  mattering once the exam is over, this is a single-use app per goal.
  Options worth considering: the pet evolves/graduates on a successful
  finish, gets "retired" into a collection, or the model resets cleanly for
  the next goal/deck.
