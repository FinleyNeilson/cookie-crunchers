import { TERRACOTTA } from "~/app/_components/pet-app/constants";
import { PetPortrait } from "~/app/_components/pet-app/pet-visuals";
import {
  type PetState,
  type SessionResults,
} from "~/app/_components/pet-app/types";
import { ResultTile, Sparkles } from "~/app/_components/pet-app/ui";

export function ResultsScreen({
  results,
  pet,
  onBackHome,
}: {
  results: SessionResults;
  pet: PetState;
  onBackHome: () => void;
}) {
  return (
    <div
      style={{
        maxWidth: 480,
        margin: "20px auto 0",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 800,
          fontSize: 28,
        }}
      >
        Session complete!
      </div>
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          margin: "24px 0",
        }}
      >
        {results.celebrate && <Sparkles />}
        <div
          style={{
            width: 130,
            height: 130,
            animation: "petBounce 1.8s ease-in-out infinite",
          }}
        >
          <PetPortrait pet={pet} size={130} />
        </div>
      </div>
      <div style={{ fontWeight: 700, fontSize: 16 }}>{results.message}</div>

      <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
        <ResultTile value={`${results.accuracy}%`} label="Accuracy" />
        <ResultTile
          value={`${results.healthDelta >= 0 ? "+" : ""}${results.healthDelta}`}
          label="Health Δ"
        />
      </div>

      <button
        onClick={onBackHome}
        style={{
          marginTop: 26,
          width: "100%",
          padding: 16,
          border: "none",
          borderRadius: 20,
          background: TERRACOTTA,
          color: "oklch(98% 0.01 90)",
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 700,
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        Back to {pet.name}
      </button>
    </div>
  );
}
