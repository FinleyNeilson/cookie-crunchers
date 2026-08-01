# Vision

## Pitch

Spaced repetition works, but nobody sticks with it — because the cost of
skipping a day is invisible. We made the cost visible: a creature that lives
or dies by whether you're actually keeping up with your reviews. Same
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
- **Bounded survival, not infinite streak.** Duolingo's streak model is
  actually a weakness — infinite maintenance leads to streak-anxiety and
  eventual abandonment. What got built instead of a calendar deadline: pet
  growth is paced by aggregate review consistency (see Core loop), and
  every pet's arc ends — in graduation or in death — immediately followed
  by a new one. That end-and-restart rhythm gives the stakes a climax
  without needing a user-set date. Whether an *optional* deadline should
  still sit on top of this pace is open — see open questions below.

## Core loop

The pet has two distinct axes, both driven by SRS data rather than
"studying in general":

- **Health** (0-100) — computed from overdue card count/age and recent
  accuracy. On-time, accurate reviews raise it; overdue cards decay it over
  time. This is the moment-to-moment "is my review queue healthy" readout.
  No daily-streak bonus feeds into this or anywhere else in the app, by
  design (see "Bounded survival, not infinite streak" above).
- **Growth/lifecycle** — the pet ages through stages (egg → child → teen →
  adult) based on aggregate review pace: cards contribute more growth the
  longer their SM-2 interval has stretched, so consistently-recalled cards
  age the pet faster than crammed ones. Reaching adulthood **graduates**
  the pet — it retires into the village (see Homepage below) and a new egg
  begins. If health stays at zero past a grace window, the pet instead
  **dies** — also retiring it and starting a new egg.

These are deliberately separate: a pet can be young-but-healthy, or
old-and-declining. Reviews come due on an SRS schedule per card (SM-2-style
intervals); accuracy and consistency are what move a pet toward graduation,
while overdue reviews are what put it at risk of dying.

The intent is that the pet becomes an emotionally legible proxy for "is my
review queue healthy," so the incentive to open the app and clear reviews is
stronger than a plain flashcard app's.

**This is the load-bearing constraint on the whole pitch:** the pet's fate
must track quality of recall, not just frequency of opening the app. If it's
just "opened app = pet fed," this is a streak counter with cuter art — the
differentiator only holds if survival is tied to actual retention
performance (cards being forgotten should visibly hurt the pet more than
cards being known). `architecture.md`'s pet state engine (accuracy +
overdue-age driving health, interval-maturity driving growth — not just a
login check) is what keeps this honest; any future change to either formula
should be checked against this bar.

## Why stats-derived-from-SRS (vs. a reward-layer pet)

We explicitly chose **stats-derived-from-SRS** over **currency-for-studying**.
A reward-layer pet (earn coins, spend on pet) decouples pet state from study
health — you could neglect reviews for a week and still have a happy, well-fed
pet from banked currency. Tying stats directly to SRS state keeps the pet
honest: it reflects your actual review debt.

## Homepage: the village

The home screen is a village: one living, active pet front and center, with
a growing background of small, clickable sprites for every pet that came
before it — graduated pets shown normally, pets that died shown as a ghost.
Clicking any of them opens that pet's history (name, species, how it ended).

This is what "graduation" from Core loop actually looks like in the UI:
success doesn't make the pet disappear, it becomes a permanent resident, so
the village visibly accumulates your track record over time — a trophy case
that fills in from real practice, not currency.

**Not yet built:** the original idea for this screen was a Club
Penguin-style map with fixed buildings/signs (a study hall, a place to
manage decks, a stats view, settings) doubling as in-scene navigation. That
hasn't been started — today, getting to Decks/Stats/etc. still goes through
the existing tab bar, not the village scene itself. Worth deciding whether
that's still wanted or whether the tab bar is fine long-term (see open
questions).

## Visual style reference

![Pet style reference](./assets/bunny.png)

Target look for the pet: flat two-tone illustration (navy outline/fill +
white body), thick uniform linework, minimal dot eyes with blush cheeks, a
simple rounded blob body with small stubby limbs. No shading/gradients or
fine detail — the style needs to read clearly at small sizes and hold up
across mood/lifecycle variations without needing a full redraw per state.
The `bunny`/`hopling`/`twirlet` species art (`docs/assets/`) hold to this
style; the `egg` and `ghost` sprites are more utilitarian placeholders and
don't fully match it yet.

## Platform

- **Web app first.** Primary target, build here first.
- **Mobile app is a stretch goal** if time allows — likely after the web MVP
  is solid, not in parallel. Framework choice for mobile (native vs.
  React Native/Flutter) is deferred until we get there.

## Open questions

These are unresolved and worth revisiting as the roadmap firms up. (Stat
model, pet death/recovery, pet-per-deck-vs-shared, and SRS algorithm choice
were open here previously — all now decided, see Core loop and
`architecture.md`.)

- Any social/multiplayer angle (comparing pets, sharing decks) or strictly
  single-player for v1?
- Do we want an optional user-set deadline layered on top of the
  pace-based growth model (e.g. "reach adult by your exam date"), or is
  organic pace the whole model? Not implemented today — growth is driven
  purely by aggregate review-interval maturity, not a calendar date.
- Should the village screen grow into the original fixed-building/sign
  navigation idea (study hall, decks, stats, settings as in-scene links),
  or is the existing tab bar the long-term nav?
- Is a mid-decline warning/rescue mechanic wanted before a pet dies (it
  currently has a silent grace window with no visible warning), or is a
  quiet death intentional?
