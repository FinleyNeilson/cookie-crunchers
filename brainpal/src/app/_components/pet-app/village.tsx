import { SPECIES } from "~/app/_components/pet-app/constants";
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
          src="/pets/ghost.png"
          alt="Ghost"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    );
  }

  // Graduated pets always have a species by the time they retire.
  if (!pet.species) return null;

  const speciesInfo = SPECIES[pet.species as Species];

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <PetFace
        species={pet.species as Species}
        color={speciesInfo.color}
        size={size}
        mood="happy"
      />
    </div>
  );
}

// Ambient background sprite on the home/village scene — deterministically
// scattered (stable per pet.id), small and muted so it reads as background
// rather than competing with the current pet in the foreground.
export function RetiredPetSprite({
  pet,
  onClick,
}: {
  pet: RetiredPet;
  onClick: () => void;
}) {
  const h = hashString(pet.id);
  // Stay clear of the centered pet-portrait/name card entirely (left/right
  // margins only, never the middle) rather than fighting it for stacking
  // order — that keeps sprites a true background layer (zIndex: 1, behind
  // the foreground) while still remaining clickable, since nothing else
  // ever occupies the same pixels.
  const onLeftSide = h % 2 === 0;
  const leftPct = onLeftSide
    ? 6 + (((h >> 4) % 1000) / 1000) * 20
    : 74 + (((h >> 4) % 1000) / 1000) * 20;
  // top, not bottom: the scene wrapper's total height includes the
  // health/growth stats card below it (a normal-flow sibling with its own
  // opaque background), so anchoring from the bottom put sprites entirely
  // behind that card. Anchoring from the top instead lands them in the
  // stable hero/pet-portrait region, independent of that card's height.
  const topPx = 130 + (((h >> 10) % 1000) / 1000) * 260;
  const size = 40 + (((h >> 20) % 1000) / 1000) * 16;

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
