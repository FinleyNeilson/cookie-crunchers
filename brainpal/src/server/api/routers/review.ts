import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { sm2 } from "~/server/srs/sm2";

export const reviewRouter = createTRPCRouter({
  due: protectedProcedure
    .input(z.object({ deckId: z.string().optional() }).optional())
    .query(({ ctx, input }) =>
      ctx.db.card.findMany({
        where: {
          deck: { userId: ctx.session.user.id },
          ...(input?.deckId ? { deckId: input.deckId } : {}),
          dueAt: { lte: new Date() },
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

      return reviewLog;
    }),
});
