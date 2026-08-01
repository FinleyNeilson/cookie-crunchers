"use client";

import { signOut } from "next-auth/react";

import {
  CARD_LINE,
  INK,
  TERRACOTTA_DEEP,
} from "~/app/_components/pet-app/constants";
import { type Screen } from "~/app/_components/pet-app/types";

export function TopNav({
  navItems,
  screen,
  setScreen,
}: {
  navItems: { key: Screen; label: string }[];
  screen: Screen;
  setScreen: (screen: Screen) => void;
}) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        display: "grid",
        // Both outer columns get equal flexible space, so the middle
        // (nav pill) column is always truly centered on the bar — a
        // flex row with justify-content:space-between only centers the
        // middle item when the two outer items happen to be the same
        // width, which the logo and sign-out button aren't.
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: 16,
        padding: "12px 24px",
        background: "oklch(97% 0.03 90 / 0.85)",
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${CARD_LINE}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 800,
          fontSize: 21,
          color: INK,
          whiteSpace: "nowrap",
          justifySelf: "start",
        }}
      >
        <img src="/pets/egg.svg" alt="" style={{ width: 48, height: "auto" }} />
        Spaced Eggs
      </div>
      <div
        style={{
          display: "flex",
          gap: 4,
          background: "oklch(94% 0.035 230)",
          padding: 4,
          borderRadius: 16,
          justifySelf: "center",
        }}
      >
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setScreen(item.key)}
            style={{
              border: "none",
              background:
                screen === item.key ? "oklch(88% 0.09 42)" : "transparent",
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
          gap: 10,
          justifySelf: "end",
        }}
      >
        <button
          onClick={() => void signOut()}
          style={{
            border: "none",
            background: "transparent",
            color: "oklch(45% 0.04 255 / 0.55)",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
