"use client";

import { useEffect, useState } from "react";

import { INK, TERRACOTTA } from "~/app/_components/pet-app/constants";
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
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const isQuiz = currentCard?.type === "quiz";
  const quizOptions =
    isQuiz && currentCard.optionsJson
      ? (JSON.parse(currentCard.optionsJson) as string[])
      : [];
  const quizAnswered = selectedOption !== null;
  const quizCorrect =
    quizAnswered && selectedOption === currentCard?.correctIndex;

  useEffect(() => {
    setSelectedOption(null);
  }, [currentCard?.id]);

  function submitGrade(quality: Grade) {
    if (isSubmittingReview) return;
    setFlipped(false);
    setSelectedOption(null);
    onGrade(quality);
  }

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

      {isQuiz ? (
        <div className="quiz-review-card">
          <div className="study-side-label">Multiple choice</div>
          <div className="study-card-copy">{currentCard.front}</div>
          <div className="quiz-options">
            {quizOptions.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrect =
                quizAnswered && index === currentCard.correctIndex;
              const isWrong = quizAnswered && isSelected && !isCorrect;
              return (
                <button
                  key={`${index}-${option}`}
                  type="button"
                  disabled={quizAnswered}
                  onClick={() => setSelectedOption(index)}
                  className={
                    isCorrect
                      ? "quiz-option quiz-option-correct"
                      : isWrong
                        ? "quiz-option quiz-option-wrong"
                        : "quiz-option"
                  }
                >
                  <span className="quiz-option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                  {isCorrect && <span className="quiz-option-mark">✓</span>}
                  {isWrong && <span className="quiz-option-mark">×</span>}
                </button>
              );
            })}
          </div>
          {quizAnswered && (
            <div
              className={`quiz-feedback ${quizCorrect ? "quiz-feedback-correct" : "quiz-feedback-wrong"}`}
            >
              <strong>{quizCorrect ? "Correct!" : "Not quite."}</strong>
              {!quizCorrect && <span>The answer is {currentCard.back}.</span>}
            </div>
          )}
        </div>
      ) : (
        <div className="flashcard-scene">
          <div
            className={
              flipped ? "flashcard-flipper is-flipped" : "flashcard-flipper"
            }
          >
            <button
              type="button"
              aria-label="Reveal answer"
              onClick={() => setFlipped(true)}
              className="flashcard-face flashcard-front"
            >
              <span className="study-side-label">Question</span>
              <span className="study-card-copy">
                {currentCard?.front ?? ""}
              </span>
              <span className="flashcard-hint">
                Click the card to reveal the answer ↻
              </span>
            </button>
            <button
              type="button"
              aria-label="Show question"
              onClick={() => setFlipped(false)}
              className="flashcard-face flashcard-back"
            >
              <span className="answer-side-label">Answer</span>
              <span className="study-card-copy answer-copy">
                {currentCard?.back ?? ""}
              </span>
              <span className="flashcard-hint">
                Click to see the question again ↻
              </span>
            </button>
          </div>
        </div>
      )}

      {isQuiz && quizAnswered && (
        <button
          type="button"
          disabled={isSubmittingReview}
          onClick={() => submitGrade(quizCorrect ? "good" : "again")}
          className="quiz-continue-button"
        >
          Continue
        </button>
      )}

      {!isQuiz && flipped && (
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
              submitGrade("again");
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
              submitGrade("hard");
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
              submitGrade("good");
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
              submitGrade("easy");
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
