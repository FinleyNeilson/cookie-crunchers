import {
  CARD_BG,
  CARD_LINE,
  INK,
  TERRACOTTA,
} from "~/app/_components/pet-app/constants";
import { PetPortrait } from "~/app/_components/pet-app/pet-visuals";
import {
  type Grade,
  type PetState,
  type ReviewCard,
} from "~/app/_components/pet-app/types";

export function ReviewScreen({
  pet,
  reviewCards,
  reviewIndex,
  flipped,
  setFlipped,
  isSubmittingReview,
  onGrade,
  onBack,
}: {
  pet: PetState;
  reviewCards: ReviewCard[];
  reviewIndex: number;
  flipped: boolean;
  setFlipped: React.Dispatch<React.SetStateAction<boolean>>;
  isSubmittingReview: boolean;
  onGrade: (quality: Grade) => void;
  onBack: () => void;
}) {
  const currentCard = reviewCards[reviewIndex];

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onBack}
          style={{
            border: "none",
            background: "oklch(91% 0.03 230)",
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
            background: "oklch(91% 0.03 230)",
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
          {currentCard ? `${reviewIndex + 1} / ${reviewCards.length}` : ""}
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
          <PetPortrait pet={pet} size={78} />
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
          boxShadow: "0 12px 30px oklch(35% 0.06 260 / 0.12)",
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
          {currentCard ? (flipped ? currentCard.back : currentCard.front) : ""}
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
            disabled={isSubmittingReview}
            onClick={(e) => {
              e.stopPropagation();
              onGrade("again");
            }}
            style={{
              padding: 16,
              border: "none",
              borderRadius: 16,
              background: "oklch(87% 0.11 350)",
              color: "oklch(34% 0.13 350)",
              fontWeight: 800,
              fontSize: 14,
              cursor: isSubmittingReview ? "default" : "pointer",
              opacity: isSubmittingReview ? 0.6 : 1,
            }}
          >
            Again
          </button>
          <button
            disabled={isSubmittingReview}
            onClick={(e) => {
              e.stopPropagation();
              onGrade("hard");
            }}
            style={{
              padding: 16,
              border: "none",
              borderRadius: 16,
              background: "oklch(88% 0.1 50)",
              color: "oklch(36% 0.11 50)",
              fontWeight: 800,
              fontSize: 14,
              cursor: isSubmittingReview ? "default" : "pointer",
              opacity: isSubmittingReview ? 0.6 : 1,
            }}
          >
            Hard
          </button>
          <button
            disabled={isSubmittingReview}
            onClick={(e) => {
              e.stopPropagation();
              onGrade("good");
            }}
            style={{
              padding: 16,
              border: "none",
              borderRadius: 16,
              background: "oklch(87% 0.09 140)",
              color: "oklch(34% 0.09 140)",
              fontWeight: 800,
              fontSize: 14,
              cursor: isSubmittingReview ? "default" : "pointer",
              opacity: isSubmittingReview ? 0.6 : 1,
            }}
          >
            Good
          </button>
          <button
            disabled={isSubmittingReview}
            onClick={(e) => {
              e.stopPropagation();
              onGrade("easy");
            }}
            style={{
              padding: 16,
              border: "none",
              borderRadius: 16,
              background: "oklch(88% 0.09 97)",
              color: "oklch(38% 0.1 97)",
              fontWeight: 800,
              fontSize: 14,
              cursor: isSubmittingReview ? "default" : "pointer",
              opacity: isSubmittingReview ? 0.6 : 1,
            }}
          >
            Easy
          </button>
        </div>
      )}
    </div>
  );
}
