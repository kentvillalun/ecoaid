/*
  Warnings:

  - You are about to alter the column `maxPoints` on the `Program` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Program" ALTER COLUMN "maxPoints" DROP NOT NULL,
ALTER COLUMN "maxPoints" SET DATA TYPE INTEGER;
