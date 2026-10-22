-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "category" TEXT;

-- CreateIndex
CREATE INDEX "BlogPost_category_idx" ON "BlogPost"("category");

