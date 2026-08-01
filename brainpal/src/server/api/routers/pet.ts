import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getPetHealth } from "~/server/pet/health";

export const petRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    // Lazily create the pet on first fetch rather than requiring a signup
    // hook — keeps "one pet per user" true without extra plumbing.
    const pet = await ctx.db.pet.upsert({
      where: { userId: ctx.session.user.id },
      create: { userId: ctx.session.user.id },
      update: {},
    });

    const health = await getPetHealth(ctx.db, ctx.session.user.id);

    return { ...pet, health };
  }),
});
