import { CARD_BG, CARD_LINE, INK } from "~/app/_components/pet-app/constants";

export function StatBar({
  label,
  value,
  hue,
  rightLabel,
}: {
  label: string;
  value: number;
  hue: number;
  rightLabel?: string;
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
        <span>{rightLabel ?? `${value}%`}</span>
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

export function StatTile({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div
      style={{
        background: "oklch(94% 0.03 80)",
        borderRadius: 20,
        padding: 18,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 800,
          fontSize: 24,
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

export function ResultTile({
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

export function DebugButton({
  onClick,
  disabled,
  danger,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 14px",
        border: "none",
        borderRadius: 12,
        background: danger ? "oklch(87% 0.09 20)" : "oklch(91% 0.03 88)",
        color: danger ? "oklch(34% 0.1 20)" : INK,
        fontWeight: 700,
        fontSize: 13,
        textAlign: "left",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}
