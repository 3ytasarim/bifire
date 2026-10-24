-- CreateEnum
CREATE TYPE "CrmStage" AS ENUM ('NEW', 'SHOWROOM', 'QUOTE', 'ORDER', 'DONE', 'LOST');

-- CreateEnum
CREATE TYPE "CrmSource" AS ENUM ('WEB_QUOTE', 'WEB_SHOWROOM', 'WEB_DESIGN', 'WEB_CONTACT', 'PHONE', 'SHOWROOM_VISIT', 'REFERRAL', 'INSTAGRAM', 'FACEBOOK', 'WHATSAPP', 'META_LEAD', 'OTHER');

-- CreateEnum
CREATE TYPE "CrmActivityType" AS ENUM ('NOTE', 'CALL', 'VISIT', 'MESSAGE', 'STAGE', 'SYSTEM');

-- AlterTable
ALTER TABLE "ContactRequest" ADD COLUMN     "crmCustomerId" TEXT,
ADD COLUMN     "crmProjectId" TEXT;

-- CreateTable
CREATE TABLE "CrmCustomer" (
    "id" TEXT NOT NULL,
    "code" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "phoneKey" TEXT,
    "email" TEXT,
    "emailKey" TEXT,
    "city" TEXT,
    "district" TEXT,
    "source" "CrmSource" NOT NULL DEFAULT 'OTHER',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmProject" (
    "id" TEXT NOT NULL,
    "code" SERIAL NOT NULL,
    "customerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "stage" "CrmStage" NOT NULL DEFAULT 'NEW',
    "stageChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT,
    "nextFollowUpAt" TIMESTAMP(3),
    "quoteAmount" DECIMAL(12,2),
    "usage" TEXT,
    "chimney" TEXT,
    "notes" TEXT,
    "lostReason" TEXT,
    "source" "CrmSource" NOT NULL DEFAULT 'OTHER',
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmActivity" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "CrmActivityType" NOT NULL DEFAULT 'NOTE',
    "body" TEXT NOT NULL,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmTask" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "assigneeId" TEXT,
    "doneAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmMessageTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmMessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CrmCustomer_code_key" ON "CrmCustomer"("code");

-- CreateIndex
CREATE INDEX "CrmCustomer_phoneKey_idx" ON "CrmCustomer"("phoneKey");

-- CreateIndex
CREATE INDEX "CrmCustomer_emailKey_idx" ON "CrmCustomer"("emailKey");

-- CreateIndex
CREATE INDEX "CrmCustomer_name_idx" ON "CrmCustomer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CrmProject_code_key" ON "CrmProject"("code");

-- CreateIndex
CREATE INDEX "CrmProject_stage_idx" ON "CrmProject"("stage");

-- CreateIndex
CREATE INDEX "CrmProject_ownerId_idx" ON "CrmProject"("ownerId");

-- CreateIndex
CREATE INDEX "CrmProject_nextFollowUpAt_idx" ON "CrmProject"("nextFollowUpAt");

-- CreateIndex
CREATE INDEX "CrmProject_customerId_idx" ON "CrmProject"("customerId");

-- CreateIndex
CREATE INDEX "CrmActivity_projectId_createdAt_idx" ON "CrmActivity"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "CrmTask_doneAt_dueAt_idx" ON "CrmTask"("doneAt", "dueAt");

-- CreateIndex
CREATE INDEX "CrmTask_assigneeId_idx" ON "CrmTask"("assigneeId");

-- CreateIndex
CREATE INDEX "CrmTask_projectId_idx" ON "CrmTask"("projectId");

-- CreateIndex
CREATE INDEX "ContactRequest_crmProjectId_idx" ON "ContactRequest"("crmProjectId");

-- AddForeignKey
ALTER TABLE "ContactRequest" ADD CONSTRAINT "ContactRequest_crmCustomerId_fkey" FOREIGN KEY ("crmCustomerId") REFERENCES "CrmCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactRequest" ADD CONSTRAINT "ContactRequest_crmProjectId_fkey" FOREIGN KEY ("crmProjectId") REFERENCES "CrmProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmProject" ADD CONSTRAINT "CrmProject_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CrmCustomer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmProject" ADD CONSTRAINT "CrmProject_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmProject" ADD CONSTRAINT "CrmProject_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CrmProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmTask" ADD CONSTRAINT "CrmTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CrmProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmTask" ADD CONSTRAINT "CrmTask_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmTask" ADD CONSTRAINT "CrmTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

