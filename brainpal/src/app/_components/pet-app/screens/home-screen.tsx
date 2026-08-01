import {
  CARD_BG,
  CARD_LINE,
  STAGE_LABEL,
  STAGE_SIZE,
  TERRACOTTA,
} from "~/app/_components/pet-app/constants";
import { Cloud, PetPortrait } from "~/app/_components/pet-app/pet-visuals";
import {
  type PetState,
  type RetiredPet,
} from "~/app/_components/pet-app/types";
import { StatBar, StatTile } from "~/app/_components/pet-app/ui";
import { RetiredPetSprite } from "~/app/_components/pet-app/village";

export function HomeScreen({
  pet,
  speciesColor,
  speciesLabel,
  mood,
  isNeglected,
  growthProgressPct,
  growthRightLabel,
  totalDue,
  decksCount,
  weeklyAccuracy,
  retiredPets,
  onSelectRetiredPet,
  onStudyNow,
}: {
  pet: PetState;
  speciesColor: string;
  speciesLabel: string;
  mood: "happy" | "neutral" | "sad";
  isNeglected: boolean;
  growthProgressPct: number;
  growthRightLabel: string;
  totalDue: number;
  decksCount: number;
  weeklyAccuracy: number;
  retiredPets: RetiredPet[] | undefined;
  onSelectRetiredPet: (pet: RetiredPet) => void;
  onStudyNow: () => void;
}) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        flex: "1 1 auto",
        background:
          "linear-gradient(180deg, oklch(92% 0.05 70) 0%, oklch(93% 0.04 82) 40%, oklch(91% 0.05 95) 68%)",
        paddingBottom: 56,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 36,
          right: 64,
          width: 84,
          height: 84,
          borderRadius: "50%",
          background: "oklch(88% 0.13 90)",
          boxShadow: "0 0 60px oklch(88% 0.13 90 / 0.55)",
        }}
      />
      <Cloud top={64} left="8%" scale={1} />
      <Cloud top={112} left="58%" scale={0.7} />
      <Cloud top={38} left="34%" scale={0.5} />

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "-10%",
          width: "120%",
          height: 300,
          borderRadius: "50% 50% 0 0",
          background:
            "linear-gradient(180deg, oklch(80% 0.09 140), oklch(70% 0.1 140))",
          boxShadow: "inset 0 14px 0 oklch(86% 0.08 140 / 0.55)",
        }}
      />

      {retiredPets?.map((retired) => (
        <RetiredPetSprite
          key={retired.id}
          pet={retired}
          onClick={() => onSelectRetiredPet(retired)}
        />
      ))}

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingTop: 70,
          minHeight: 360,
          // Only the centered avatar/name card (below) has anything to
          // click — the rest of this row is empty, full-width flex space
          // that would otherwise sit above (and swallow clicks meant for)
          // the retired-pet sprites at zIndex 1.
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 190,
              height: 190,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "petBounce 2.6s ease-in-out infinite",
            }}
          >
            <PetPortrait
              pet={pet}
              color={speciesColor}
              mood={mood}
              size={STAGE_SIZE[pet.stage]}
            />
          </div>
          <div
            style={{
              textAlign: "center",
              marginTop: 4,
              background: "oklch(98% 0.02 80 / 0.9)",
              padding: "6px 14px",
              borderRadius: 14,
              border: `2px solid ${CARD_LINE}`,
            }}
          >
            <div
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              {pet.name} the {speciesLabel}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "oklch(48% 0.04 255 / 0.65)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {STAGE_LABEL[pet.stage]} · {pet.health}% health
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 3,
          maxWidth: 520,
          margin: "-24px auto 0",
          background: CARD_BG,
          borderRadius: 28,
          padding: "26px 26px 24px",
          border: `2px solid ${CARD_LINE}`,
          boxShadow: "0 14px 34px oklch(35% 0.05 60 / 0.16)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <StatBar
            label={`Growth · ${STAGE_LABEL[pet.stage]}`}
            value={growthProgressPct}
            hue={40}
            rightLabel={growthRightLabel}
          />
          <StatBar label="Health" value={pet.health} hue={150} />
        </div>

        {isNeglected && (
          <div
            style={{
              marginTop: 16,
              background: "oklch(90% 0.06 40)",
              color: "oklch(36% 0.09 35)",
              fontWeight: 700,
              fontSize: 13,
              padding: "10px 12px",
              borderRadius: 14,
              textAlign: "center",
            }}
          >
            {pet.name} feels neglected — study today to cheer them up.
          </div>
        )}

        <button
          onClick={onStudyNow}
          style={{
            marginTop: 18,
            width: "100%",
            padding: 15,
            border: "none",
            borderRadius: 18,
            background: TERRACOTTA,
            color: "oklch(98% 0.01 90)",
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
            boxShadow: "0 8px 20px oklch(66% 0.13 40 / 0.35)",
          }}
        >
          Study now — {totalDue} due
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,minmax(0,1fr))",
            gap: 12,
            marginTop: 18,
          }}
        >
          <StatTile value={decksCount} label="Decks" />
          <StatTile value={`${weeklyAccuracy}%`} label="7-day accuracy" />
        </div>
      </div>
    </div>
  );
}
