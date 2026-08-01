import {
  BLUSH,
  CARD_BG,
  INK,
  SPECIES,
  SPECIES_IMAGE,
} from "~/app/_components/pet-app/constants";
import { type PetState, type Species } from "~/app/_components/pet-app/types";

export function Cloud({
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

export function Egg({ size = 108 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        animation: "crackShake 3s ease-in-out infinite",
      }}
    >
      <img
        src="/pets/egg.png"
        alt="Egg"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
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

export function PetPortrait({
  pet,
  color,
  mood,
  size,
}: {
  pet: PetState;
  color: string;
  mood: "happy" | "neutral" | "sad";
  size: number;
}) {
  if (pet.stage === "egg") return <Egg size={size} />;
  return (
    <PetFace species={pet.species} color={color} size={size} mood={mood} />
  );
}

export function PetFace({
  species,
  color,
  size,
  mood,
}: {
  species: Species;
  color: string;
  size: number;
  mood: "happy" | "neutral" | "sad";
}) {
  // Bunny/Hopling/Twirlet use real sprite art (public/pets/*.png) instead of
  // a CSS-drawn face — static images, so they don't react to `color`/`mood`
  // the way the CSS species do.
  const imageSrc = SPECIES_IMAGE[species];
  if (imageSrc) {
    return (
      <div style={{ position: "relative", width: size, height: size }}>
        <img
          src={imageSrc}
          alt={`${SPECIES[species].label} pet`}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    );
  }

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
