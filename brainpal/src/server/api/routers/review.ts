import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  getActivePet,
  getGrowthPoints,
  graduatePet,
  stageForMastery,
  type LifeStage,
} from "~/server/pet/growth";
import { sm2 } from "~/server/srs/sm2";

export const reviewRouter = createTRPCRouter({
  due: protectedProcedure
    .input(
      z
        .object({
          deckId: z.string().optional(),
          // Practice mode: study a deck even when nothing's actually due
          // yet. These still submit real SM-2 reviews via review.submit —
          // it's "study more than required," not a scheduling-free cram
          // mode.
          includeNotDue: z.boolean().optional(),
        })
        .optional(),
    )
    .query(({ ctx, input }) =>
      ctx.db.card.findMany({
        where: {
          deck: { userId: ctx.session.user.id },
          ...(input?.deckId ? { deckId: input.deckId } : {}),
          ...(input?.includeNotDue ? {} : { dueAt: { lte: new Date() } }),
        },
        orderBy: { dueAt: "asc" },
      }),
    ),

  submit: protectedProcedure
    .input(
      z.object({ cardId: z.string(), grade: z.number().int().min(0).max(5) }),
    )
    .mutation(async ({ ctx, input }) => {
      const card = await ctx.db.card.findFirst({
        where: { id: input.cardId, deck: { userId: ctx.session.user.id } },
      });
      if (!card) throw new TRPCError({ code: "NOT_FOUND" });

      const result = sm2(
        {
          easeFactor: card.easeFactor,
          intervalDays: card.intervalDays,
          repetitions: card.repetitions,
        },
        input.grade,
      );

      // Growth is scoped to the active pet's lifetime, not the account's
      // whole review history — see server/pet/growth.ts. getActivePet also
      // resolves any health-triggered death from before this review, so a
      // graduation check here always applies to whichever pet is actually
      // current at this moment. `diedPet` means *that* resolution is what
      // just discovered the death — surfaced below so the client can show
      // a death screen for it. Snapshotted *before* the update below so a
      // stage change caused by this review can be detected by comparing
      // against the stage after.
      const { pet: activePet, diedPet } = await getActivePet(
        ctx.db,
        ctx.session.user.id,
      );
      const stageBefore = stageForMastery(
        await getGrowthPoints(ctx.db, ctx.session.user.id, activePet.createdAt),
      );

      const [, reviewLog] = await ctx.db.$transaction([
        ctx.db.card.update({
          where: { id: card.id },
          data: {
            easeFactor: result.easeFactor,
            intervalDays: result.intervalDays,
            repetitions: result.repetitions,
            dueAt: result.dueAt,
          },
        }),
        ctx.db.reviewLog.create({
          data: {
            cardId: card.id,
            grade: input.grade,
            previousInterval: card.intervalDays,
            newInterval: result.intervalDays,
            previousEase: card.easeFactor,
            newEase: result.easeFactor,
          },
        }),
      ]);

      const growthPoints = await getGrowthPoints(
        ctx.db,
        ctx.session.user.id,
        activePet.createdAt,
      );
      const stageAfter = stageForMastery(growthPoints);

      let graduated: { name: string | null; species: string | null } | null =
        null;
      let stageAdvanced: { from: LifeStage; to: LifeStage } | null = null;

      if (stageAfter !== stageBefore) {
        stageAdvanced = { from: stageBefore, to: stageAfter };
        if (stageAfter === "adult") {
          graduated = await graduatePet(ctx.db, ctx.session.user.id, activePet);
        }
      }

      return { reviewLog, graduated, stageAdvanced, diedPet };
    }),
});
