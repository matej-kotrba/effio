/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `GroupSubcategory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GroupSubcategory_slug_key" ON "GroupSubcategory"("slug");

-- CreateIndex
CREATE INDEX "GroupSubcategory_slug_idx" ON "GroupSubcategory"("slug");
