-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mealsId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_mealsId_fkey" FOREIGN KEY ("mealsId") REFERENCES "Meals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
