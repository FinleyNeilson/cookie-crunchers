import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { seedDemoDataForUser } from "~/server/demo-seed";
import {
  getActivePet,
  getGrowthPoints,
  stageForMastery,
  STAGE_THRESHOLDS,
  MATURE_INTERVAL_DAYS,
} from "~/server/pet/growth";

// Dev/demo-only tooling for exercising growth, graduation, and death
// without needing real SM-2 spacing (which takes real weeks) or a real
// 24h health-grace wait. Never usable in production — every procedure
// checks this first, both as a safety net and because the frontend panel
// that calls these is itself gated on NODE_ENV.
function assertDevOnly() {
  if (env.NODE_ENV === "production") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Debug tools are unavailable in production",
    });
  }
}

const TEST_DECK_COUNT = 20;
const TEST_DECK_PREFIX = "Test Deck ";

export const debugRouter = createTRPCRouter({
  // Bulk-creates decks for stress-testing the decks list/grid at scale —
  // named with a shared prefix so clearTestDecks can find and remove
  // exactly these later without touching real (seeded or user-created)
  // decks.
  addTestDecks: protectedProcedure.mutation(async ({ ctx }) => {
    assertDevOnly();

    for (let i = 1; i <= TEST_DECK_COUNT; i++) {
      await ctx.db.deck.create({
        data: {
          userId: ctx.session.user.id,
          name: `${TEST_DECK_PREFIX}${i}`,
          cards: {
            create: [
              { front: `Test card ${i}.1`, back: `Answer ${i}.1` },
              { front: `Test card ${i}.2`, back: `Answer ${i}.2` },
              { front: `Test card ${i}.3`, back: `Answer ${i}.3` },
            ],
          },
        },
      });
    }

    return { createdCount: TEST_DECK_COUNT };
  }),

  // Removes only the decks addTestDecks created (matched by name prefix) —
  // cards/review logs cascade-delete with them.
  clearTestDecks: protectedProcedure.mutation(async ({ ctx }) => {
    assertDevOnly();

    const { count } = await ctx.db.deck.deleteMany({
      where: {
        userId: ctx.session.user.id,
        name: { startsWith: TEST_DECK_PREFIX },
      },
    });

    return { deletedCount: count };
  }),

  // Instantly matures every card in a deck (or all decks if omitted) —
  // sets intervalDays to the SM-2 "mature" bar and backdates a matching
  // ReviewLog so it counts toward the active pet's growth. Real usage
  // would take real weeks of successful reviews to reach this.
  matureAllCards: protectedProcedure
    .input(z.object({ deckId: z.string().optional() }).optional())
    .mutation(async ({ ctx, input }) => {
      assertDevOnly();

      const cards = await ctx.db.card.findMany({
        where: {
          deck: {
            userId: ctx.session.user.id,
            ...(input?.deckId ? { id: input.deckId } : {}),
          },
        },
      });

      for (const card of cards) {
        await ctx.db.card.update({
          where: { id: card.id },
          data: {
            intervalDays: MATURE_INTERVAL_DAYS,
            repetitions: Math.max(card.repetitions, 4),
            easeFactor: Math.max(card.easeFactor, 2.5),
          },
        });
        await ctx.db.reviewLog.create({
          data: {
            cardId: card.id,
            grade: 5,
            previousInterval: card.intervalDays,
            newInterval: MATURE_INTERVAL_DAYS,
            previousEase: card.easeFactor,
            newEase: Math.max(card.easeFactor, 2.5),
          },
        });
      }

      return { maturedCount: cards.length };
    }),

  // Matures just enough of the least-mature cards to cross into the next
  // life stage (egg -> child -> teen -> adult) on the *current* pet,
  // without retiring/replacing it the way forceGraduate does. If there
  // aren't enough unmatured cards to reach the threshold, advances as far
  // as it can and reports that it didn't reach the next stage.
  advanceStage: protectedProcedure.mutation(async ({ ctx }) => {
    assertDevOnly();

    const pet = await getActivePet(ctx.db, ctx.session.user.id);
    const growthPoints = await getGrowthPoints(
      ctx.db,
      ctx.session.user.id,
      pet.createdAt,
    );
    const currentStage = stageForMastery(growthPoints);

    const ascending = [...STAGE_THRESHOLDS].sort(
      (a, b) => a.minGrowth - b.minGrowth,
    );
    const next =
      ascending[ascending.findIndex((t) => t.stage === currentStage) + 1];
    if (!next) {
      return { stage: currentStage, reachedNextStage: false };
    }

    // A hair over the threshold, not exactly on it, so rounding never
    // leaves it a hair short.
    const needed = next.minGrowth - growthPoints + 0.01;
    const cards = await ctx.db.card.findMany({
      where: { deck: { userId: ctx.session.user.id } },
      orderBy: { intervalDays: "asc" },
    });

    let added = 0;
    for (const card of cards) {
      if (added >= needed) break;
      const currentContribution = Math.min(
        1,
        card.intervalDays / MATURE_INTERVAL_DAYS,
      );
      if (currentContribution >= 1) continue;

      await ctx.db.card.update({
        where: { id: card.id },
        data: {
          intervalDays: MATURE_INTERVAL_DAYS,
          repetitions: Math.max(card.repetitions, 4),
          easeFactor: Math.max(card.easeFactor, 2.5),
        },
      });
      await ctx.db.reviewLog.create({
        data: {
          cardId: card.id,
          grade: 5,
          previousInterval: card.intervalDays,
          newInterval: MATURE_INTERVAL_DAYS,
          previousEase: card.easeFactor,
          newEase: Math.max(card.easeFactor, 2.5),
        },
      });
      added += 1 - currentContribution;
    }

    const newStage = stageForMastery(growthPoints + added);
    return { stage: newStage, reachedNextStage: newStage !== currentStage };
  }),

  // Retires the current pet as graduated and spawns a fresh one, bypassing
  // the real growth-points threshold — same code path review.submit uses,
  // just triggered directly instead of by crossing the adult threshold.
  forceGraduate: protectedProcedure.mutation(async ({ ctx }) => {
    assertDevOnly();

    const pet = await getActivePet(ctx.db, ctx.session.user.id);
    await ctx.db.pet.update({
      where: { id: pet.id },
      data: { retiredAt: new Date(), retirementReason: "graduated" },
    });
    return ctx.db.pet.create({ data: { userId: ctx.session.user.id } });
  }),

  // Retires the current pet as died and spawns a fresh one, bypassing the
  // real health=0 + 24h grace wait — same code path getActivePet's death
  // check uses.
  forceDie: protectedProcedure.mutation(async ({ ctx }) => {
    assertDevOnly();

    const pet = await getActivePet(ctx.db, ctx.session.user.id);
    await ctx.db.pet.update({
      where: { id: pet.id },
      data: { retiredAt: new Date(), retirementReason: "died" },
    });
    return ctx.db.pet.create({ data: { userId: ctx.session.user.id } });
  }),

  // Wipes all of the user's decks/cards/pets and reseeds the standard demo
  // data — a clean-slate button for repeated demo run-throughs.
  resetAccount: protectedProcedure.mutation(async ({ ctx }) => {
    assertDevOnly();

    const userId = ctx.session.user.id;
    await ctx.db.reviewLog.deleteMany({
      where: { card: { deck: { userId } } },
    });
    await ctx.db.card.deleteMany({ where: { deck: { userId } } });
    await ctx.db.deck.deleteMany({ where: { userId } });
    await ctx.db.pet.deleteMany({ where: { userId } });
    await seedDemoDataForUser(ctx.db, userId);

    return { ok: true };
  }),
});
