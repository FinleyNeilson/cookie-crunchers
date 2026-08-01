"use client";

import { useState } from "react";

// Ported from the "Hatchly" design prototype (Pet-Powered Flashcard App.zip),
// restyled to the cozy sticker look in docs/assets/pet-style-reference.png
// (cream body, thick navy outline, blush cheeks). Mock data only — no
// persistence yet. This is the reference UI for the SRS-driven pet loop
// described in docs/vision.md.

type Species = "fox" | "owl" | "bunny" | "otter";
type Screen = "home" | "decks" | "review" | "results" | "stats";
type Grade = "again" | "hard" | "good" | "easy";

interface CardQA {
  q: string;
  a: string;
}

interface Deck {
  id: number;
  name: string;
  source: string;
  total: number;
  due: number;
  cards: CardQA[];
}

interface PetState {
  name: string;
  species: Species;
  xp: number;
  happiness: number;
  energy: number;
  fullness: number;
  streak: number;
  accessories: string[];
}

interface SessionResults {
  correct: number;
  total: number;
  accuracy: number;
  xpGained: number;
  leveledUp: boolean;
  newAccessory: string | null;
  celebrate: boolean;
  message: string;
}

// Cozy palette, keyed off docs/assets/pet-style-reference.png: deep navy
// outline, warm cream paper, soft blush/butter/sage accents.
const INK = "oklch(32% 0.08 255)";
const PAPER = "oklch(96% 0.03 80)";
const CARD_BG = "oklch(98% 0.02 80)";
const CARD_LINE = "oklch(87% 0.04 75)";
const TERRACOTTA = "oklch(66% 0.13 40)";
const TERRACOTTA_DEEP = "oklch(50% 0.13 38)";
const BUTTER_DEEP = "oklch(68% 0.12 88)";
const SAGE_DEEP = "oklch(56% 0.09 150)";
const BLUSH = "oklch(87% 0.07 25)";

const SPECIES: Record<Species, { label: string; color: string }> = {
  fox: { label: "Fox", color: TERRACOTTA },
  owl: { label: "Owl", color: BUTTER_DEEP },
  bunny: { label: "Bunny", color: INK },
  otter: { label: "Otter", color: SAGE_DEEP },
};

function stageForXp(xp: number) {
  if (xp < 20) return { key: "egg", label: "Egg", size: 0 };
  if (xp < 60) return { key: "hatchling", label: "Hatchling", size: 90 };
  if (xp < 150) return { key: "juvenile", label: "Juvenile", size: 120 };
  return { key: "adult", label: "Adult", size: 150 };
}

const MOCK_DECKS: Deck[] = [
  {
    id: 1,
    name: "Cell Biology — Ch.4",
    source: "Uploaded slides",
    total: 42,
    due: 12,
    cards: [
      {
        q: "What organelle produces most of a cell's ATP?",
        a: "The mitochondrion.",
      },
      {
        q: "What is the semi-fluid substance inside the cell membrane called?",
        a: "Cytoplasm.",
      },
      {
        q: "Which structure controls what enters and exits the cell?",
        a: "The cell membrane (plasma membrane).",
      },
      {
        q: "What process do plant cells use to convert light into energy?",
        a: "Photosynthesis.",
      },
      { q: "What organelle contains the cell's DNA?", a: "The nucleus." },
    ],
  },
  {
    id: 2,
    name: "Spanish Vocab: Travel",
    source: "Created by you",
    total: 30,
    due: 6,
    cards: [
      { q: '"El aeropuerto"', a: "The airport." },
      {
        q: '"¿Dónde está la estación de tren?"',
        a: "Where is the train station?",
      },
      { q: '"Una maleta"', a: "A suitcase." },
      { q: '"Reservar una habitación"', a: "To book a room." },
    ],
  },
  {
    id: 3,
    name: "Organic Chem Reactions",
    source: "Uploaded slides",
    total: 55,
    due: 0,
    cards: [
      {
        q: "What type of reaction adds atoms across a double bond?",
        a: "An addition reaction.",
      },
      {
        q: "What is produced when an alcohol is oxidized fully?",
        a: "A carboxylic acid (via an aldehyde).",
      },
    ],
  },
];

const XP_MAP: Record<Grade, number> = { again: 2, hard: 6, good: 12, easy: 16 };
const HAPPINESS_MAP: Record<Grade, number> = {
  again: -8,
  hard: 1,
  good: 4,
  easy: 6,
};
const ENERGY_MAP: Record<Grade, number> = {
  again: -5,
  hard: 1,
  good: 3,
  easy: 4,
};
const FULLNESS_MAP: Record<Grade, number> = {
  again: -10,
  hard: 2,
  good: 5,
  easy: 6,
};

