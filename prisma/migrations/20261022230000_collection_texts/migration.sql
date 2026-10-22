-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "collectionDesc" TEXT,
ADD COLUMN     "collectionLine" TEXT,
ADD COLUMN     "collectionTag" TEXT,
ADD COLUMN     "detailIntro" TEXT,
ADD COLUMN     "detailNote" TEXT,
ADD COLUMN     "familyTitle" TEXT,
ADD COLUMN     "focusText" TEXT,
ADD COLUMN     "placeText" TEXT,
ADD COLUMN     "specNote" TEXT,
ADD COLUMN     "viewText" TEXT;

-- AlterTable
ALTER TABLE "ProductCategory" ADD COLUMN     "approachText" TEXT,
ADD COLUMN     "approachTitle" TEXT,
ADD COLUMN     "heroTitle" TEXT,
ADD COLUMN     "pickText" TEXT,
ADD COLUMN     "pickTitle" TEXT;

