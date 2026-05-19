/*
  Warnings:

  - You are about to drop the column `actualWeight` on the `CollectionItem` table. All the data in the column will be lost.
  - Added the required column `actualValue` to the `CollectionItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CollectionItem" DROP COLUMN "actualWeight",
ADD COLUMN     "actualValue" DOUBLE PRECISION NOT NULL;
