import { type RouterOutputs } from "~/trpc/react";

export type Species = "fox" | "owl" | "otter" | "bunny" | "hopling" | "twirlet";
export type LifeStage = "egg" | "child" | "teen" | "adult";
export type Screen = "home" | "decks" | "review" | "results" | "deckDetail";
export type Grade = "again" | "hard" | "good" | "easy";

export type DeckSummary = RouterOutputs["deck"]["list"][number];
export type ReviewCard = RouterOutputs["review"]["due"][number];
export type CardItem = RouterOutputs["card"]["listByDeck"][number];
export type RetiredPet = RouterOutputs["pet"]["village"][number];

export interface PetState {
  name: string;
  species: Species;
  health: number;
  streak: number;
  stage: LifeStage;
  growthPoints: number;
}

export interface SessionResults {
  correct: number;
  total: number;
  accuracy: number;
  healthDelta: number;
  celebrate: boolean;
  message: string;
}
