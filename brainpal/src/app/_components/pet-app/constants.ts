import {
  type Grade,
  type LifeStage,
  type Species,
} from "~/app/_components/pet-app/types";

// Cozy palette, keyed off the hand-drawn pet sprites in docs/assets/: deep
// navy outline, warm cream paper, soft blush/butter/sage accents.
export const INK = "oklch(32% 0.08 255)";
export const PAPER = "oklch(96% 0.03 80)";
export const CARD_BG = "oklch(98% 0.02 80)";
export const CARD_LINE = "oklch(87% 0.04 75)";
export const TERRACOTTA = "oklch(66% 0.13 40)";
export const TERRACOTTA_DEEP = "oklch(50% 0.13 38)";
export const BUTTER_DEEP = "oklch(68% 0.12 88)";
export const SAGE_DEEP = "oklch(56% 0.09 150)";
export const BLUSH = "oklch(87% 0.07 25)";
export const GOLDEN = "oklch(76% 0.14 95)";
export const LEAF = "oklch(60% 0.11 140)";

// Decks-screen-specific accents (matches the "Study" button and
// mastered/done state in the deck-card redesign).
export const MAROON = "oklch(35% 0.11 25)";
export const MASTERED_GREEN = "oklch(52% 0.1 150)";
export const MASTERED_GREEN_BG = "oklch(91% 0.05 150)";

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
  fox: { label: "Fox", color: TERRACOTTA },
  owl: { label: "Owl", color: BUTTER_DEEP },
  otter: { label: "Otter", color: SAGE_DEEP },
  bunny: { label: "Bunny", color: INK },
  // Sprite art in public/pets/hopling.png: yellow, tall rabbit-like ears,
  // big round eyes — its own species, not a bunny variant.
  hopling: { label: "Hopling", color: GOLDEN },
  // Sprite art in public/pets/twirlet.png: peach, swept-back ear tufts,
  // curly antenna, green feet.
  twirlet: { label: "Twirlet", color: LEAF },
};

// Species with real sprite art (vs. the CSS-drawn fox/owl/otter faces).
export const SPECIES_IMAGE: Partial<Record<Species, string>> = {
  bunny: "/pets/bunny.png",
  hopling: "/pets/hopling.png",
  twirlet: "/pets/twirlet.png",
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
