import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getPetStats } from "~/server/pet/health";

export const petRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    // Lazily create the pet in case the createUser seed event was skipped
    // (e.g. a user that existed before that hook was added).
    const pet = await ctx.db.pet.upsert({
      where: { userId: ctx.session.user.id },
      create: { userId: ctx.session.user.id },
      update: {},
    });

    const stats = await getPetStats(ctx.db, ctx.session.user.id);

    return { ...pet, ...stats };
  }),
});
