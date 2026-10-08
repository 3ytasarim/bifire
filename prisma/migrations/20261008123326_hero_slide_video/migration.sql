-- AlterTable
ALTER TABLE "HeroSlide" ADD COLUMN     "desktopVideo" TEXT,
ADD COLUMN     "mobileVideo" TEXT,
ALTER COLUMN "desktopImage" DROP NOT NULL;
