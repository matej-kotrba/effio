-- CreateEnum
CREATE TYPE "GroupSubcategoryType" AS ENUM ('CHAT', 'ANNOUCEMENT');

-- AlterTable
ALTER TABLE "GroupSubcategory" ADD COLUMN     "type" "GroupSubcategoryType" NOT NULL DEFAULT 'CHAT';
