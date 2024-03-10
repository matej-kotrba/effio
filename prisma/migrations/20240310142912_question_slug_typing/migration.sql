/*
  Warnings:

  - You are about to drop the column `properties` on the `QuestionType` table. All the data in the column will be lost.
  - Changed the type of `slug` on the `QuestionType` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "QuestionTypeSlug" AS ENUM ('pickOne', 'trueFalse', 'connect', 'write', 'fill', 'geography', 'image', 'programming', 'bitmap');

-- AlterTable
ALTER TABLE "QuestionType" DROP COLUMN "properties",
DROP COLUMN "slug",
ADD COLUMN     "slug" "QuestionTypeSlug" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "QuestionType_slug_key" ON "QuestionType"("slug");
