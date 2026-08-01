import {
  type Grade,
  type LifeStage,
  type Species,
} from "~/app/_components/pet-app/types";

// Palette sampled from the village background illustration
// (public/village-bg.png): royal-blue outline, sky-blue paper, sunshine
// gold, grass green, and pops of coral/rose — see that image for the
// source colors this is keyed off.
export const INK = "oklch(30% 0.11 260)";
export const PAPER = "oklch(94% 0.035 230)";
export const CARD_BG = "oklch(98% 0.03 90)";
export const CARD_LINE = "oklch(85% 0.05 250)";
export const TERRACOTTA = "oklch(70% 0.17 42)";
export const TERRACOTTA_DEEP = "oklch(54% 0.17 42)";
export const GOLDEN = "oklch(82% 0.15 97)";
export const LEAF = "oklch(64% 0.15 140)";

// Decks-screen-specific accents (matches the "Study" button and
// mastered/done state in the deck-card redesign).
export const MAROON = "oklch(34% 0.15 350)";
export const MASTERED_GREEN = "oklch(50% 0.13 140)";
export const MASTERED_GREEN_BG = "oklch(90% 0.07 140)";

export const STAGE_LABEL: Record<LifeStage, string> = {
  egg: "Egg",
  child: "Child",
  teen: "Teen",
  adult: "Adult",
};

export const STAGE_SIZE: Record<LifeStage, number> = {
  egg: 170,
  child: 90,
  teen: 120,
  adult: 150,
};

// Mirrors STAGE_THRESHOLDS in server/pet/growth.ts — needed here purely to
// render a "progress to next stage" bar; keep in sync if those change.
export const STAGE_GROWTH_FLOOR: Record<LifeStage, number> = {
  egg: 0,
  child: 1,
  teen: 3,
  adult: 8,
};
export const NEXT_STAGE: Record<LifeStage, LifeStage | null> = {
  egg: "child",
  child: "teen",
  teen: "adult",
  adult: null,
};

export const SPECIES: Record<Species, { label: string; color: string }> = {
  bunny: { label: "Bunny", color: INK },
  frog: { label: "Frog", color: LEAF },
  monkey: { label: "Monkey", color: TERRACOTTA_DEEP },
  oldman: { label: "Old Man", color: GOLDEN },
};

// Every species has hand-drawn sprite art — see PetFace in pet-visuals.tsx.
export const SPECIES_IMAGE: Record<Species, string> = {
  bunny: "/pets/bunny.svg",
  frog: "/pets/frog.svg",
  monkey: "/pets/monkey.svg",
  oldman: "/pets/oldman.svg",
};

// SM-2 quality grade (0-5) each review button maps to — see server/srs/sm2.ts.
export const GRADE_TO_SM2: Record<Grade, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
};

export const DECK_ACCENT_PALETTE: { bg: string; color: string }[] = [
  { bg: "oklch(90% 0.07 88)", color: "oklch(46% 0.1 85)" },
  { bg: "oklch(90% 0.08 20)", color: "oklch(45% 0.1 20)" },
  { bg: "oklch(88% 0.07 150)", color: "oklch(42% 0.08 150)" },
];
