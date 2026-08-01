"use client";

import { useState } from "react";

import {
  CARD_BG,
  CARD_LINE,
  INK,
  TERRACOTTA,
} from "~/app/_components/pet-app/constants";
import {
  type CardItem,
  type DeckSummary,
} from "~/app/_components/pet-app/types";
import { api } from "~/trpc/react";

export function DeckDetailScreen({
  deck,
  onBack,
}: {
  deck: DeckSummary;
  onBack: () => void;
}) {
  const utils = api.useUtils();
  const cardsQuery = api.card.listByDeck.useQuery({ deckId: deck.id });

  const updateDeck = api.deck.update.useMutation();
  const deleteDeck = api.deck.delete.useMutation();
  const createCard = api.card.create.useMutation();
  const updateCard = api.card.update.useMutation();
  const deleteCard = api.card.delete.useMutation();

  const [nameDraft, setNameDraft] = useState(deck.name);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");

  async function saveRename() {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === deck.name) return;
    await updateDeck.mutateAsync({ id: deck.id, name: trimmed });
    await utils.deck.list.invalidate();
  }

  async function handleDeleteDeck() {
    if (
      !confirm(`Delete "${deck.name}" and all its cards? This can't be undone.`)
    )
      return;
    await deleteDeck.mutateAsync({ id: deck.id });
    await utils.deck.list.invalidate();
    onBack();
  }

  async function handleAddCard() {
    const front = newFront.trim();
    const back = newBack.trim();
    if (!front || !back) return;
    await createCard.mutateAsync({ deckId: deck.id, front, back });
    setNewFront("");
    setNewBack("");
    await Promise.all([
      utils.card.listByDeck.invalidate({ deckId: deck.id }),
      utils.deck.list.invalidate(),
    ]);
  }

  function startEditCard(card: CardItem) {
    setEditingCardId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
  }

  async function saveCardEdit() {
    if (!editingCardId) return;
    const front = editFront.trim();
    const back = editBack.trim();
    if (!front || !back) return;
    await updateCard.mutateAsync({ id: editingCardId, front, back });
    setEditingCardId(null);
    await utils.card.listByDeck.invalidate({ deckId: deck.id });
  }

  async function handleDeleteCard(cardId: string) {
    await deleteCard.mutateAsync({ id: cardId });
    await Promise.all([
      utils.card.listByDeck.invalidate({ deckId: deck.id }),
      utils.deck.list.invalidate(),
    ]);
  }

  const inputStyle = {
    padding: "10px 14px",
    borderRadius: 12,
    border: `2px solid ${CARD_LINE}`,
    fontSize: 14,
    fontFamily: "inherit",
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
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
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            fontSize: 26,
          }}
        >
          Manage deck
        </div>
      </div>

      <div
        style={{
          background: CARD_BG,
          borderRadius: 22,
          padding: 22,
          border: `2px solid ${CARD_LINE}`,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            style={{ ...inputStyle, flex: 1, fontWeight: 700 }}
          />
          <button
            onClick={() => void saveRename()}
            disabled={
              !nameDraft.trim() ||
              nameDraft.trim() === deck.name ||
              updateDeck.isPending
            }
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: 12,
              background: TERRACOTTA,
              color: "oklch(98% 0.01 90)",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Save name
          </button>
        </div>
        <button
          onClick={() => void handleDeleteDeck()}
          style={{
            marginTop: 14,
            border: "none",
            background: "transparent",
            color: "oklch(52% 0.16 350)",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Delete deck
        </button>
      </div>

      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>
        Cards ({cardsQuery.data?.length ?? 0})
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {cardsQuery.data?.map((card) => (
          <div
            key={card.id}
            style={{
              background: CARD_BG,
              borderRadius: 16,
              padding: 16,
              border: `2px solid ${CARD_LINE}`,
            }}
          >
            {editingCardId === card.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  value={editFront}
                  onChange={(e) => setEditFront(e.target.value)}
                  placeholder="Front"
                  style={inputStyle}
                />
                <input
                  value={editBack}
                  onChange={(e) => setEditBack(e.target.value)}
                  placeholder="Back"
                  style={inputStyle}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => void saveCardEdit()}
                    style={{
                      padding: "8px 14px",
                      border: "none",
                      borderRadius: 10,
                      background: TERRACOTTA,
                      color: "oklch(98% 0.01 90)",
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCardId(null)}
                    style={{
                      padding: "8px 14px",
                      border: "none",
                      borderRadius: 10,
                      background: "oklch(91% 0.03 230)",
                      color: INK,
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{card.front}</div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "oklch(48% 0.04 255 / 0.6)",
                      marginTop: 4,
                    }}
                  >
                    {card.back}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => startEditCard(card)}
                    style={{
                      padding: "8px 14px",
                      border: `2px solid ${CARD_LINE}`,
                      borderRadius: 10,
                      background: "transparent",
                      color: INK,
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => void handleDeleteCard(card.id)}
                    style={{
                      padding: "8px 14px",
                      border: `2px solid ${CARD_LINE}`,
                      borderRadius: 10,
                      background: "transparent",
                      color: "oklch(52% 0.16 350)",
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          background: CARD_BG,
          borderRadius: 22,
          padding: 22,
          border: `2px solid ${CARD_LINE}`,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>
          Add a card
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            value={newFront}
            onChange={(e) => setNewFront(e.target.value)}
            placeholder="Front (question)"
            style={inputStyle}
          />
          <input
            value={newBack}
            onChange={(e) => setNewBack(e.target.value)}
            placeholder="Back (answer)"
            style={inputStyle}
          />
          <button
            onClick={() => void handleAddCard()}
            disabled={
              !newFront.trim() || !newBack.trim() || createCard.isPending
            }
            style={{
              padding: 12,
              border: "none",
              borderRadius: 12,
              background: TERRACOTTA,
              color: "oklch(98% 0.01 90)",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            + Add card
          </button>
        </div>
      </div>
    </div>
  );
}
