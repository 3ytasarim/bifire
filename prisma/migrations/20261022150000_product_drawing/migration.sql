-- CreateTable
CREATE TABLE "ProductDrawing" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "variant" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductDrawing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductDrawing_productId_sortOrder_idx" ON "ProductDrawing"("productId", "sortOrder");

-- AddForeignKey
ALTER TABLE "ProductDrawing" ADD CONSTRAINT "ProductDrawing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
