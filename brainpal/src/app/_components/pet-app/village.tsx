import { PetFace } from "~/app/_components/pet-app/pet-visuals";
import { type RetiredPet, type Species } from "~/app/_components/pet-app/types";

// Simple deterministic string hash so each retired pet's sprite position is
// stable across refetches instead of jumping around on every re-render.
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function RetiredPetPortrait({
  pet,
  size,
}: {
  pet: RetiredPet;
  size: number;
}) {
  // Died pets render as the full ghost sprite — the species portrait is not
  // shown alongside it, whether or not a species was ever chosen.
  if (pet.retirementReason === "died") {
    return (
      <div style={{ width: size, height: size, opacity: 0.7 }}>
        <img
          src="/pets/ghost.svg"
          alt="Ghost"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    );
  }

  // Graduated pets always have a species by the time they retire.
  if (!pet.species) return null;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <PetFace species={pet.species as Species} size={size} />
    </div>
  );
}

// Ambient background sprite on the home/village scene — deterministically
// scattered (stable per pet.id), subtle enough to read as background
// rather than competing with the current pet in the foreground.
export function RetiredPetSprite({
  pet,
  onClick,
}: {
  pet: RetiredPet;
  onClick: () => void;
}) {
  const h = hashString(pet.id);
  const isGhost = pet.retirementReason === "died";
  // The foreground layers sit above sprites, allowing pets to be scattered
  // across the whole illustrated hill without covering the active pet/card.
  const horizontalOffset = ((h >> 4) % 1000) / 1000;
  const leftPct = 4 + horizontalOffset * 92;
  // Retired pets use the lower hill area, below the study card (which sits
  // roughly in the 403-714px band, centered, atop this same container —
  // see HomeScreen) so they don't spawn hidden underneath it. Ghosts may
  // also drift into the sky, above the card.
  const verticalOffset = ((h >> 10) % 1000) / 1000;
  const topPx =
    isGhost ? 80 + verticalOffset * 620 : 740 + verticalOffset * 140;
  const size = 64 + (((h >> 20) % 1000) / 1000) * 24;

  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        left: `${leftPct}%`,
        top: topPx,
        zIndex: 1,
        border: "none",
        background: "transparent",
        padding: 0,
        cursor: "pointer",
        width: size,
        height: size,
      }}
    >
      <RetiredPetPortrait pet={pet} size={size} />
    </button>
  );
}
