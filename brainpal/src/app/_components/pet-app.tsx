"use client";

import { useState } from "react";

// Ported from the "Hatchly" design prototype (Pet-Powered Flashcard App.zip).
// Mock data only — no persistence yet. This is the reference UI for the
// SRS-driven pet loop described in docs/vision.md.

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

const SPECIES: Record<Species, { label: string; color: string }> = {
  fox: { label: "Fox", color: "oklch(74% 0.14 45)" },
  owl: { label: "Owl", color: "oklch(72% 0.09 85)" },
  bunny: { label: "Bunny", color: "oklch(88% 0.05 345)" },
  otter: { label: "Otter", color: "oklch(62% 0.06 70)" },
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
      { q: "What organelle produces most of a cell's ATP?", a: "The mitochondrion." },
      { q: "What is the semi-fluid substance inside the cell membrane called?", a: "Cytoplasm." },
      { q: "Which structure controls what enters and exits the cell?", a: "The cell membrane (plasma membrane)." },
      { q: "What process do plant cells use to convert light into energy?", a: "Photosynthesis." },
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
      { q: '"¿Dónde está la estación de tren?"', a: "Where is the train station?" },
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
      { q: "What type of reaction adds atoms across a double bond?", a: "An addition reaction." },
      { q: "What is produced when an alcohol is oxidized fully?", a: "A carboxylic acid (via an aldehyde)." },
    ],
  },
];

const XP_MAP: Record<Grade, number> = { again: 2, hard: 6, good: 12, easy: 16 };
const HAPPINESS_MAP: Record<Grade, number> = { again: -8, hard: 1, good: 4, easy: 6 };
const ENERGY_MAP: Record<Grade, number> = { again: -5, hard: 1, good: 3, easy: 4 };
const FULLNESS_MAP: Record<Grade, number> = { again: -10, hard: 2, good: 5, easy: 6 };

