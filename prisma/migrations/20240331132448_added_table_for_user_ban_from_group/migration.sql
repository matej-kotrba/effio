-- CreateTable
CREATE TABLE "UserOnGroupBan" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserOnGroupBan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserOnGroupBan_userId_idx" ON "UserOnGroupBan"("userId");

-- CreateIndex
CREATE INDEX "UserOnGroupBan_groupId_idx" ON "UserOnGroupBan"("groupId");

-- AddForeignKey
ALTER TABLE "UserOnGroupBan" ADD CONSTRAINT "UserOnGroupBan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnGroupBan" ADD CONSTRAINT "UserOnGroupBan_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
