/*
  Warnings:

  - Added the required column `name` to the `ProgramExpense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProgramExpense" ADD COLUMN     "name" TEXT NOT NULL;
