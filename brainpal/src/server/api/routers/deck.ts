import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const deckRouter = createTRPCRouter({
  list: protectedProcedure.query(({ ctx }) =>
    ctx.db.deck.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.deck.create({
        data: { ...input, userId: ctx.session.user.id },
      }),
    ),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const deck = await ctx.db.deck.findFirst({
        where: { id, userId: ctx.session.user.id },
      });
      if (!deck) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.deck.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deck = await ctx.db.deck.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },
      });
      if (!deck) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.deck.delete({ where: { id: input.id } });
    }),
});
