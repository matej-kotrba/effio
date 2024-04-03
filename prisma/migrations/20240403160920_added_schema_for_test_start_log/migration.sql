-- CreateTable
CREATE TABLE "UserSubcategoryTestStartLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSubcategoryTestStartLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserSubcategoryTestStartLog_userId_idx" ON "UserSubcategoryTestStartLog"("userId");

-- CreateIndex
CREATE INDEX "UserSubcategoryTestStartLog_testId_idx" ON "UserSubcategoryTestStartLog"("testId");

-- CreateIndex
CREATE INDEX "UserSubcategoryTestStartLog_subcategoryId_idx" ON "UserSubcategoryTestStartLog"("subcategoryId");

-- AddForeignKey
ALTER TABLE "UserSubcategoryTestStartLog" ADD CONSTRAINT "UserSubcategoryTestStartLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubcategoryTestStartLog" ADD CONSTRAINT "UserSubcategoryTestStartLog_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubcategoryTestStartLog" ADD CONSTRAINT "UserSubcategoryTestStartLog_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "GroupSubcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
