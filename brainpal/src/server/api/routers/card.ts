import { TRPCError } from "@trpc/server";
import { type PrismaClient } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

async function requireOwnedDeck(
  db: PrismaClient,
  userId: string,
  deckId: string,
) {
  const deck = await db.deck.findFirst({ where: { id: deckId, userId } });
  if (!deck) throw new TRPCError({ code: "NOT_FOUND" });
  return deck;
}

async function requireOwnedCard(
  db: PrismaClient,
  userId: string,
  cardId: string,
) {
  const card = await db.card.findFirst({
    where: { id: cardId, deck: { userId } },
  });
  if (!card) throw new TRPCError({ code: "NOT_FOUND" });
  return card;
}

export const cardRouter = createTRPCRouter({
  listByDeck: protectedProcedure
    .input(z.object({ deckId: z.string() }))
    .query(async ({ ctx, input }) => {
      await requireOwnedDeck(ctx.db, ctx.session.user.id, input.deckId);

      return ctx.db.card.findMany({
        where: { deckId: input.deckId },
        orderBy: { createdAt: "asc" },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        deckId: z.string(),
        front: z.string().min(1).max(2000),
        back: z.string().min(1).max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await requireOwnedDeck(ctx.db, ctx.session.user.id, input.deckId);

      return ctx.db.card.create({ data: input });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        front: z.string().min(1).max(2000).optional(),
        back: z.string().min(1).max(2000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await requireOwnedCard(ctx.db, ctx.session.user.id, id);

      return ctx.db.card.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await requireOwnedCard(ctx.db, ctx.session.user.id, input.id);

      return ctx.db.card.delete({ where: { id: input.id } });
    }),
});
