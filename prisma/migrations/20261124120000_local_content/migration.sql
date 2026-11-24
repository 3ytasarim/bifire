-- CreateTable
CREATE TABLE "LocalContent" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "intro" TEXT,
    "note" TEXT,
    "image" TEXT,
    "imageAlt" TEXT,
    "image2" TEXT,
    "image2Alt" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LocalContent_key_key" ON "LocalContent"("key");
