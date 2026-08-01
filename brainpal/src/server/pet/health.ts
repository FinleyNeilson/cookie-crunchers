import { type PrismaClient } from "@prisma/client";

// health is computed on-demand, never stored (see docs/architecture.md) so
// overdue debt keeps decaying with the passage of time, not just on review
// events. The exact weights below are a first pass and are meant to be
// tuned once the pet UI exists to see how it feels.

const MAX_OVERDUE_PENALTY = 60;
const MAX_STREAK_BONUS = 15;
const ACCURACY_WINDOW = 20;
const STREAK_LOOKBACK_DAYS = 90;

export interface PetHealthInputs {
  overdueCount: number;
  overdueDaysSum: number;
  recentAccuracy: number | null;
  currentStreakDays: number;
}

export function computeHealth(inputs: PetHealthInputs): number {
  const { overdueCount, overdueDaysSum, recentAccuracy, currentStreakDays } =
    inputs;

  let health = 100;

  health -= Math.min(
    MAX_OVERDUE_PENALTY,
    overdueCount * 4 + overdueDaysSum * 1.5,
  );

  if (recentAccuracy !== null && recentAccuracy < 0.7) {
    health -= (0.7 - recentAccuracy) * 100;
  }

  health += Math.min(MAX_STREAK_BONUS, currentStreakDays * 1.5);

  return Math.round(Math.max(0, Math.min(100, health)));
}

function startOfDay(date: Date): number {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
}

function currentStreakDays(reviewDates: Date[]): number {
  const days = new Set(reviewDates.map(startOfDay));

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!days.has(cursor.getTime())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (days.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export async function getPetHealth(
  db: PrismaClient,
  userId: string,
): Promise<number> {
  const now = new Date();

  const overdueCards = await db.card.findMany({
    where: { deck: { userId }, dueAt: { lt: now } },
    select: { dueAt: true },
  });

  const overdueCount = overdueCards.length;
  const overdueDaysSum = overdueCards.reduce(
    (sum, card) =>
      sum + (now.getTime() - card.dueAt.getTime()) / (1000 * 60 * 60 * 24),
    0,
  );

  const lookbackStart = new Date(now);
  lookbackStart.setDate(lookbackStart.getDate() - STREAK_LOOKBACK_DAYS);

  const recentReviews = await db.reviewLog.findMany({
    where: { card: { deck: { userId } }, reviewedAt: { gte: lookbackStart } },
    select: { reviewedAt: true, grade: true },
    orderBy: { reviewedAt: "desc" },
  });

  const accuracyWindow = recentReviews.slice(0, ACCURACY_WINDOW);
  const recentAccuracy =
    accuracyWindow.length > 0
      ? accuracyWindow.filter((r) => r.grade >= 3).length /
        accuracyWindow.length
      : null;

  return computeHealth({
    overdueCount,
    overdueDaysSum,
    recentAccuracy,
    currentStreakDays: currentStreakDays(
      recentReviews.map((r) => r.reviewedAt),
    ),
  });
}
