"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { TextPosition } from "@prisma/client";
import { bool, fail, formObject, int, optional, optionalImage, optionalUrl, required, zodErrors, type ActionState } from "@/lib/admin/form";
import { revalidateSite } from "@/lib/admin/revalidate";
import { requireAdmin } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";

/** Yalnızca kendi depomuza yüklenmiş MP4/WebM videolar. */
const videoPath = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || (v.startsWith("/uploads/") && !v.includes("..") && /\.(mp4|m4v|webm)$/i.test(v)), "Geçersiz video.")
  .transform((v) => (v === "" ? null : v));

const schema = z
  .object({
    desktopImage: optionalImage,
    mobileImage: optionalImage,
    desktopVideo: videoPath,
    mobileVideo: videoPath,
    imageAlt: optional(250),
    eyebrow: optional(80),
    title: required("Başlık", 160),
    description: optional(400),
    ctaText: optional(40),
    ctaUrl: optionalUrl,
    secondaryCtaText: optional(40),
    secondaryCtaUrl: optionalUrl,
    textPosition: z.enum(TextPosition),
    overlay: int(0, 90),
    focalX: int(0, 100),
    sortOrder: int(0, 9999),
    active: bool,
  })
  .refine((d) => d.desktopImage || d.desktopVideo, { path: ["desktopImage"], message: "Masaüstü görseli veya masaüstü videosundan en az biri gerekli." })
  .refine((d) => !d.ctaText || d.ctaUrl, { path: ["ctaUrl"], message: "Buton metni varsa bağlantı da girin." })
  .refine((d) => !d.secondaryCtaText || d.secondaryCtaUrl, { path: ["secondaryCtaUrl"], message: "Buton metni varsa bağlantı da girin." });

export async function saveSlide(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "") || null;
  const parsed = schema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  let savedId = id;
  if (id) {
    const exists = await prisma.heroSlide.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return fail("Slayt bulunamadı.");
    await prisma.heroSlide.update({ where: { id }, data: parsed.data });
  } else {
    savedId = (await prisma.heroSlide.create({ data: parsed.data })).id;
  }
  revalidateSite();
  redirect(`/admin/slider/${savedId}?kaydedildi=1`);
}

export async function deleteSlide(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  await prisma.heroSlide.delete({ where: { id } }).catch(() => null);
  revalidateSite();
  return { ok: true };
}

export async function toggleSlide(id: string) {
  await requireAdmin();
  const s = await prisma.heroSlide.findUnique({ where: { id }, select: { active: true } });
  if (s) await prisma.heroSlide.update({ where: { id }, data: { active: !s.active } });
  revalidateSite();
}

/** Listede yukarı/aşağı taşıma: sıralamayı 10'ar aralıkla yeniden numaralandırır. */
export async function moveSlide(id: string, dir: -1 | 1) {
  await requireAdmin();
  const slides = await prisma.heroSlide.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true } });
  const i = slides.findIndex((s) => s.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= slides.length) return;
  [slides[i], slides[j]] = [slides[j]!, slides[i]!];
  await prisma.$transaction(slides.map((s, n) => prisma.heroSlide.update({ where: { id: s.id }, data: { sortOrder: (n + 1) * 10 } })));
  revalidateSite();
}
