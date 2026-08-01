import { TERRACOTTA } from "~/app/_components/pet-app/constants";
import { PetPortrait } from "~/app/_components/pet-app/pet-visuals";
import {
  type PetState,
  type SessionResults,
} from "~/app/_components/pet-app/types";
import { ResultTile } from "~/app/_components/pet-app/ui";

export function ResultsScreen({
  results,
  pet,
  speciesColor,
  onBackHome,
}: {
  results: SessionResults;
  pet: PetState;
  speciesColor: string;
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
        {results.celebrate && (
          <>
            <div
              style={{
                position: "absolute",
                top: -6,
                left: "28%",
                width: 10,
                height: 10,
                background: TERRACOTTA,
                borderRadius: "50%",
                animation: "sparklePulse 1.4s ease-in-out infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 4,
                right: "26%",
                width: 8,
                height: 8,
                background: "oklch(80% 0.11 60)",
                borderRadius: "50%",
                animation: "sparklePulse 1.4s ease-in-out infinite 0.3s",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 6,
                left: "22%",
                width: 7,
                height: 7,
                background: "oklch(78% 0.1 150)",
                borderRadius: "50%",
                animation: "sparklePulse 1.4s ease-in-out infinite 0.6s",
              }}
            />
          </>
        )}
        <div
          style={{
            width: 130,
            height: 130,
            animation: "petBounce 1.8s ease-in-out infinite",
          }}
        >
          <PetPortrait pet={pet} color={speciesColor} mood="happy" size={130} />
        </div>
      </div>
      <div style={{ fontWeight: 700, fontSize: 16 }}>{results.message}</div>

      <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
        <ResultTile value={`${results.accuracy}%`} label="Accuracy" />
        <ResultTile
          value={`${results.healthDelta >= 0 ? "+" : ""}${results.healthDelta}`}
          label="Health Δ"
        />
        <ResultTile value={pet.streak} label="Day streak" />
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
