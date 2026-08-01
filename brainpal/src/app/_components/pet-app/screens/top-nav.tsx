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
  streak,
}: {
  navItems: { key: Screen; label: string }[];
  screen: Screen;
  setScreen: (screen: Screen) => void;
  streak: number;
}) {
  return (
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
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            {streak}-day streak
          </div>
        </div>
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
