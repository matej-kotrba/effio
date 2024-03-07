-- CreateEnum
CREATE TYPE "UserRoles" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "AdminLogsActions" AS ENUM ('DELETE_USERS', 'BLOCKED_USERS', 'CHANGE_USER_ROLE', 'DELETE_TESTS');

-- CreateEnum
CREATE TYPE "MessageTypes" AS ENUM ('MESSAGE', 'TEST');

-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('REGULAR', 'PROGRAMMING');

-- CreateEnum
CREATE TYPE "QuestionType_type" AS ENUM ('REGULAR', 'PROGRAMMING');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_in" INTEGER DEFAULT 0,
    "expires_at" INTEGER DEFAULT 0,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "UserRoles" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "properties" JSONB NOT NULL,
    "type" "QuestionType_type" NOT NULL DEFAULT 'REGULAR',

    CONSTRAINT "QuestionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "ownerId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "type" "TestType" NOT NULL DEFAULT 'REGULAR',
    "randomQuestionOrder" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestVersion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL,
    "testId" TEXT NOT NULL,
    "markSystemJSON" JSONB NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TestVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "typeId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarkSystem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "markInterfaceJSON" JSONB NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarkSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestRecord" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "testId" TEXT NOT NULL,
    "userId" TEXT,
    "subacategoryId" TEXT,
    "userPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shouldCountToStatistics" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TestRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionRecord" (
    "id" TEXT NOT NULL,
    "testRecordId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "userPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuestionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagOnTests" (
    "id" SERIAL NOT NULL,
    "testId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "TagOnTests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#000000',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupSubcategoryOnTests" (
    "id" SERIAL NOT NULL,
    "testId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "addedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupSubcategoryOnTests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupOnUsers" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "groupId" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupOnUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupInvite" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupSubcategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "GroupSubcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupSubcategoreyMessage" (
    "id" TEXT NOT NULL,
    "groupSubcategoryId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "messageType" "MessageTypes" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "testId" TEXT,

    CONSTRAINT "GroupSubcategoreyMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestStar" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestStar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminLogs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AdminLogsActions" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_name_id_idx" ON "User"("name", "id");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionType_name_key" ON "QuestionType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionType_slug_key" ON "QuestionType"("slug");

-- CreateIndex
CREATE INDEX "Test_ownerId_idx" ON "Test"("ownerId");

-- CreateIndex
CREATE INDEX "Test_title_idx" ON "Test"("title");

-- CreateIndex
CREATE INDEX "TestVersion_testId_idx" ON "TestVersion"("testId");

-- CreateIndex
CREATE INDEX "TestVersion_version_idx" ON "TestVersion"("version");

-- CreateIndex
CREATE INDEX "Question_typeId_idx" ON "Question"("typeId");

-- CreateIndex
CREATE INDEX "Question_testId_idx" ON "Question"("testId");

-- CreateIndex
CREATE INDEX "MarkSystem_ownerId_idx" ON "MarkSystem"("ownerId");

-- CreateIndex
CREATE INDEX "TestRecord_testId_idx" ON "TestRecord"("testId");

-- CreateIndex
CREATE INDEX "TestRecord_userId_idx" ON "TestRecord"("userId");

-- CreateIndex
CREATE INDEX "TestRecord_subacategoryId_idx" ON "TestRecord"("subacategoryId");

-- CreateIndex
CREATE INDEX "QuestionRecord_testRecordId_idx" ON "QuestionRecord"("testRecordId");

-- CreateIndex
CREATE INDEX "QuestionRecord_questionId_idx" ON "QuestionRecord"("questionId");

-- CreateIndex
CREATE INDEX "TagOnTests_testId_idx" ON "TagOnTests"("testId");

-- CreateIndex
CREATE INDEX "TagOnTests_tagId_idx" ON "TagOnTests"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "GroupSubcategoryOnTests_testId_idx" ON "GroupSubcategoryOnTests"("testId");

-- CreateIndex
CREATE INDEX "GroupSubcategoryOnTests_subcategoryId_idx" ON "GroupSubcategoryOnTests"("subcategoryId");

-- CreateIndex
CREATE INDEX "GroupOnUsers_userId_idx" ON "GroupOnUsers"("userId");

-- CreateIndex
CREATE INDEX "GroupOnUsers_groupId_idx" ON "GroupOnUsers"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_slug_key" ON "Group"("slug");

-- CreateIndex
CREATE INDEX "Group_ownerId_idx" ON "Group"("ownerId");

-- CreateIndex
CREATE INDEX "GroupInvite_groupId_idx" ON "GroupInvite"("groupId");

-- CreateIndex
CREATE INDEX "GroupSubcategory_name_idx" ON "GroupSubcategory"("name");

-- CreateIndex
CREATE INDEX "GroupSubcategory_groupId_idx" ON "GroupSubcategory"("groupId");

-- CreateIndex
CREATE INDEX "GroupSubcategoreyMessage_senderId_idx" ON "GroupSubcategoreyMessage"("senderId");

-- CreateIndex
CREATE INDEX "GroupSubcategoreyMessage_groupSubcategoryId_idx" ON "GroupSubcategoreyMessage"("groupSubcategoryId");

-- CreateIndex
CREATE INDEX "GroupSubcategoreyMessage_testId_idx" ON "GroupSubcategoreyMessage"("testId");

-- CreateIndex
CREATE INDEX "TestStar_testId_idx" ON "TestStar"("testId");

-- CreateIndex
CREATE INDEX "TestStar_userId_idx" ON "TestStar"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TestStar_testId_userId_key" ON "TestStar"("testId", "userId");

-- CreateIndex
CREATE INDEX "AdminLogs_userId_idx" ON "AdminLogs"("userId");
