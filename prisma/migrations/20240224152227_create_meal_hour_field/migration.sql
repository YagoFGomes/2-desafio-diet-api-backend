/*
  Warnings:

  - Added the required column `meal_hour` to the `Meals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Meals" ADD COLUMN     "meal_hour" TIMESTAMP(3) NOT NULL;
