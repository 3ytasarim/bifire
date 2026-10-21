-- AlterEnum
ALTER TYPE "RequestType" ADD VALUE 'SHOWROOM';

-- AlterTable
ALTER TABLE "ContactRequest" ADD COLUMN     "district" TEXT,
ADD COLUMN     "projectStage" TEXT,
ADD COLUMN     "selection" TEXT,
ADD COLUMN     "timeline" TEXT,
ADD COLUMN     "topic" TEXT;

-- AlterTable
ALTER TABLE "ProductFeature" ADD COLUMN     "label" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "title" TEXT;

-- CreateTable
CREATE TABLE "ProductOption" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductFaq" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductFaq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductOption_productId_sortOrder_idx" ON "ProductOption"("productId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductFaq_productId_sortOrder_idx" ON "ProductFaq"("productId", "sortOrder");

-- AddForeignKey
ALTER TABLE "ProductOption" ADD CONSTRAINT "ProductOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFaq" ADD CONSTRAINT "ProductFaq_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
