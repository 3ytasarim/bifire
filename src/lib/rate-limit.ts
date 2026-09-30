import "server-only";
import { prisma } from "@/lib/db";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;

/** Son 15 dk içinde bu anahtar (e-posta veya IP özeti) için başarısız deneme sınırı aşıldı mı? */
export async function isLoginBlocked(keys: string[]): Promise<boolean> {
  const since = new Date(Date.now() - LOGIN_WINDOW_MS);
  const counts = await Promise.all(
    keys.map((key) => prisma.loginAttempt.count({ where: { key, createdAt: { gte: since } } })),
  );
  return counts.some((c) => c >= LOGIN_MAX_ATTEMPTS);
}

export async function recordFailedLogin(keys: string[]) {
  await prisma.loginAttempt.createMany({ data: keys.map((key) => ({ key })) });
  // Tablo büyümesin: 1 günden eski kayıtları sil.
  await prisma.loginAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 86_400_000) } } });
}

export async function clearLoginAttempts(keys: string[]) {
  await prisma.loginAttempt.deleteMany({ where: { key: { in: keys } } });
}

const FORM_WINDOW_MS = 60 * 60 * 1000;
const FORM_MAX_PER_WINDOW = 5;

/** Aynı IP'den saatte en fazla 5 talep. */
export async function isFormRateLimited(ipHash: string): Promise<boolean> {
  const count = await prisma.contactRequest.count({
    where: { ipHash, createdAt: { gte: new Date(Date.now() - FORM_WINDOW_MS) } },
  });
  return count >= FORM_MAX_PER_WINDOW;
}
