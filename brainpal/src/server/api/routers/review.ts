import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  getActivePet,
  getGrowthPoints,
  stageForMastery,
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

      // Growth is scoped to the active pet's lifetime, not the account's
      // whole review history — see server/pet/growth.ts. getActivePet also
      // resolves any health-triggered death from before this review, so a
      // graduation check here always applies to whichever pet is actually
      // current at this moment.
      const activePet = await getActivePet(ctx.db, ctx.session.user.id);
      const growthPoints = await getGrowthPoints(
        ctx.db,
        ctx.session.user.id,
        activePet.createdAt,
      );

      let graduated: { name: string | null; species: string | null } | null =
        null;

      if (stageForMastery(growthPoints) === "adult") {
        await ctx.db.pet.update({
          where: { id: activePet.id },
          data: { retiredAt: new Date(), retirementReason: "graduated" },
        });
        await ctx.db.pet.create({ data: { userId: ctx.session.user.id } });
        graduated = { name: activePet.name, species: activePet.species };
      }

      return { reviewLog, graduated };
    }),
});
