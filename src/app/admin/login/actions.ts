"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { randomBytes } from "node:crypto";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { clearLoginAttempts, isLoginBlocked, recordFailedLogin } from "@/lib/rate-limit";
import { getIpHash } from "@/lib/request-meta";

export type LoginState = { error?: string; email?: string };

const schema = z.object({
  email: z.email("Geçerli bir e-posta girin.").max(160),
  password: z.string().min(1, "Şifre girin.").max(200),
});

// Kullanıcı yoksa da gerçek bir argon2 doğrulaması yapılır → yanıt süresi kullanıcı varlığını sızdırmaz.
let dummyHash: Promise<string> | null = null;
const getDummyHash = () => (dummyHash ??= hashPassword(randomBytes(16).toString("hex")));

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({ email: String(formData.get("email") ?? "").trim().toLowerCase(), password: String(formData.get("password") ?? "") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin.", email: String(formData.get("email") ?? "") };

  const { email, password } = parsed.data;
  const ipHash = await getIpHash();
  const keys = [`email:${email}`, `ip:${ipHash}`];

  if (await isLoginBlocked(keys)) {
    return { error: "Çok fazla hatalı deneme. Lütfen 15 dakika sonra tekrar deneyin.", email };
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  const valid = await verifyPassword(user?.passwordHash ?? (await getDummyHash()), password);
  if (!user || !valid || !user.active) {
    await recordFailedLogin(keys);
    return { error: "E-posta veya şifre hatalı.", email };
  }

  await clearLoginAttempts(keys);
  await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession(user.id);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}
