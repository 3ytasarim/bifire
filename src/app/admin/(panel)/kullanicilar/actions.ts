"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { AdminRole } from "@prisma/client";
import { bool, fail, formObject, isUniqueViolation, zodErrors, type ActionState } from "@/lib/admin/form";
import { hasRole, requireAdmin } from "@/lib/auth/guard";
import { hashPassword, PASSWORD_MIN_LENGTH, verifyPassword } from "@/lib/auth/password";
import { destroyOtherSessions } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const password = z.string().min(PASSWORD_MIN_LENGTH, `Şifre en az ${PASSWORD_MIN_LENGTH} karakter olmalı.`).max(200);

const schema = z.object({
  name: z.string().trim().min(2, "Ad zorunlu.").max(120),
  email: z.email("Geçerli bir e-posta girin.").max(160).transform((v) => v.toLowerCase()),
  role: z.enum(AdminRole),
  active: bool,
  password: z.string().max(200),
});

export async function saveUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const me = await requireAdmin("ADMIN");
  const id = String(formData.get("id") ?? "") || null;
  const parsed = schema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;

  // Yetki yükseltme koruması: yalnızca SUPERADMIN, SUPERADMIN atayabilir/düzenleyebilir.
  if (d.role === "SUPERADMIN" && !hasRole(me, "SUPERADMIN")) return fail("Süper yönetici rolünü yalnızca süper yönetici atayabilir.", { role: "Yetkiniz yok." });
  if (id === me.id && (!d.active || d.role !== me.role)) return fail("Kendi rolünüzü veya durumunuzu buradan değiştiremezsiniz.");

  if (!id || d.password) {
    const pw = password.safeParse(d.password);
    if (!pw.success) return fail("Şifreyi kontrol edin.", { password: pw.error.issues[0]!.message });
  }

  try {
    if (id) {
      const target = await prisma.adminUser.findUnique({ where: { id }, select: { role: true } });
      if (!target) return fail("Kullanıcı bulunamadı.");
      if (target.role === "SUPERADMIN" && !hasRole(me, "SUPERADMIN")) return fail("Süper yöneticiyi yalnızca süper yönetici düzenleyebilir.");
      await prisma.adminUser.update({
        where: { id },
        data: { name: d.name, email: d.email, role: d.role, active: d.active, ...(d.password ? { passwordHash: await hashPassword(d.password) } : {}) },
      });
      // Şifre değiştiyse veya hesap pasifleştiyse o kullanıcının açık oturumları kapatılır.
      if (d.password || !d.active) await prisma.session.deleteMany({ where: { adminUserId: id } });
    } else {
      await prisma.adminUser.create({ data: { name: d.name, email: d.email, role: d.role, active: d.active, passwordHash: await hashPassword(d.password) } });
    }
  } catch (e) {
    if (isUniqueViolation(e)) return fail("Bu e-posta ile kayıtlı bir kullanıcı var.", { email: "E-posta kullanımda." });
    throw e;
  }
  redirect("/admin/kullanicilar?kaydedildi=1");
}

export async function deleteUser(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await requireAdmin("ADMIN");
  if (id === me.id) return { ok: false, error: "Kendi hesabınızı silemezsiniz." };
  const target = await prisma.adminUser.findUnique({ where: { id }, select: { role: true } });
  if (!target) return { ok: true };
  if (target.role === "SUPERADMIN" && !hasRole(me, "SUPERADMIN")) return { ok: false, error: "Süper yöneticiyi yalnızca süper yönetici silebilir." };
  await prisma.adminUser.delete({ where: { id } });
  return { ok: true };
}

const profileSchema = z
  .object({
    name: z.string().trim().min(2, "Ad zorunlu.").max(120),
    currentPassword: z.string().max(200),
    newPassword: z.string().max(200),
    confirmPassword: z.string().max(200),
  })
  .refine((d) => !d.newPassword || d.newPassword === d.confirmPassword, { path: ["confirmPassword"], message: "Şifreler eşleşmiyor." });

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const parsed = profileSchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;
  const data: { name: string; passwordHash?: string } = { name: d.name };
  if (d.newPassword) {
    const pw = password.safeParse(d.newPassword);
    if (!pw.success) return fail("Şifreyi kontrol edin.", { newPassword: pw.error.issues[0]!.message });
    const user = await prisma.adminUser.findUnique({ where: { id: me.id }, select: { passwordHash: true } });
    if (!user || !(await verifyPassword(user.passwordHash, d.currentPassword))) return fail("Mevcut şifre hatalı.", { currentPassword: "Hatalı şifre." });
    data.passwordHash = await hashPassword(d.newPassword);
  }
  await prisma.adminUser.update({ where: { id: me.id }, data });
  if (data.passwordHash) await destroyOtherSessions(me.id);
  return { status: "success", message: data.passwordHash ? "Profil ve şifre güncellendi. Diğer cihazlardaki oturumlar kapatıldı." : "Profil güncellendi." };
}
