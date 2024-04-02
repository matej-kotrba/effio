/*
  Warnings:

  - A unique constraint covering the columns `[testId,subcategoryId]` on the table `GroupSubcategoryOnTests` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GroupSubcategoryOnTests_testId_subcategoryId_key" ON "GroupSubcategoryOnTests"("testId", "subcategoryId");
