"use client";

import { useMemo, useState } from "react";

import {
  CARD_BG,
  CARD_LINE,
  GOLDEN,
  INK,
  MAROON,
  MASTERED_GREEN,
  MASTERED_GREEN_BG,
  TERRACOTTA,
} from "~/app/_components/pet-app/constants";
import { type DeckSummary } from "~/app/_components/pet-app/types";
import { LoadingSpinner } from "~/app/_components/loading-spinner";

const PAGE_SIZE = 6;

type FilterKey = "all" | "due" | "inProgress" | "mastered";
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "due", label: "Due today" },
  { key: "inProgress", label: "In progress" },
  { key: "mastered", label: "Mastered" },
];

type SortKey = "recentlyStudied" | "name" | "dueCount" | "level";

function daysFromNow(date: Date): number {
  return Math.max(1, Math.ceil((date.getTime() - Date.now()) / 86_400_000));
}

export function DecksScreen({
  decks,
  isCreatingDeck,
  setIsCreatingDeck,
  newDeckName,
  setNewDeckName,
  onCreateDeck,
  isCreatingDeckPending,
  onStartReview,
  onPractice,
  onManageDeck,
  onCreateWithAi,
}: {
  decks: DeckSummary[];
  isCreatingDeck: boolean;
  setIsCreatingDeck: React.Dispatch<React.SetStateAction<boolean>>;
  newDeckName: string;
  setNewDeckName: React.Dispatch<React.SetStateAction<string>>;
  onCreateDeck: () => void;
  isCreatingDeckPending: boolean;
  onStartReview: (deckId: string) => void;
  onPractice: (deckId: string) => void;
  onManageDeck: (deckId: string) => void;
  onCreateWithAi: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("recentlyStudied");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return decks.filter((d) => {
      if (query && !d.name.toLowerCase().includes(query)) return false;
      if (filter === "due") return d.dueCards > 0;
      if (filter === "mastered") return d.isMastered;
      if (filter === "inProgress") return !d.isMastered && d.level > 1;
      return true;
    });
  }, [decks, search, filter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case "name":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "dueCount":
        return list.sort((a, b) => b.dueCards - a.dueCards);
      case "level":
        return list.sort((a, b) => b.level - a.level);
      case "recentlyStudied":
      default:
        return list.sort((a, b) => {
          const aTime = a.lastStudiedAt
            ? new Date(a.lastStudiedAt).getTime()
            : -Infinity;
          const bTime = b.lastStudiedAt
            ? new Date(b.lastStudiedAt).getTime()
            : -Infinity;
          return bTime - aTime;
        });
    }
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageDecks = sorted.slice(pageStart, pageStart + PAGE_SIZE);

  function updateFilter(key: FilterKey) {
    setFilter(key);
    setPage(1);
  }

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  const inputStyle = {
    padding: "10px 14px",
    borderRadius: 14,
    border: `2px solid ${CARD_LINE}`,
    fontSize: 14,
    fontFamily: "inherit",
    background: CARD_BG,
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              fontSize: 30,
            }}
          >
            Your decks
          </div>
          <div
            style={{
              fontSize: 14,
              color: "oklch(48% 0.04 255 / 0.6)",
              marginTop: 4,
            }}
          >
            Grow each subject from first steps to mastery.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setIsCreatingDeck((v) => !v)}
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
            onClick={onCreateWithAi}
            style={{
              padding: "12px 20px",
              border: "none",
              borderRadius: 16,
              background: GOLDEN,
              color: "oklch(30% 0.08 85)",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Create with AI
          </button>
        </div>
      </div>

      {isCreatingDeck && (
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 18,
            background: CARD_BG,
            borderRadius: 18,
            padding: 16,
            border: `2px solid ${CARD_LINE}`,
          }}
        >
          <input
            autoFocus
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCreateDeck();
            }}
            placeholder="Deck name"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={onCreateDeck}
            disabled={!newDeckName.trim() || isCreatingDeckPending}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: 12,
              background: TERRACOTTA,
              color: "oklch(98% 0.01 90)",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {isCreatingDeckPending ? (
              <span className="loading-button-content">
                <LoadingSpinner size={16} label="Creating deck" light />
                Creating…
              </span>
            ) : (
              "Create"
            )}
          </button>
          <button
            onClick={() => {
              setIsCreatingDeck(false);
              setNewDeckName("");
            }}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: 12,
              background: "oklch(91% 0.02 80)",
              color: INK,
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
          marginTop: 22,
        }}
      >
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 200 }}>
          <span
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.5,
              fontSize: 14,
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder={`Search ${decks.length} deck${decks.length === 1 ? "" : "s"}`}
            style={{
              ...inputStyle,
              width: "100%",
              padding: "10px 14px 10px 38px",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 4,
            background: "oklch(94% 0.03 80)",
            padding: 4,
            borderRadius: 14,
          }}
        >
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => updateFilter(f.key)}
              style={{
                border: "none",
                background:
                  filter === f.key ? "oklch(88% 0.08 40)" : "transparent",
                color:
                  filter === f.key
                    ? "oklch(50% 0.13 38)"
                    : "oklch(45% 0.04 255 / 0.65)",
                padding: "9px 14px",
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          style={{ ...inputStyle, fontWeight: 700, cursor: "pointer" }}
        >
          <option value="recentlyStudied">Sort: Recently studied</option>
          <option value="name">Sort: Name (A-Z)</option>
          <option value="dueCount">Sort: Most due</option>
          <option value="level">Sort: Highest level</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <div
          style={{
            marginTop: 26,
            background: CARD_BG,
            borderRadius: 22,
            padding: 32,
            border: `2px solid ${CARD_LINE}`,
            textAlign: "center",
            color: "oklch(48% 0.04 255 / 0.6)",
          }}
        >
          No decks match {search ? `"${search}"` : "this filter"}.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
            gap: 18,
            marginTop: 26,
          }}
        >
          {pageDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onStudy={() => onStartReview(deck.id)}
              onPractice={() => onPractice(deck.id)}
              onManage={() => onManageDeck(deck.id)}
            />
          ))}
        </div>
      )}

      {sorted.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 26,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "oklch(48% 0.04 255 / 0.6)",
            }}
          >
            {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, sorted.length)} of{" "}
            {sorted.length} decks
          </div>
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <PageButton
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                ‹
              </PageButton>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PageButton
                  key={p}
                  active={p === currentPage}
                  onClick={() => setPage(p)}
                >
                  {p}
                </PageButton>
              ))}
              <PageButton
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                ›
              </PageButton>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function PageButton({
  children,
  onClick,
  active,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 32,
        height: 32,
        border: "none",
        borderRadius: 10,
        background: active ? "oklch(88% 0.08 40)" : "transparent",
        color: active
          ? "oklch(50% 0.13 38)"
          : disabled
            ? "oklch(70% 0.02 255 / 0.5)"
            : INK,
        fontWeight: 800,
        fontSize: 13,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function DeckCard({
  deck,
  onStudy,
  onPractice,
  onManage,
}: {
  deck: DeckSummary;
  onStudy: () => void;
  onPractice: () => void;
  onManage: () => void;
}) {
  const badgeLabel = deck.dueCards > 0 ? `${deck.dueCards} due` : "All done";
  const badgeBg = deck.dueCards > 0 ? "oklch(90% 0.08 55)" : MASTERED_GREEN_BG;
  const badgeColor = deck.dueCards > 0 ? "oklch(46% 0.12 40)" : MASTERED_GREEN;
  const nextReviewDays = deck.nextDueAt
    ? daysFromNow(new Date(deck.nextDueAt))
    : null;
  const xpPct =
    deck.xpToNextLevel > 0
      ? Math.round((deck.xpInLevel / deck.xpToNextLevel) * 100)
      : 100;

  return (
    <div
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
          gap: 10,
        }}
      >
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
            background: badgeBg,
            color: badgeColor,
            fontWeight: 800,
            fontSize: 12,
            padding: "4px 10px",
            borderRadius: 12,
            whiteSpace: "nowrap",
          }}
        >
          {badgeLabel}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginTop: 2,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "oklch(48% 0.04 255 / 0.6)",
          }}
        >
          {deck.totalCards} cards
        </div>
        {nextReviewDays !== null && (
          <div style={{ fontSize: 12, fontWeight: 700, color: MASTERED_GREEN }}>
            Next review in {nextReviewDays} day{nextReviewDays === 1 ? "" : "s"}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginTop: 16,
          fontWeight: 700,
          fontSize: 13,
        }}
      >
        <span>
          {deck.isMastered
            ? `Level ${deck.level}`
            : `Level ${deck.level} → Level ${deck.level + 1}`}
        </span>
        <span style={{ color: "oklch(48% 0.04 255 / 0.6)" }}>
          {deck.xpInLevel.toLocaleString()} /{" "}
          {deck.xpToNextLevel.toLocaleString()} XP
        </span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 5,
          background: "oklch(91% 0.02 80)",
          marginTop: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${xpPct}%`,
            background: deck.isMastered ? MASTERED_GREEN : GOLDEN,
            borderRadius: 5,
          }}
        />
      </div>

      {deck.isMastered ? (
        <div
          style={{
            marginTop: 14,
            background: MASTERED_GREEN_BG,
            borderRadius: 14,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{ fontWeight: 800, fontSize: 14, color: MASTERED_GREEN }}
            >
              Mastered
            </div>
            <div style={{ fontSize: 12, color: "oklch(48% 0.04 255 / 0.6)" }}>
              Level 10 reached
            </div>
          </div>
          <span style={{ fontSize: 20 }}>⭐</span>
        </div>
      ) : (
        <div
          style={{
            marginTop: 14,
            background: "oklch(94% 0.03 80)",
            borderRadius: 14,
            padding: "10px 14px",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 14 }}>
            {deck.levelsToMastery} level{deck.levelsToMastery === 1 ? "" : "s"}{" "}
            to Mastery
          </div>
          <div style={{ fontSize: 12, color: "oklch(48% 0.04 255 / 0.6)" }}>
            Mastery at Level 10
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        {deck.dueCards > 0 ? (
          <button
            onClick={onStudy}
            style={{
              flex: 1,
              padding: 12,
              border: "none",
              borderRadius: 14,
              background: MAROON,
              color: "oklch(98% 0.01 90)",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Study
          </button>
        ) : deck.totalCards > 0 ? (
          <button
            onClick={onPractice}
            title="Study these cards even though nothing's due yet — still submits real reviews"
            style={{
              flex: 1,
              padding: 12,
              border: `2px solid ${CARD_LINE}`,
              borderRadius: 14,
              background: "transparent",
              color: INK,
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Practice anyway
          </button>
        ) : (
          <button
            disabled
            style={{
              flex: 1,
              padding: 12,
              border: "none",
              borderRadius: 14,
              background: "oklch(91% 0.02 80)",
              color: "oklch(60% 0.02 255 / 0.5)",
              fontWeight: 800,
              fontSize: 14,
              cursor: "default",
            }}
          >
            Study
          </button>
        )}
        <button
          onClick={onManage}
          style={{
            padding: "12px 16px",
            border: `2px solid ${CARD_LINE}`,
            borderRadius: 14,
            background: "transparent",
            color: INK,
            fontWeight: 800,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Manage
        </button>
      </div>
    </div>
  );
}
