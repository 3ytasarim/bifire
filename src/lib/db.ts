import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  // pg bugün sslmode=require'ı zaten verify-full gibi uyguluyor; açıkça yazarak aynı (sertifika doğrulamalı)
  // davranış korunur ve pg'nin gelecek sürümündeki anlam değişikliğinden etkilenilmez.
  const connectionString = process.env.DATABASE_URL?.replace(/sslmode=require\b/, "sslmode=verify-full");
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