const DECK_ACCENTS: Record<number, { bg: string; color: string }> = {
  1: { bg: "oklch(90% 0.07 88)", color: "oklch(46% 0.1 85)" },
  2: { bg: "oklch(90% 0.08 20)", color: "oklch(45% 0.1 20)" },
  3: { bg: "oklch(88% 0.07 150)", color: "oklch(42% 0.08 150)" },
};

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function PetApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [toastMsg, setToastMsg] = useState<string | false>(false);
  const [decks, setDecks] = useState<Deck[]>(MOCK_DECKS);
  const [reviewDeckId, setReviewDeckId] = useState<number | null>(null);
  const [reviewCards, setReviewCards] = useState<CardQA[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [results, setResults] = useState<SessionResults | null>(null);
  const [pet, setPet] = useState<PetState>({
    name: "Ember",
    species: "fox",
    xp: 65,
    happiness: 72,
    energy: 58,
    fullness: 60,
    streak: 6,
    accessories: ["bow"],
  });

  function toast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(false), 2200);
  }

  function startReview(deckId: number) {
    const deck = decks.find((d) => d.id === deckId);
    if (!deck || deck.due === 0) return;
    const cards = deck.cards.slice(
      0,
      Math.max(1, Math.min(deck.due, deck.cards.length)),
    );
    setReviewDeckId(deckId);
    setReviewCards(cards);
    setReviewIndex(0);
    setFlipped(false);
    setSessionCorrect(0);
    setSessionTotal(0);
    setSessionXp(0);
    setScreen("review");
  }

  function goStudyNow() {
    const target = decks.find((d) => d.due > 0);
    if (target) startReview(target.id);
    else toast("All caught up — no cards due right now!");
  }

  function grade(quality: Grade) {
    const correct = quality !== "again";
    const prevStage = stageForXp(pet.xp).key;
    const newXp = pet.xp + XP_MAP[quality];
    const newStage = stageForXp(newXp).key;
    const leveledUp = newStage !== prevStage;

    const nextPet: PetState = {
      ...pet,
      xp: newXp,
      happiness: clamp(pet.happiness + HAPPINESS_MAP[quality]),
      energy: clamp(pet.energy + ENERGY_MAP[quality]),
      fullness: clamp(pet.fullness + FULLNESS_MAP[quality]),
    };

    const newSessionCorrect = sessionCorrect + (correct ? 1 : 0);
    const newSessionTotal = sessionTotal + 1;
    const newSessionXp = sessionXp + XP_MAP[quality];
    const nextIndex = reviewIndex + 1;

    if (nextIndex >= reviewCards.length) {
      const accuracy = Math.round((newSessionCorrect / newSessionTotal) * 100);
      let newAccessory: string | null = null;
      const accessories = [...nextPet.accessories];
      if (
        leveledUp &&
        newStage === "juvenile" &&
        !accessories.includes("bow")
      ) {
        accessories.push("bow");
        newAccessory = "Bow";
      }
      if (leveledUp && newStage === "adult" && !accessories.includes("scarf")) {
        accessories.push("scarf");
        newAccessory = "Scarf";
      }

      setDecks((prev) =>
        prev.map((d) =>
          d.id === reviewDeckId
            ? { ...d, due: Math.max(0, d.due - newSessionTotal) }
            : d,
        ),
      );

      const message =
        accuracy >= 80
          ? `${nextPet.name} is thriving! Great study session.`
          : accuracy >= 50
            ? `${nextPet.name} appreciates the effort — keep it up.`
            : `${nextPet.name} needs a bit more practice tomorrow.`;

      setPet({ ...nextPet, accessories, streak: nextPet.streak + 1 });
      setResults({
        correct: newSessionCorrect,
        total: newSessionTotal,
        accuracy,
        xpGained: newSessionXp,
        leveledUp,
        newAccessory,
        celebrate: accuracy >= 60,
        message,
      });
      setScreen("results");
    } else {
      setPet(nextPet);
      setSessionCorrect(newSessionCorrect);
      setSessionTotal(newSessionTotal);
      setSessionXp(newSessionXp);
      setReviewIndex(nextIndex);
      setFlipped(false);
    }
  }

  const speciesInfo = SPECIES[pet.species];
  const stage = stageForXp(pet.xp);
  const totalDue = decks.reduce((sum, d) => sum + d.due, 0);
  const mood =
    pet.happiness >= 55 ? "happy" : pet.happiness >= 30 ? "neutral" : "sad";
  const isNeglected = pet.fullness < 30 || pet.happiness < 30;

  const deckCards = decks.map((d) => {
    const accent = DECK_ACCENTS[d.id] ?? DECK_ACCENTS[1]!;
    const progressPct = Math.round(((d.total - d.due) / d.total) * 100);
    return {
      deck: d,
      progressPct,
      dueLabel: d.due > 0 ? `${d.due} due` : "All done",
      badgeBg: d.due > 0 ? accent.bg : "oklch(90% 0.015 150)",
      badgeColor: d.due > 0 ? accent.color : "oklch(42% 0.05 150)",
      studyDisabled: d.due === 0,
      studyBtnBg: d.due > 0 ? accent.color : "oklch(91% 0.02 80)",
      studyBtnColor:
        d.due > 0 ? "oklch(98% 0.01 90)" : "oklch(50% 0.03 255 / 0.5)",
      studyBtnLabel: d.due > 0 ? "Study" : "Caught up",
    };
  });

  const currentCard = reviewCards[reviewIndex];
  const accuracySeries = [62, 70, 58, 80, 75, 90, 84];
  const weeklyAccuracy = Math.round(
    accuracySeries.reduce((a, b) => a + b, 0) / accuracySeries.length,
  );
  const heatmap = Array.from({ length: 28 }, (_, i) => {
    const level = [0, 1, 1, 2, 3, 2, 1][i % 7]! + (i % 5 === 0 ? 1 : 0);
    const shades = [
      "oklch(93% 0.02 80)",
      "oklch(85% 0.07 55)",
      "oklch(75% 0.11 45)",
      "oklch(58% 0.13 40)",
    ];
    return shades[Math.min(level, 3)]!;
  });

  const stages = [
    { key: "egg", initial: "E", label: "Egg" },
    { key: "hatchling", initial: "H", label: "Hatch" },
    { key: "juvenile", initial: "J", label: "Juvenile" },
    { key: "adult", initial: "A", label: "Adult" },
  ];
  const stageOrder = ["egg", "hatchling", "juvenile", "adult"];
  const currentStageIdx = stageOrder.indexOf(stage.key);
  const timeline = stages.map((t, i) => ({
    ...t,
    bg: i <= currentStageIdx ? speciesInfo.color : "oklch(92% 0.02 80)",
    color:
      i <= currentStageIdx ? "oklch(98% 0.01 90)" : "oklch(60% 0.03 255 / 0.5)",
  }));
  const accessoryLabels: Record<string, string> = {
    bow: "Bow",
    scarf: "Scarf",
  };

  const navItems: { key: Screen; label: string }[] = [
    { key: "home", label: "Village" },
    { key: "decks", label: "Decks" },
    { key: "stats", label: "Progress" },
  ];

  const half = Math.ceil(deckCards.length / 2);
  const leftHuts = deckCards.slice(0, half);
  const rightHuts = deckCards.slice(half);

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "'Nunito', sans-serif",
        color: INK,
        background: screen === "home" ? "oklch(90% 0.05 95)" : PAPER,
      }}
    >
      {/* TOP NAV */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "12px 24px",
          background: "oklch(98% 0.02 80 / 0.85)",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${CARD_LINE}`,
        }}
      >
        <div
          style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            fontSize: 21,
            color: INK,
            whiteSpace: "nowrap",
          }}
        >
          🥚 Hatchly
        </div>
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "oklch(94% 0.03 80)",
            padding: 4,
            borderRadius: 16,
          }}
        >
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setScreen(item.key)}
              style={{
                border: "none",
                background:
                  screen === item.key ? "oklch(88% 0.08 40)" : "transparent",
                color:
                  screen === item.key
                    ? TERRACOTTA_DEEP
                    : "oklch(45% 0.04 255 / 0.65)",
                padding: "9px 16px",
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "oklch(90% 0.09 55)",
            padding: "8px 14px",
            borderRadius: 14,
            whiteSpace: "nowrap",
          }}
        >
          <div
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "oklch(70% 0.15 45)",
              flexShrink: 0,
            }}
          />
          <div style={{ fontWeight: 800, fontSize: 13 }}>
            {pet.streak}-day streak
          </div>
        </div>
      </div>

      {toastMsg && (
        <div
          style={{
            position: "fixed",
            top: 76,
            right: 40,
            zIndex: 50,
            background: INK,
            color: "oklch(98% 0.01 90)",
            padding: "12px 20px",
            borderRadius: 16,
            fontWeight: 700,
            fontSize: 14,
            boxShadow: "0 6px 20px oklch(30% 0.05 60 / 0.25)",
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* VILLAGE (home) */}
      {screen === "home" && (
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(180deg, oklch(92% 0.05 70) 0%, oklch(93% 0.04 82) 40%, oklch(91% 0.05 95) 68%)",
            paddingBottom: 56,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 36,
              right: 64,
              width: 84,
              height: 84,
              borderRadius: "50%",
              background: "oklch(88% 0.13 90)",
              boxShadow: "0 0 60px oklch(88% 0.13 90 / 0.55)",
            }}
          />
          <Cloud top={64} left="8%" scale={1} />
          <Cloud top={112} left="58%" scale={0.7} />
          <Cloud top={38} left="34%" scale={0.5} />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              padding: "22px 28px 0",
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              fontSize: 26,
            }}
          >
            Good to see you
          </div>
          <div
            style={{
              position: "relative",
              zIndex: 1,
              padding: "2px 28px 0",
              fontSize: 15,
              color: "oklch(40% 0.05 60 / 0.75)",
            }}
          >
            Keep {pet.name} happy today by clearing your reviews.
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "-10%",
              width: "120%",
              height: 300,
              borderRadius: "50% 50% 0 0",
              background:
                "linear-gradient(180deg, oklch(80% 0.09 140), oklch(70% 0.1 140))",
              boxShadow: "inset 0 14px 0 oklch(86% 0.08 140 / 0.55)",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 32,
              flexWrap: "wrap",
              paddingTop: 70,
              minHeight: 360,
            }}
          >
            {leftHuts.map(
              ({ deck, dueLabel, badgeColor, badgeBg, studyDisabled }) => (
                <Hut
                  key={deck.id}
                  name={deck.name}
                  dueLabel={dueLabel}
                  hasDue={!studyDisabled}
                  accentColor={badgeColor}
                  accentBg={badgeBg}
                  onClick={() => startReview(deck.id)}
                />
              ),
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 190,
                  height: 190,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "petBounce 2.6s ease-in-out infinite",
                }}
              >
                {stage.key === "egg" ? (
                  <Egg />
                ) : (
                  <PetFace
                    species={pet.species}
                    color={speciesInfo.color}
                    size={stage.size}
                    hasBow={pet.accessories.includes("bow")}
                    mood={mood}
                  />
                )}
              </div>
              <div
                style={{
                  textAlign: "center",
                  marginTop: 4,
                  background: "oklch(98% 0.02 80 / 0.9)",
                  padding: "6px 14px",
                  borderRadius: 14,
                  border: `2px solid ${CARD_LINE}`,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  {pet.name} the {speciesInfo.label}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "oklch(48% 0.04 255 / 0.65)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {stage.label} · {pet.xp} XP
                </div>
              </div>
            </div>

            {rightHuts.map(
              ({ deck, dueLabel, badgeColor, badgeBg, studyDisabled }) => (
                <Hut
                  key={deck.id}
                  name={deck.name}
                  dueLabel={dueLabel}
                  hasDue={!studyDisabled}
                  accentColor={badgeColor}
                  accentBg={badgeBg}
                  onClick={() => startReview(deck.id)}
                />
              ),
            )}
          </div>

          <div
            style={{
              position: "relative",
              zIndex: 3,
              maxWidth: 520,
              margin: "-24px auto 0",
              background: CARD_BG,
              borderRadius: 28,
              padding: "26px 26px 24px",
              border: `2px solid ${CARD_LINE}`,
              boxShadow: "0 14px 34px oklch(35% 0.05 60 / 0.16)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <StatBar label="Happiness" value={pet.happiness} hue={20} />
              <StatBar label="Energy" value={pet.energy} hue={150} />
              <StatBar label="Fullness" value={pet.fullness} hue={88} />
            </div>

            {isNeglected && (
              <div
                style={{
                  marginTop: 16,
                  background: "oklch(90% 0.06 40)",
                  color: "oklch(36% 0.09 35)",
                  fontWeight: 700,
                  fontSize: 13,
                  padding: "10px 12px",
                  borderRadius: 14,
                  textAlign: "center",
                }}
              >
                {pet.name} feels neglected — study today to cheer them up.
              </div>
            )}

            <button
              onClick={goStudyNow}
              style={{
                marginTop: 18,
                width: "100%",
                padding: 15,
                border: "none",
                borderRadius: 18,
                background: TERRACOTTA,
                color: "oklch(98% 0.01 90)",
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
                boxShadow: "0 8px 20px oklch(66% 0.13 40 / 0.35)",
              }}
            >
              Study now — {totalDue} due
            </button>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,minmax(0,1fr))",
                gap: 12,
                marginTop: 18,
              }}
            >
              <StatTile value={decks.length} label="Decks" />
              <StatTile value={pet.accessories.length} label="Accessories" />
              <StatTile value={`${weeklyAccuracy}%`} label="7-day accuracy" />
            </div>
          </div>
        </div>
      )}

      {/* OTHER SCREENS */}
      <div
        style={{
          padding: screen === "home" ? 0 : "32px clamp(20px,4vw,56px) 48px",
          maxWidth: 1120,
          margin: "0 auto",
        }}
      >
        {screen === "decks" && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  fontFamily: "'Baloo 2', sans-serif",
                  fontWeight: 800,
                  fontSize: 30,
                }}
              >
                Your Decks
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => toast("Deck builder coming soon!")}
                  style={{
                    padding: "12px 20px",
                    border: "none",
                    borderRadius: 16,
                    background: "oklch(87% 0.07 150)",
                    color: "oklch(32% 0.06 150)",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  + New deck
                </button>
                <button
                  onClick={() => toast("Slide upload coming soon!")}
                  style={{
                    padding: "12px 20px",
                    border: "none",
                    borderRadius: 16,
                    background: "oklch(88% 0.07 88)",
                    color: "oklch(38% 0.08 85)",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  ↑ Upload slides
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                gap: 18,
                marginTop: 26,
              }}
            >
              {deckCards.map(
                ({
                  deck,
                  progressPct,
                  dueLabel,
                  badgeBg,
                  badgeColor,
                  studyDisabled,
                  studyBtnBg,
                  studyBtnColor,
                  studyBtnLabel,
                }) => (
                  <div
                    key={deck.id}
                    style={{
                      background: CARD_BG,
                      borderRadius: 22,
                      padding: 22,
                      border: `2px solid ${CARD_LINE}`,
                      boxShadow: "0 6px 18px oklch(35% 0.05 60 / 0.08)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "'Baloo 2', sans-serif",
                            fontWeight: 700,
                            fontSize: 17,
                          }}
                        >
                          {deck.name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "oklch(48% 0.04 255 / 0.6)",
                            marginTop: 2,
                          }}
                        >
                          {deck.source} · {deck.total} cards
                        </div>
                      </div>
                      <div
                        style={{
                          background: badgeBg,
                          color: badgeColor,
                          fontWeight: 800,
                          fontSize: 12,
                          padding: "4px 10px",
                          borderRadius: 12,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {dueLabel}
                      </div>
                    </div>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 5,
                        background: "oklch(91% 0.02 80)",
                        marginTop: 16,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${progressPct}%`,
                          background: badgeColor,
                          borderRadius: 5,
                        }}
                      />
                    </div>
                    <button
                      onClick={() => startReview(deck.id)}
                      disabled={studyDisabled}
                      style={{
                        marginTop: 16,
                        width: "100%",
                        padding: 12,
                        border: "none",
                        borderRadius: 14,
                        background: studyBtnBg,
                        color: studyBtnColor,
                        fontWeight: 800,
                        fontSize: 14,
                        cursor: studyDisabled ? "default" : "pointer",
                      }}
                    >
                      {studyBtnLabel}
                    </button>
                  </div>
                ),
              )}
            </div>
          </>
        )}

        {screen === "review" && (
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => setScreen("decks")}
                style={{
                  border: "none",
                  background: "oklch(91% 0.02 80)",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: "pointer",
                  color: INK,
                }}
              >
                ←
              </button>
              <div
                style={{
                  flex: 1,
                  height: 10,
                  borderRadius: 6,
                  background: "oklch(91% 0.02 80)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${reviewCards.length ? Math.round((reviewIndex / reviewCards.length) * 100) : 0}%`,
                    background: TERRACOTTA,
                    borderRadius: 6,
                    transition: "width 0.3s",
                  }}
                />
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 13,
                  color: "oklch(48% 0.04 255 / 0.6)",
                  whiteSpace: "nowrap",
                }}
              >
                {currentCard
                  ? `${reviewIndex + 1} / ${reviewCards.length}`
                  : ""}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 22,
              }}
            >
              <div style={{ width: 78, height: 78 }}>
                <PetFace
                  species={pet.species}
                  color={speciesInfo.color}
                  size={78}
                  hasBow={pet.accessories.includes("bow")}
                  mood={mood}
                />
              </div>
            </div>

            <div
              onClick={() => setFlipped((f) => !f)}
              style={{
                marginTop: 18,
                minHeight: 280,
                background: CARD_BG,
                borderRadius: 28,
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                border: `2px solid ${CARD_LINE}`,
                boxShadow: "0 12px 30px oklch(35% 0.05 60 / 0.12)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "oklch(48% 0.04 255 / 0.5)",
                  marginBottom: 16,
                }}
              >
                {flipped ? "Answer" : "Question"}
              </div>
              <div
                style={{
                  fontFamily: "'Baloo 2', sans-serif",
                  fontWeight: 700,
                  fontSize: 22,
                  lineHeight: 1.4,
                }}
              >
                {currentCard ? (flipped ? currentCard.a : currentCard.q) : ""}
              </div>
              {!flipped && (
                <div
                  style={{
                    marginTop: 20,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "oklch(48% 0.04 255 / 0.4)",
                  }}
                >
                  Click to reveal answer
                </div>
              )}
            </div>

            {flipped && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: 10,
                  marginTop: 18,
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    grade("again");
                  }}
                  style={{
                    padding: 16,
                    border: "none",
                    borderRadius: 16,
                    background: "oklch(87% 0.09 20)",
                    color: "oklch(34% 0.1 20)",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Again
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    grade("hard");
                  }}
                  style={{
                    padding: 16,
                    border: "none",
                    borderRadius: 16,
                    background: "oklch(88% 0.08 60)",
                    color: "oklch(36% 0.09 55)",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Hard
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    grade("good");
                  }}
                  style={{
                    padding: 16,
                    border: "none",
                    borderRadius: 16,
                    background: "oklch(87% 0.08 150)",
                    color: "oklch(34% 0.08 150)",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Good
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    grade("easy");
                  }}
                  style={{
                    padding: 16,
                    border: "none",
                    borderRadius: 16,
                    background: "oklch(88% 0.08 88)",
                    color: "oklch(38% 0.09 85)",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Easy
                </button>
              </div>
            )}
          </div>
        )}

        {screen === "results" && results && (
          <div
            style={{
              maxWidth: 480,
              margin: "20px auto 0",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 800,
                fontSize: 28,
              }}
            >
              Session complete!
            </div>
            <div
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                margin: "24px 0",
              }}
            >
              {results.celebrate && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      top: -6,
                      left: "28%",
                      width: 10,
                      height: 10,
                      background: TERRACOTTA,
                      borderRadius: "50%",
                      animation: "sparklePulse 1.4s ease-in-out infinite",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 4,
                      right: "26%",
                      width: 8,
                      height: 8,
                      background: "oklch(80% 0.11 60)",
                      borderRadius: "50%",
                      animation: "sparklePulse 1.4s ease-in-out infinite 0.3s",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 6,
                      left: "22%",
                      width: 7,
                      height: 7,
                      background: "oklch(78% 0.1 150)",
                      borderRadius: "50%",
                      animation: "sparklePulse 1.4s ease-in-out infinite 0.6s",
                    }}
                  />
                </>
              )}
              <div
                style={{
                  width: 130,
                  height: 130,
                  animation: "petBounce 1.8s ease-in-out infinite",
                }}
              >
                <PetFace
                  species={pet.species}
                  color={speciesInfo.color}
                  size={130}
                  hasBow={pet.accessories.includes("bow")}
                  mood="happy"
                />
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              {results.message}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
              <ResultTile value={`${results.accuracy}%`} label="Accuracy" />
              <ResultTile value={`+${results.xpGained}`} label="XP gained" />
              <ResultTile value={pet.streak} label="Day streak" />
            </div>

            {results.leveledUp && (
              <div
                style={{
                  marginTop: 18,
                  background: "oklch(89% 0.08 40)",
                  color: TERRACOTTA_DEEP,
                  fontWeight: 800,
                  fontSize: 14,
                  padding: 14,
                  borderRadius: 16,
                }}
              >
                ✨ {pet.name} evolved into a {stage.label}!
              </div>
            )}
            {results.newAccessory && (
              <div
                style={{
                  marginTop: 18,
                  background: "oklch(90% 0.08 45)",
                  color: "oklch(32% 0.08 45)",
                  fontWeight: 800,
                  fontSize: 14,
                  padding: 14,
                  borderRadius: 16,
                }}
              >
                🎁 New accessory unlocked: {results.newAccessory}!
              </div>
            )}

            <button
              onClick={() => setScreen("home")}
              style={{
                marginTop: 26,
                width: "100%",
                padding: 16,
                border: "none",
                borderRadius: 20,
                background: TERRACOTTA,
                color: "oklch(98% 0.01 90)",
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              Back to {pet.name}
            </button>
          </div>
        )}

        {screen === "stats" && (
          <>
            <div
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 800,
                fontSize: 30,
              }}
            >
              Progress
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,1fr)",
                gap: 18,
                marginTop: 24,
              }}
            >
              <StatTile value={pet.streak} label="Day streak" big />
              <StatTile
                value={`${weeklyAccuracy}%`}
                label="7-day accuracy"
                big
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                marginTop: 24,
                alignItems: "start",
              }}
            >
              <div
                style={{
                  background: CARD_BG,
                  borderRadius: 22,
                  padding: 22,
                  border: `2px solid ${CARD_LINE}`,
                  boxShadow: "0 4px 14px oklch(35% 0.05 60 / 0.06)",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 15 }}>
                  Study activity — last 4 weeks
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7,1fr)",
                    gap: 6,
                    marginTop: 14,
                  }}
                >
                  {heatmap.map((bg, i) => (
                    <div
                      key={i}
                      style={{
                        aspectRatio: "1",
                        borderRadius: 6,
                        background: bg,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div
                style={{
                  background: CARD_BG,
                  borderRadius: 22,
                  padding: 22,
                  border: `2px solid ${CARD_LINE}`,
                  boxShadow: "0 4px 14px oklch(35% 0.05 60 / 0.06)",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 15 }}>
                  Accuracy — last 7 sessions
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 8,
                    height: 100,
                    marginTop: 16,
                  }}
                >
                  {accuracySeries.map((pct, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${pct}%`,
                        background: "oklch(70% 0.11 88)",
                        borderRadius: "6px 6px 3px 3px",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                marginTop: 20,
              }}
            >
              <div
                style={{
                  background: CARD_BG,
                  borderRadius: 22,
                  padding: 22,
                  border: `2px solid ${CARD_LINE}`,
                  boxShadow: "0 4px 14px oklch(35% 0.05 60 / 0.06)",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 15 }}>
                  Growth timeline
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 16,
                  }}
                >
                  {timeline.map((t) => (
                    <div
                      key={t.key}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          background: t.bg,
                          color: t.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: 13,
                        }}
                      >
                        {t.initial}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "oklch(48% 0.04 255 / 0.55)",
                        }}
                      >
                        {t.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  background: CARD_BG,
                  borderRadius: 22,
                  padding: 22,
                  border: `2px solid ${CARD_LINE}`,
                  boxShadow: "0 4px 14px oklch(35% 0.05 60 / 0.06)",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 15 }}>Accessories</div>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 14,
                    flexWrap: "wrap",
                  }}
                >
                  {pet.accessories.map((a) => (
                    <div
                      key={a}
                      style={{
                        background: "oklch(94% 0.03 80)",
                        borderRadius: 14,
                        padding: "10px 14px",
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {accessoryLabels[a] ?? a}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Cloud({
  top,
  left,
  scale = 1,
}: {
  top: number;
  left: string;
  scale?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width: 70 * scale,
        height: 26 * scale,
        borderRadius: 999,
        background: "oklch(98% 0.02 80 / 0.9)",
        boxShadow: `-${18 * scale}px ${4 * scale}px 0 -${2 * scale}px oklch(98% 0.02 80 / 0.9), ${18 * scale}px ${4 * scale}px 0 -${4 * scale}px oklch(98% 0.02 80 / 0.75)`,
        animation: "cloudDrift 10s ease-in-out infinite",
      }}
    />
  );
}

function Hut({
  name,
  dueLabel,
  hasDue,
  accentColor,
  accentBg,
  onClick,
}: {
  name: string;
  dueLabel: string;
  hasDue: boolean;
  accentColor: string;
  accentBg: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!hasDue}
      style={{
        background: "transparent",
        border: "none",
        cursor: hasDue ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        width: 96,
        padding: 0,
      }}
    >
      <div style={{ position: "relative" }}>
        {hasDue && (
          <div
            style={{
              position: "absolute",
              top: -10,
              right: -4,
              zIndex: 1,
              background: accentColor,
              color: "oklch(98% 0.01 90)",
              fontWeight: 800,
              fontSize: 11,
              padding: "3px 8px",
              borderRadius: 999,
              whiteSpace: "nowrap",
              border: `2px solid ${CARD_BG}`,
              boxShadow: "0 3px 8px oklch(35% 0.05 60 / 0.25)",
            }}
          >
            {dueLabel}
          </div>
        )}
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "34px solid transparent",
            borderRight: "34px solid transparent",
            borderBottom: `28px solid ${accentColor}`,
            margin: "0 auto",
            filter: `drop-shadow(0 2px 0 ${INK})`,
          }}
        />
        <div
          style={{
            width: 62,
            height: 46,
            background: hasDue ? CARD_BG : "oklch(90% 0.015 80)",
            borderRadius: "4px 4px 10px 10px",
            margin: "-2px auto 0",
            border: `3px solid ${INK}`,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 16,
              height: 24,
              background: hasDue ? accentColor : "oklch(80% 0.02 80)",
              border: `2px solid ${INK}`,
              borderBottom: "none",
              borderRadius: "3px 3px 0 0",
            }}
          />
        </div>
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "oklch(40% 0.05 255 / 0.8)",
          textAlign: "center",
          lineHeight: 1.2,
          maxWidth: 92,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </div>
    </button>
  );
}

function StatBar({
  label,
  value,
  hue,
}: {
  label: string;
  value: number;
  hue: number;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 4,
        }}
      >
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 6,
          background: `oklch(91% 0.03 ${hue})`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: `oklch(68% 0.13 ${hue})`,
            borderRadius: 6,
            transition: "width 0.5s",
          }}
        />
      </div>
    </div>
  );
}

function StatTile({
  value,
  label,
  big,
}: {
  value: string | number;
  label: string;
  big?: boolean;
}) {
  return (
    <div
      style={{
        background: "oklch(94% 0.03 80)",
        borderRadius: big ? 20 : 20,
        padding: big ? 20 : 18,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 800,
          fontSize: big ? 26 : 24,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "oklch(48% 0.04 255 / 0.6)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function ResultTile({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: CARD_BG,
        borderRadius: 18,
        padding: 16,
        border: `2px solid ${CARD_LINE}`,
      }}
    >
      <div
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 800,
          fontSize: 22,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "oklch(48% 0.04 255 / 0.55)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Egg() {
  return (
    <div
      style={{
        width: 108,
        height: 140,
        borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
        background: CARD_BG,
        border: `4px solid ${INK}`,
        position: "relative",
        animation: "crackShake 3s ease-in-out infinite",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "20%",
          width: "60%",
          height: 3,
          background: INK,
          opacity: 0.55,
          transform: "rotate(-8deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "55%",
          left: "35%",
          width: "40%",
          height: 3,
          background: INK,
          opacity: 0.55,
          transform: "rotate(12deg)",
        }}
      />
    </div>
  );
}

function Paw({ style }: { style: React.CSSProperties }) {
  return (
    <div
      style={{
        position: "absolute",
        background: CARD_BG,
        border: `3px solid ${INK}`,
        ...style,
      }}
    />
  );
}

function PetFace({
  species,
  color,
  size,
  hasBow,
  mood,
}: {
  species: Species;
  color: string;
  size: number;
  hasBow: boolean;
  mood: "happy" | "neutral" | "sad";
}) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* stubby paws, peeking out from behind the body */}
      <Paw
        style={{
          width: "24%",
          height: "30%",
          left: "-9%",
          top: "46%",
          borderRadius: "50% 50% 50% 20%",
        }}
      />
      <Paw
        style={{
          width: "24%",
          height: "30%",
          right: "-9%",
          top: "46%",
          borderRadius: "50% 50% 20% 50%",
        }}
      />
      <Paw
        style={{
          width: "24%",
          height: "26%",
          left: "14%",
          bottom: "-13%",
          borderRadius: "50% 50% 45% 45%",
        }}
      />
      <Paw
        style={{
          width: "24%",
          height: "26%",
          right: "14%",
          bottom: "-13%",
          borderRadius: "50% 50% 45% 45%",
        }}
      />

      {/* species cap / ears, in the accent color */}
      {species === "fox" && (
        <>
          <div
            style={{
              position: "absolute",
              top: "-10%",
              left: "8%",
              width: "26%",
              height: "36%",
              background: color,
              border: `3px solid ${INK}`,
              borderRadius: "60% 40% 60% 10%",
              transform: "rotate(-15deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "-10%",
              right: "8%",
              width: "26%",
              height: "36%",
              background: color,
              border: `3px solid ${INK}`,
              borderRadius: "40% 60% 10% 60%",
              transform: "rotate(15deg)",
            }}
          />
        </>
      )}
      {species === "owl" && (
        <>
          <div
            style={{
              position: "absolute",
              top: "-4%",
              left: "12%",
              width: "22%",
              height: "24%",
              background: color,
              border: `3px solid ${INK}`,
              borderRadius: "60% 60% 40% 40%",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "-4%",
              right: "12%",
              width: "22%",
              height: "24%",
              background: color,
              border: `3px solid ${INK}`,
              borderRadius: "60% 60% 40% 40%",
            }}
          />
        </>
      )}
      {species === "bunny" && (
        <>
          <div
            style={{
              position: "absolute",
              top: "-42%",
              left: "18%",
              width: "18%",
              height: "52%",
              background: color,
              border: `3px solid ${INK}`,
              borderRadius: "50% 50% 20% 20%",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "-42%",
              right: "18%",
              width: "18%",
              height: "52%",
              background: color,
              border: `3px solid ${INK}`,
              borderRadius: "50% 50% 20% 20%",
            }}
          />
        </>
      )}
      {species === "otter" && (
        <>
          <div
            style={{
              position: "absolute",
              top: "-2%",
              left: "10%",
              width: "18%",
              height: "18%",
              background: color,
              border: `3px solid ${INK}`,
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "-2%",
              right: "10%",
              width: "18%",
              height: "18%",
              background: color,
              border: `3px solid ${INK}`,
              borderRadius: "50%",
            }}
          />
        </>
      )}

      {/* cream body, thick navy outline */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: CARD_BG,
          border: `4px solid ${INK}`,
          borderRadius: "50%",
        }}
      />
      {/* cap band across the top of the head, tying the ears together */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "8%",
          right: "8%",
          height: "34%",
          background: color,
          border: `3px solid ${INK}`,
          borderBottom: "none",
          borderRadius: "50% 50% 0 0",
          clipPath: "inset(0 0 40% 0)",
        }}
      />

      {hasBow && (
        <div
          style={{
            position: "absolute",
            top: "-8%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "22%",
            height: "16%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "9px solid transparent",
              borderBottom: "9px solid transparent",
              borderRight: `14px solid ${BLUSH}`,
            }}
          />
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: BLUSH,
              border: `2px solid ${INK}`,
              margin: "0 -2px",
            }}
          />
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "9px solid transparent",
              borderBottom: "9px solid transparent",
              borderLeft: `14px solid ${BLUSH}`,
            }}
          />
        </div>
      )}

      {/* blush cheeks */}
      <div
        style={{
          position: "absolute",
          top: "52%",
          left: "10%",
          width: "16%",
          height: "13%",
          background: BLUSH,
          borderRadius: "50%",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "52%",
          right: "10%",
          width: "16%",
          height: "13%",
          background: BLUSH,
          borderRadius: "50%",
          zIndex: 1,
        }}
      />

      {/* dot eyes */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "28%",
          width: "12%",
          height: "12%",
          background: INK,
          borderRadius: "50%",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          right: "28%",
          width: "12%",
          height: "12%",
          background: INK,
          borderRadius: "50%",
          zIndex: 1,
        }}
      />

      {mood === "happy" && (
        <div
          style={{
            position: "absolute",
            top: "58%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "24%",
            height: "14%",
            borderBottom: `3px solid ${INK}`,
            borderRadius: "0 0 50% 50%",
            zIndex: 1,
          }}
        />
      )}
      {mood === "neutral" && (
        <div
          style={{
            position: "absolute",
            top: "62%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "18%",
            height: 3,
            background: INK,
            borderRadius: 2,
            zIndex: 1,
          }}
        />
      )}
      {mood === "sad" && (
        <div
          style={{
            position: "absolute",
            top: "66%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "24%",
            height: "14%",
            borderTop: `3px solid ${INK}`,
            borderRadius: "50% 50% 0 0",
            zIndex: 1,
          }}
        />
      )}
    </div>
  );
}
