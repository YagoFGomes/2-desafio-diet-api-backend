import { Prisma } from '@prisma/client';

export function longestStreak(meals: Prisma.MealsCreateInput[]) {
    let maxStreak = 0;
    let currentStreak = 0;

    meals.forEach(meal => {
        if (meal.inDiet) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 0;
        }
    });

    return maxStreak;
}