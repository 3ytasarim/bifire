import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import type { AdminRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE } from "./cookie";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type SessionUser = { id: string; name: string; email: string; role: AdminRole };

export async function createSession(adminUserId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({ data: { adminUserId, tokenHash: hashToken(token), expiresAt } });
  // Süresi dolmuş oturumları fırsat buldukça temizle.
  await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** İstek başına bir kez çalışır (React cache) — layout ve sayfa aynı isteği iki kez sorgulamaz. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { adminUser: true },
  });
  if (!session || session.expiresAt < new Date() || !session.adminUser.active) return null;

  const { id, name, email, role } = session.adminUser;
  return { id, name, email, role };
});

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  cookieStore.delete(SESSION_COOKIE);
}

export async function destroyOtherSessions(adminUserId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  await prisma.session.deleteMany({
    where: { adminUserId, ...(token ? { NOT: { tokenHash: hashToken(token) } } : {}) },
  });
}
