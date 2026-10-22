-- AlterEnum
ALTER TYPE "RequestType" ADD VALUE 'DESIGN';

-- AlterTable
ALTER TABLE "SiteSetting" ADD COLUMN     "designAfterImage" TEXT,
ADD COLUMN     "designBeforeImage" TEXT,
ADD COLUMN     "designMaterialImage" TEXT;

-- CreateTable
CREATE TABLE "RequestAttachment" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RequestAttachment_storageKey_key" ON "RequestAttachment"("storageKey");

-- CreateIndex
CREATE INDEX "RequestAttachment_requestId_idx" ON "RequestAttachment"("requestId");

-- AddForeignKey
ALTER TABLE "RequestAttachment" ADD CONSTRAINT "RequestAttachment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ContactRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

