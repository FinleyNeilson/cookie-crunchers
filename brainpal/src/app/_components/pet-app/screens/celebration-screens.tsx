import {
  CARD_LINE,
  INK,
  PAPER,
  SPECIES,
  STAGE_LABEL,
  STAGE_SIZE,
  TERRACOTTA,
} from "~/app/_components/pet-app/constants";
import { PetFace } from "~/app/_components/pet-app/pet-visuals";
import { type LifeStage, type Species } from "~/app/_components/pet-app/types";
import { Sparkles } from "~/app/_components/pet-app/ui";

const screenStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 20,
  fontFamily: "'Nunito', sans-serif",
  background: PAPER,
  color: INK,
  padding: 24,
  textAlign: "center",
};

const titleStyle: React.CSSProperties = {
  fontFamily: "'Baloo 2', sans-serif",
  fontWeight: 800,
  fontSize: 26,
};

const messageStyle: React.CSSProperties = {
  fontSize: 15,
  color: "oklch(40% 0.05 255 / 0.85)",
  maxWidth: 360,
  lineHeight: 1.5,
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "14px 28px",
  border: "none",
  borderRadius: 16,
  background: TERRACOTTA,
  color: "oklch(98% 0.01 90)",
  fontFamily: "'Baloo 2', sans-serif",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "14px 28px",
  border: `2px solid ${CARD_LINE}`,
  borderRadius: 16,
  background: "transparent",
  color: INK,
  fontFamily: "'Baloo 2', sans-serif",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
};

// Shown right when a review pushes the active pet's growth past a stage
// threshold (egg -> child -> teen). Reaching "adult" instead shows
// GraduationScreen below — that threshold retires the pet rather than
// just leveling it up.
export function StageUpScreen({
  petName,
  species,
  stage,
  onContinue,
}: {
  petName: string;
  species: Species;
  stage: LifeStage;
  onContinue: () => void;
}) {
  const size = STAGE_SIZE[stage];
  const article = stage === "adult" ? "an" : "a";

  return (
    <div style={screenStyle}>
      <div style={titleStyle}>Leveled up!</div>
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          margin: "8px 0",
        }}
      >
        <Sparkles />
        <div
          style={{
            width: size,
            height: size,
            animation: "petBounce 1.8s ease-in-out infinite",
          }}
        >
          <PetFace species={species} size={size} stage={stage} />
        </div>
      </div>
      <div style={messageStyle}>
        {petName} grew into {article} <strong>{STAGE_LABEL[stage]}</strong>!
      </div>
      <button onClick={onContinue} style={primaryButtonStyle}>
        Continue
      </button>
    </div>
  );
}

// Shown when the active pet crosses into "adult" — which immediately
// retires it as graduated and spawns a blank replacement (see
// server/pet/growth.ts's graduatePet). The two choices here decide what
// `awaitingNewEgg` does in signed-in-pet-app.tsx: keep browsing the
// village as-is, or jump straight into picking the replacement's species.
export function GraduationScreen({
  petName,
  species,
  onReturnToVillage,
  onFindNewEgg,
}: {
  petName: string;
  species: Species;
  onReturnToVillage: () => void;
  onFindNewEgg: () => void;
}) {
  const speciesInfo = SPECIES[species];

  return (
    <div style={screenStyle}>
      <div style={titleStyle}>Graduation day!</div>
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          margin: "8px 0",
        }}
      >
        <Sparkles />
        <div
          style={{
            width: 150,
            height: 150,
            animation: "petBounce 1.8s ease-in-out infinite",
          }}
        >
          <PetFace species={species} size={150} />
        </div>
      </div>
      <div style={messageStyle}>
        <strong>{petName}</strong> finished growing up and has graduated as a{" "}
        {speciesInfo.label}! They&apos;ll join the village as a permanent
        resident.
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
        <button onClick={onReturnToVillage} style={secondaryButtonStyle}>
          Return to village
        </button>
        <button onClick={onFindNewEgg} style={primaryButtonStyle}>
          Find a new egg
        </button>
      </div>
    </div>
  );
}
