-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "guideNo" INTEGER,
ADD COLUMN     "nextStep" TEXT,
ADD COLUMN     "relatedNos" TEXT,
ADD COLUMN     "subtopic" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_guideNo_key" ON "BlogPost"("guideNo");

