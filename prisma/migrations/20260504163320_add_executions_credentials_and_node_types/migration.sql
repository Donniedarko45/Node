-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('OPENAI', 'ANTHROPIC', 'GEMINI', 'DISCORD', 'SLACK');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Nodetype" ADD VALUE 'MANUAL_TRIGGER';
ALTER TYPE "Nodetype" ADD VALUE 'HTTP_REQUEST';
ALTER TYPE "Nodetype" ADD VALUE 'GOOGLE_FORM_TRIGGER';
ALTER TYPE "Nodetype" ADD VALUE 'STRIPE_TRIGGER';
ALTER TYPE "Nodetype" ADD VALUE 'OPENAI';
ALTER TYPE "Nodetype" ADD VALUE 'GEMINI';
ALTER TYPE "Nodetype" ADD VALUE 'ANTHROPIC';
ALTER TYPE "Nodetype" ADD VALUE 'DISCORD';
ALTER TYPE "Nodetype" ADD VALUE 'SLACK';

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "credentialId" TEXT;

-- CreateTable
CREATE TABLE "execution" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "inngestEventId" TEXT,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'RUNNING',
    "output" JSONB,
    "errorStack" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "execution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CredentialType" NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "execution_workflowId_idx" ON "execution"("workflowId");

-- CreateIndex
CREATE INDEX "credential_userId_idx" ON "credential"("userId");

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "credential"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution" ADD CONSTRAINT "execution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential" ADD CONSTRAINT "credential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
