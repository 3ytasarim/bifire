"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { bool, fail, formObject, optional, optionalImage, optionalUrl, zodErrors, type ActionState } from "@/lib/admin/form";
import { revalidateSite } from "@/lib/admin/revalidate";
import { requireAdmin } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { invalidateRedirectCache, normalizePath } from "@/lib/redirects";
import { isStaticPageKey, pageDefaults, STATIC_PAGES } from "@/lib/seo/static-pages";

const pageSchema = z.object({
  title: optional(120),
  description: optional(320),
  keywords: optional(300),
  canonicalUrl: optionalUrl,
  ogTitle: optional(120),
  ogDescription: optional(320),
  ogImage: optionalImage,
  robotsIndex: bool,
  robotsFollow: bool,
});

export async function saveSeoPage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const key = String(formData.get("key") ?? "");
  if (!isStaticPageKey(key)) return fail("Geçersiz sayfa.");
  const parsed = pageSchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  // Varsayılanla aynı bırakılan alanlar saklanmaz (null): içerik dosyasındaki değer değişirse sayfa onu kullanır.
  const def = pageDefaults(key);
  const same = (v: string | null | undefined, d: string | undefined) => (v && d && v.trim() === d.trim() ? null : v);
  const data = {
    ...parsed.data,
    title: same(parsed.data.title, def.title),
    description: same(parsed.data.description, def.description),
    keywords: same(parsed.data.keywords, def.keywords),
  };
  await prisma.seoPage.upsert({
    where: { key },
    create: { key, label: STATIC_PAGES[key].label, ...data },
    update: data,
  });
  revalidateSite();
  redirect(`/admin/seo/${key}?kaydedildi=1`);
}

const internalPath = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v.startsWith("/") && !v.startsWith("//") && !/\s/.test(v), "“/” ile başlayan site içi bir yol girin (ör. /eski-sayfa).")
  .transform(normalizePath);

const redirectSchema = z
  .object({
    sourcePath: internalPath.refine((v) => !v.startsWith("/admin") && !v.startsWith("/_next") && !v.startsWith("/uploads") && v !== "/", "Bu yol yönlendirilemez."),
    destinationPath: z
      .string()
      .trim()
      .max(500)
      .refine((v) => (v.startsWith("/") && !v.startsWith("//")) || /^https:\/\//.test(v), "Site içi yol (/...) veya https:// adres girin."),
    statusCode: z.coerce.number().refine((v) => v === 301 || v === 302 || v === 308, "Geçersiz kod."),
    note: optional(200),
  })
  .refine((d) => d.sourcePath !== normalizePath(d.destinationPath), { path: ["destinationPath"], message: "Kaynak ve hedef aynı olamaz." });

export async function saveRedirect(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = redirectSchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;
  // Zincir/döngü önleme: hedef başka bir yönlendirmenin kaynağıysa uyar.
  const chained = await prisma.redirect.findFirst({ where: { sourcePath: normalizePath(d.destinationPath), active: true } });
  if (chained) return fail(`Hedef adres zaten ${chained.destinationPath} adresine yönleniyor. Zincir oluşmaması için doğrudan son hedefi girin.`, { destinationPath: "Yönlendirme zinciri." });
  await prisma.redirect.upsert({ where: { sourcePath: d.sourcePath }, create: { ...d, active: true }, update: { ...d, active: true } });
  invalidateRedirectCache();
  revalidatePath("/admin/seo/yonlendirmeler");
  return { status: "success", message: `${d.sourcePath} → ${d.destinationPath} kaydedildi.` };
}

export async function deleteRedirect(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  await prisma.redirect.delete({ where: { id } }).catch(() => null);
  invalidateRedirectCache();
  return { ok: true };
}

export async function toggleRedirect(id: string) {
  await requireAdmin();
  const r = await prisma.redirect.findUnique({ where: { id }, select: { active: true } });
  if (r) await prisma.redirect.update({ where: { id }, data: { active: !r.active } });
  invalidateRedirectCache();
}