const DECK_ACCENTS: Record<number, { bg: string; color: string }> = {
  1: { bg: "oklch(90% 0.08 240)", color: "oklch(45% 0.1 240)" },
  2: { bg: "oklch(90% 0.08 20)", color: "oklch(45% 0.1 20)" },
  3: { bg: "oklch(90% 0.08 160)", color: "oklch(45% 0.1 160)" },
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
    const cards = deck.cards.slice(0, Math.max(1, Math.min(deck.due, deck.cards.length)));
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
      if (leveledUp && newStage === "juvenile" && !accessories.includes("bow")) {
        accessories.push("bow");
        newAccessory = "Bow";
      }
      if (leveledUp && newStage === "adult" && !accessories.includes("scarf")) {
        accessories.push("scarf");
        newAccessory = "Scarf";
      }

      setDecks((prev) =>
        prev.map((d) => (d.id === reviewDeckId ? { ...d, due: Math.max(0, d.due - newSessionTotal) } : d)),
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
  const mood = pet.happiness >= 55 ? "happy" : pet.happiness >= 30 ? "neutral" : "sad";
  const isNeglected = pet.fullness < 30 || pet.happiness < 30;

  const deckCards = decks.map((d) => {
    const accent = DECK_ACCENTS[d.id] ?? DECK_ACCENTS[1]!;
    const progressPct = Math.round(((d.total - d.due) / d.total) * 100);
    return {
      deck: d,
      progressPct,
      dueLabel: d.due > 0 ? `${d.due} due` : "All done",
      badgeBg: d.due > 0 ? accent.bg : "oklch(90% 0.02 160)",
      badgeColor: d.due > 0 ? accent.color : "oklch(40% 0.06 160)",
      studyDisabled: d.due === 0,
      studyBtnBg: d.due > 0 ? accent.color : "oklch(90% 0.01 90)",
      studyBtnColor: d.due > 0 ? "oklch(98% 0.01 90)" : "oklch(50% 0.02 280 / 0.5)",
      studyBtnLabel: d.due > 0 ? "Study" : "Caught up",
    };
  });

  const currentCard = reviewCards[reviewIndex];
  const accuracySeries = [62, 70, 58, 80, 75, 90, 84];
  const weeklyAccuracy = Math.round(accuracySeries.reduce((a, b) => a + b, 0) / accuracySeries.length);
  const heatmap = Array.from({ length: 28 }, (_, i) => {
    const level = [0, 1, 1, 2, 3, 2, 1][i % 7]! + (i % 5 === 0 ? 1 : 0);
    const shades = ["oklch(93% 0.01 320)", "oklch(85% 0.06 320)", "oklch(75% 0.1 320)", "oklch(60% 0.14 320)"];
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
    bg: i <= currentStageIdx ? speciesInfo.color : "oklch(92% 0.01 90)",
    color: i <= currentStageIdx ? "oklch(98% 0.01 90)" : "oklch(60% 0.02 280 / 0.5)",
  }));
  const accessoryLabels: Record<string, string> = { bow: "Bow", scarf: "Scarf" };

  const navBgFor = (s: Screen) => (screen === s ? "oklch(90% 0.08 320)" : "transparent");
  const navColorFor = (s: Screen) => (screen === s ? "oklch(40% 0.1 320)" : "oklch(50% 0.02 280 / 0.6)");

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Nunito', sans-serif",
        color: "oklch(28% 0.02 280)",
        background: "oklch(97% 0.014 90)",
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          width: 250,
          flexShrink: 0,
          background: "oklch(99% 0.006 90)",
          borderRight: "1px solid oklch(91% 0.01 90)",
          padding: "28px 20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 24, color: "oklch(45% 0.1 320)", padding: "0 8px" }}>
          Hatchly
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 32 }}>
          <button
            onClick={() => setScreen("home")}
            style={{ textAlign: "left", border: "none", background: navBgFor("home"), color: navColorFor("home"), padding: "12px 14px", borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: "pointer" }}
          >
            Pet
          </button>
          <button
            onClick={() => setScreen("decks")}
            style={{ textAlign: "left", border: "none", background: navBgFor("decks"), color: navColorFor("decks"), padding: "12px 14px", borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: "pointer" }}
          >
            Decks
          </button>
          <button
            onClick={() => setScreen("stats")}
            style={{ textAlign: "left", border: "none", background: navBgFor("stats"), color: navColorFor("stats"), padding: "12px 14px", borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: "pointer" }}
          >
            Progress
          </button>
        </div>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 8, background: "oklch(90% 0.09 55)", padding: "12px 14px", borderRadius: 16 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "oklch(70% 0.15 45)", flexShrink: 0 }} />
          <div style={{ fontWeight: 800, fontSize: 14 }}>{pet.streak}-day streak</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, minWidth: 0, padding: "40px clamp(20px,4vw,56px)", maxWidth: 1120 }}>
        {toastMsg && (
          <div
            style={{
              position: "fixed",
              top: 24,
              right: 40,
              zIndex: 50,
              background: "oklch(28% 0.02 280)",
              color: "oklch(98% 0.01 90)",
              padding: "12px 20px",
              borderRadius: 16,
              fontWeight: 700,
              fontSize: 14,
              boxShadow: "0 6px 20px oklch(0% 0 0 / 0.2)",
            }}
          >
            {toastMsg}
          </div>
        )}

        {screen === "home" && (
          <>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 30 }}>Good to see you</div>
            <div style={{ marginTop: 4, fontSize: 16, color: "oklch(45% 0.02 280 / 0.75)" }}>
              Keep {pet.name} happy today by clearing your reviews.
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 28, marginTop: 28, alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 360px", minWidth: 300, background: "oklch(99% 0.006 90)", borderRadius: 28, padding: "30px 26px", boxShadow: "0 10px 30px oklch(30% 0.05 300 / 0.08)" }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div style={{ position: "relative", width: 170, height: 170, display: "flex", alignItems: "center", justifyContent: "center", animation: "petBounce 2.6s ease-in-out infinite" }}>
                    {stage.key === "egg" ? (
                      <div
                        style={{
                          width: 100,
                          height: 130,
                          borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                          background: "oklch(90% 0.05 90)",
                          border: "4px solid oklch(80% 0.04 90)",
                          position: "relative",
                          animation: "crackShake 3s ease-in-out infinite",
                        }}
                      >
                        <div style={{ position: "absolute", top: "40%", left: "20%", width: "60%", height: 4, background: "oklch(70% 0.03 90)", transform: "rotate(-8deg)" }} />
                        <div style={{ position: "absolute", top: "55%", left: "35%", width: "40%", height: 4, background: "oklch(70% 0.03 90)", transform: "rotate(12deg)" }} />
                      </div>
                    ) : (
                      <PetFace species={pet.species} color={speciesInfo.color} size={stage.size} hasBow={pet.accessories.includes("bow")} mood={mood} />
                    )}
                  </div>
                </div>

                <div style={{ textAlign: "center", marginTop: 8 }}>
                  <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 19 }}>
                    {pet.name} the {speciesInfo.label}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "oklch(50% 0.02 280 / 0.6)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>
                    {stage.label} · {pet.xp} XP
                  </div>
                </div>

                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                  <StatBar label="Happiness" value={pet.happiness} hue={20} />
                  <StatBar label="Energy" value={pet.energy} hue={160} />
                  <StatBar label="Fullness" value={pet.fullness} hue={240} />
                </div>

                {isNeglected && (
                  <div style={{ marginTop: 16, background: "oklch(92% 0.05 40)", color: "oklch(38% 0.08 40)", fontWeight: 700, fontSize: 13, padding: "10px 12px", borderRadius: 14, textAlign: "center" }}>
                    {pet.name} feels neglected — study today to cheer them up.
                  </div>
                )}

                <button
                  onClick={goStudyNow}
                  style={{ marginTop: 20, width: "100%", padding: 15, border: "none", borderRadius: 18, background: "oklch(55% 0.14 320)", color: "oklch(98% 0.01 90)", fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 8px 20px oklch(55% 0.14 320 / 0.35)" }}
                >
                  Study now — {totalDue} due
                </button>
              </div>

              <div style={{ flex: "2 1 420px", minWidth: 320, display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 16 }}>
                  <StatTile value={decks.length} label="Decks" />
                  <StatTile value={pet.accessories.length} label="Accessories" />
                  <StatTile value={`${weeklyAccuracy}%`} label="7-day accuracy" />
                </div>

                <div style={{ background: "oklch(99% 0.006 90)", borderRadius: 24, padding: 24, boxShadow: "0 4px 14px oklch(30% 0.05 300 / 0.06)" }}>
                  <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 14 }}>Due today</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {deckCards.map(({ deck, dueLabel, badgeBg, badgeColor, studyDisabled, studyBtnBg, studyBtnColor, studyBtnLabel }) => (
                      <div key={deck.id} style={{ display: "flex", flexDirection: "column", gap: 10, padding: "14px 16px", borderRadius: 16, background: "oklch(97% 0.008 90)" }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>{deck.name}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "oklch(50% 0.02 280 / 0.55)", marginTop: 2 }}>
                            {deck.source} · {deck.total} cards
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ background: badgeBg, color: badgeColor, fontWeight: 800, fontSize: 12, padding: "5px 12px", borderRadius: 12, whiteSpace: "nowrap" }}>{dueLabel}</div>
                          <button
                            onClick={() => startReview(deck.id)}
                            disabled={studyDisabled}
                            style={{ border: "none", padding: "9px 16px", borderRadius: 12, background: studyBtnBg, color: studyBtnColor, fontWeight: 800, fontSize: 13, cursor: studyDisabled ? "default" : "pointer" }}
                          >
                            {studyBtnLabel}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {screen === "decks" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 30 }}>Your Decks</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => toast("Deck builder coming soon!")} style={{ padding: "12px 20px", border: "none", borderRadius: 16, background: "oklch(88% 0.07 160)", color: "oklch(30% 0.06 160)", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                  + New deck
                </button>
                <button onClick={() => toast("Slide upload coming soon!")} style={{ padding: "12px 20px", border: "none", borderRadius: 16, background: "oklch(88% 0.07 240)", color: "oklch(30% 0.06 240)", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                  ↑ Upload slides
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 18, marginTop: 26 }}>
              {deckCards.map(({ deck, progressPct, dueLabel, badgeBg, badgeColor, studyDisabled, studyBtnBg, studyBtnColor, studyBtnLabel }) => (
                <div key={deck.id} style={{ background: "oklch(99% 0.006 90)", borderRadius: 22, padding: 22, boxShadow: "0 6px 18px oklch(30% 0.05 300 / 0.07)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 17 }}>{deck.name}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "oklch(50% 0.02 280 / 0.55)", marginTop: 2 }}>
                        {deck.source} · {deck.total} cards
                      </div>
                    </div>
                    <div style={{ background: badgeBg, color: badgeColor, fontWeight: 800, fontSize: 12, padding: "4px 10px", borderRadius: 12, whiteSpace: "nowrap" }}>{dueLabel}</div>
                  </div>
                  <div style={{ height: 8, borderRadius: 5, background: "oklch(92% 0.01 90)", marginTop: 16, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progressPct}%`, background: badgeColor, borderRadius: 5 }} />
                  </div>
                  <button
                    onClick={() => startReview(deck.id)}
                    disabled={studyDisabled}
                    style={{ marginTop: 16, width: "100%", padding: 12, border: "none", borderRadius: 14, background: studyBtnBg, color: studyBtnColor, fontWeight: 800, fontSize: 14, cursor: studyDisabled ? "default" : "pointer" }}
                  >
                    {studyBtnLabel}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {screen === "review" && (
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setScreen("decks")} style={{ border: "none", background: "oklch(92% 0.01 90)", width: 36, height: 36, borderRadius: "50%", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
                ←
              </button>
              <div style={{ flex: 1, height: 10, borderRadius: 6, background: "oklch(92% 0.01 90)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${reviewCards.length ? Math.round((reviewIndex / reviewCards.length) * 100) : 0}%`,
                    background: "oklch(55% 0.14 320)",
                    borderRadius: 6,
                    transition: "width 0.3s",
                  }}
                />
              </div>
              <div style={{ fontWeight: 800, fontSize: 13, color: "oklch(50% 0.02 280 / 0.6)", whiteSpace: "nowrap" }}>
                {currentCard ? `${reviewIndex + 1} / ${reviewCards.length}` : ""}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
              <div style={{ width: 74, height: 74, position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, background: speciesInfo.color, borderRadius: "50%" }} />
                <div style={{ position: "absolute", top: "36%", left: "24%", width: "16%", height: "16%", background: "oklch(28% 0.02 280)", borderRadius: "50%" }} />
                <div style={{ position: "absolute", top: "36%", right: "24%", width: "16%", height: "16%", background: "oklch(28% 0.02 280)", borderRadius: "50%" }} />
                {mood === "happy" ? (
                  <div style={{ position: "absolute", top: "56%", left: "50%", transform: "translateX(-50%)", width: "28%", height: "16%", borderBottom: "3px solid oklch(28% 0.02 280)", borderRadius: "0 0 50% 50%" }} />
                ) : (
                  <div style={{ position: "absolute", top: "64%", left: "50%", transform: "translateX(-50%)", width: "28%", height: "16%", borderTop: "3px solid oklch(28% 0.02 280)", borderRadius: "50% 50% 0 0" }} />
                )}
              </div>
            </div>

            <div
              onClick={() => setFlipped((f) => !f)}
              style={{ marginTop: 18, minHeight: 280, background: "oklch(99% 0.006 90)", borderRadius: 28, padding: "32px 28px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", boxShadow: "0 12px 30px oklch(30% 0.05 300 / 0.1)", cursor: "pointer" }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "oklch(50% 0.02 280 / 0.5)", marginBottom: 16 }}>
                {flipped ? "Answer" : "Question"}
              </div>
              <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 22, lineHeight: 1.4 }}>
                {currentCard ? (flipped ? currentCard.a : currentCard.q) : ""}
              </div>
              {!flipped && (
                <div style={{ marginTop: 20, fontSize: 13, fontWeight: 700, color: "oklch(50% 0.02 280 / 0.4)" }}>Click to reveal answer</div>
              )}
            </div>

            {flipped && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 18 }}>
                <button onClick={(e) => { e.stopPropagation(); grade("again"); }} style={{ padding: 16, border: "none", borderRadius: 16, background: "oklch(88% 0.1 20)", color: "oklch(32% 0.1 20)", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                  Again
                </button>
                <button onClick={(e) => { e.stopPropagation(); grade("hard"); }} style={{ padding: 16, border: "none", borderRadius: 16, background: "oklch(88% 0.1 60)", color: "oklch(32% 0.1 60)", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                  Hard
                </button>
                <button onClick={(e) => { e.stopPropagation(); grade("good"); }} style={{ padding: 16, border: "none", borderRadius: 16, background: "oklch(88% 0.1 160)", color: "oklch(32% 0.1 160)", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                  Good
                </button>
                <button onClick={(e) => { e.stopPropagation(); grade("easy"); }} style={{ padding: 16, border: "none", borderRadius: 16, background: "oklch(88% 0.1 240)", color: "oklch(32% 0.1 240)", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                  Easy
                </button>
              </div>
            )}
          </div>
        )}

        {screen === "results" && results && (
          <div style={{ maxWidth: 480, margin: "20px auto 0", textAlign: "center" }}>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 28 }}>Session complete!</div>
            <div style={{ position: "relative", display: "flex", justifyContent: "center", margin: "24px 0" }}>
              {results.celebrate && (
                <>
                  <div style={{ position: "absolute", top: -6, left: "28%", width: 10, height: 10, background: "oklch(80% 0.12 320)", borderRadius: "50%", animation: "sparklePulse 1.4s ease-in-out infinite" }} />
                  <div style={{ position: "absolute", top: 4, right: "26%", width: 8, height: 8, background: "oklch(80% 0.12 60)", borderRadius: "50%", animation: "sparklePulse 1.4s ease-in-out infinite 0.3s" }} />
                  <div style={{ position: "absolute", bottom: 6, left: "22%", width: 7, height: 7, background: "oklch(80% 0.12 160)", borderRadius: "50%", animation: "sparklePulse 1.4s ease-in-out infinite 0.6s" }} />
                </>
              )}
              <div style={{ width: 130, height: 130, position: "relative", animation: "petBounce 1.8s ease-in-out infinite" }}>
                <div style={{ position: "absolute", inset: 0, background: speciesInfo.color, borderRadius: "50%" }} />
                <div style={{ position: "absolute", top: "36%", left: "26%", width: "14%", height: "14%", background: "oklch(28% 0.02 280)", borderRadius: "50%" }} />
                <div style={{ position: "absolute", top: "36%", right: "26%", width: "14%", height: "14%", background: "oklch(28% 0.02 280)", borderRadius: "50%" }} />
                <div style={{ position: "absolute", top: "56%", left: "50%", transform: "translateX(-50%)", width: "28%", height: "16%", borderBottom: "4px solid oklch(28% 0.02 280)", borderRadius: "0 0 50% 50%" }} />
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{results.message}</div>

            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
              <ResultTile value={`${results.accuracy}%`} label="Accuracy" />
              <ResultTile value={`+${results.xpGained}`} label="XP gained" />
              <ResultTile value={pet.streak} label="Day streak" />
            </div>

            {results.leveledUp && (
              <div style={{ marginTop: 18, background: "oklch(90% 0.1 320)", color: "oklch(30% 0.1 320)", fontWeight: 800, fontSize: 14, padding: 14, borderRadius: 16 }}>
                ✨ {pet.name} evolved into a {stage.label}!
              </div>
            )}
            {results.newAccessory && (
              <div style={{ marginTop: 18, background: "oklch(90% 0.08 45)", color: "oklch(30% 0.08 45)", fontWeight: 800, fontSize: 14, padding: 14, borderRadius: 16 }}>
                🎁 New accessory unlocked: {results.newAccessory}!
              </div>
            )}

            <button
              onClick={() => setScreen("home")}
              style={{ marginTop: 26, width: "100%", padding: 16, border: "none", borderRadius: 20, background: "oklch(55% 0.14 320)", color: "oklch(98% 0.01 90)", fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 16, cursor: "pointer" }}
            >
              Back to {pet.name}
            </button>
          </div>
        )}

        {screen === "stats" && (
          <>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 30 }}>Progress</div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18, marginTop: 24 }}>
              <StatTile value={pet.streak} label="Day streak" big />
              <StatTile value={`${weeklyAccuracy}%`} label="7-day accuracy" big />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 24, alignItems: "start" }}>
              <div style={{ background: "oklch(99% 0.006 90)", borderRadius: 22, padding: 22, boxShadow: "0 4px 14px oklch(30% 0.05 300 / 0.06)" }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Study activity — last 4 weeks</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginTop: 14 }}>
                  {heatmap.map((bg, i) => (
                    <div key={i} style={{ aspectRatio: "1", borderRadius: 6, background: bg }} />
                  ))}
                </div>
              </div>

              <div style={{ background: "oklch(99% 0.006 90)", borderRadius: 22, padding: 22, boxShadow: "0 4px 14px oklch(30% 0.05 300 / 0.06)" }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Accuracy — last 7 sessions</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100, marginTop: 16 }}>
                  {accuracySeries.map((pct, i) => (
                    <div key={i} style={{ flex: 1, height: `${pct}%`, background: "oklch(72% 0.13 240)", borderRadius: "6px 6px 3px 3px" }} />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
              <div style={{ background: "oklch(99% 0.006 90)", borderRadius: 22, padding: 22, boxShadow: "0 4px 14px oklch(30% 0.05 300 / 0.06)" }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Growth timeline</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                  {timeline.map((t) => (
                    <div key={t.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: t.bg, color: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
                        {t.initial}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "oklch(50% 0.02 280 / 0.55)" }}>{t.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "oklch(99% 0.006 90)", borderRadius: 22, padding: 22, boxShadow: "0 4px 14px oklch(30% 0.05 300 / 0.06)" }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Accessories</div>
                <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                  {pet.accessories.map((a) => (
                    <div key={a} style={{ background: "oklch(97% 0.008 90)", borderRadius: 14, padding: "10px 14px", fontWeight: 700, fontSize: 13 }}>
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

function StatBar({ label, value, hue }: { label: string; value: number; hue: number }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div style={{ height: 10, borderRadius: 6, background: `oklch(92% 0.02 ${hue})`, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: `oklch(72% 0.13 ${hue})`, borderRadius: 6, transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

function StatTile({ value, label, big }: { value: string | number; label: string; big?: boolean }) {
  return (
    <div style={{ background: "oklch(99% 0.006 90)", borderRadius: big ? 20 : 20, padding: big ? 20 : 18, textAlign: "center", boxShadow: "0 4px 14px oklch(30% 0.05 300 / 0.06)" }}>
      <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: big ? 26 : 24 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "oklch(50% 0.02 280 / 0.6)" }}>{label}</div>
    </div>
  );
}

function ResultTile({ value, label }: { value: string | number; label: string }) {
  return (
    <div style={{ flex: 1, background: "oklch(99% 0.006 90)", borderRadius: 18, padding: 16, boxShadow: "0 4px 14px oklch(30% 0.05 300 / 0.07)" }}>
      <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 22 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "oklch(50% 0.02 280 / 0.55)" }}>{label}</div>
    </div>
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
      {species === "fox" && (
        <>
          <div style={{ position: "absolute", top: "-6%", left: "6%", width: "26%", height: "34%", background: color, borderRadius: "60% 40% 60% 10%", transform: "rotate(-15deg)" }} />
          <div style={{ position: "absolute", top: "-6%", right: "6%", width: "26%", height: "34%", background: color, borderRadius: "40% 60% 10% 60%", transform: "rotate(15deg)" }} />
        </>
      )}
      {species === "owl" && (
        <>
          <div style={{ position: "absolute", top: "-2%", left: "10%", width: "20%", height: "22%", background: color, borderRadius: "60% 60% 40% 40%" }} />
          <div style={{ position: "absolute", top: "-2%", right: "10%", width: "20%", height: "22%", background: color, borderRadius: "60% 60% 40% 40%" }} />
        </>
      )}
      {species === "bunny" && (
        <>
          <div style={{ position: "absolute", top: "-38%", left: "20%", width: "16%", height: "48%", background: color, borderRadius: "50% 50% 20% 20%" }} />
          <div style={{ position: "absolute", top: "-38%", right: "20%", width: "16%", height: "48%", background: color, borderRadius: "50% 50% 20% 20%" }} />
        </>
      )}
      {species === "otter" && (
        <>
          <div style={{ position: "absolute", top: "0%", left: "8%", width: "16%", height: "16%", background: color, borderRadius: "50%" }} />
          <div style={{ position: "absolute", top: "0%", right: "8%", width: "16%", height: "16%", background: color, borderRadius: "50%" }} />
        </>
      )}

      <div style={{ position: "absolute", inset: 0, background: color, borderRadius: "50%", boxShadow: "inset 0 -10px 20px oklch(0% 0 0 / 0.06)" }} />

      {hasBow && (
        <div style={{ position: "absolute", top: "-8%", left: "50%", transform: "translateX(-50%)", width: "22%", height: "16%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 0, height: 0, borderTop: "9px solid transparent", borderBottom: "9px solid transparent", borderRight: "14px solid oklch(70% 0.16 350)" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "oklch(60% 0.16 350)", margin: "0 -2px" }} />
          <div style={{ width: 0, height: 0, borderTop: "9px solid transparent", borderBottom: "9px solid transparent", borderLeft: "14px solid oklch(70% 0.16 350)" }} />
        </div>
      )}

      <div style={{ position: "absolute", top: "38%", left: "26%", width: "14%", height: "14%", background: "oklch(28% 0.02 280)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", top: "38%", right: "26%", width: "14%", height: "14%", background: "oklch(28% 0.02 280)", borderRadius: "50%" }} />

      {mood === "happy" && (
        <div style={{ position: "absolute", top: "58%", left: "50%", transform: "translateX(-50%)", width: "26%", height: "16%", borderBottom: "4px solid oklch(28% 0.02 280)", borderRadius: "0 0 50% 50%" }} />
      )}
      {mood === "neutral" && (
        <div style={{ position: "absolute", top: "62%", left: "50%", transform: "translateX(-50%)", width: "20%", height: 4, background: "oklch(28% 0.02 280)", borderRadius: 2 }} />
      )}
      {mood === "sad" && (
        <div style={{ position: "absolute", top: "66%", left: "50%", transform: "translateX(-50%)", width: "26%", height: "16%", borderTop: "4px solid oklch(28% 0.02 280)", borderRadius: "50% 50% 0 0" }} />
      )}
    </div>
  );
}
