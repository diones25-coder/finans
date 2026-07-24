/*
  Warnings:

  - Added the required column `userId` to the `Spent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Spent" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Spent" ADD CONSTRAINT "Spent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
