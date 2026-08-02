import { SPECIES, SPECIES_IMAGE } from "~/app/_components/pet-app/constants";
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
        background: "oklch(98% 0.03 90 / 0.9)",
        boxShadow: `-${18 * scale}px ${4 * scale}px 0 -${2 * scale}px oklch(98% 0.03 90 / 0.9), ${18 * scale}px ${4 * scale}px 0 -${4 * scale}px oklch(98% 0.03 90 / 0.75)`,
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
        src="/pets/egg.svg"
        alt="Egg"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          // The source art is a wide canvas (2360x1640) letterboxed into
          // this square box — anchoring to the bottom instead of centering
          // keeps the character sitting on the "ground" instead of
          // floating with a gap beneath it.
          objectPosition: "bottom",
        }}
      />
    </div>
  );
}

export function PetPortrait({ pet, size }: { pet: PetState; size: number }) {
  if (pet.stage === "egg") return <Egg size={size} />;
  return (
    // Non-egg stage guarantees a species was already chosen — see the
    // PetState.species comment.
    <PetFace species={pet.species!} size={size} />
  );
}

// Every species is hand-drawn sprite art (public/pets/*.svg) — no more
// CSS-drawn fallback face, so there's no `color`/`mood` to react to here.
export function PetFace({
  species,
  size,
}: {
  species: Species;
  size: number;
}) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <img
        src={SPECIES_IMAGE[species]}
        alt={`${SPECIES[species].label} pet`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          // See the matching comment in Egg — the source art is a wide
          // canvas letterboxed into this square box.
          objectPosition: "bottom",
        }}
      />
    </div>
  );
}
