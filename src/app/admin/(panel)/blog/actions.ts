"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { bool, fail, formObject, ids, isUniqueViolation, optional, optionalImage, parseTags, required, seoShape, slugField, zodErrors, type ActionState } from "@/lib/admin/form";
import { revalidateSite } from "@/lib/admin/revalidate";
import { requireAdmin } from "@/lib/auth/guard";
import { routes } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { recordSlugChange } from "@/lib/redirects";
import { sanitizeRichText } from "@/lib/sanitize";
import { GUIDE_CATEGORIES, NEXT_STEPS } from "@/content/guide";

const schema = z.object({
  title: required("Başlık", 200),
  slug: slugField,
  excerpt: optional(500),
  content: z.string().max(300_000),
  coverImage: optionalImage,
  coverImageAlt: optional(250),
  author: optional(120),
  published: bool,
  featured: bool,
  // datetime-local değeri Türkiye saatiyle girilir (UTC+3, yaz saati uygulaması yok).
  publishedAt: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v), "Geçerli bir tarih/saat girin.")
    .transform((v) => (v ? new Date(`${v}:00+03:00`) : null)),
  tags: z.string().max(1000),
  // Yalnızca tanımlı rehber kategorileri kabul edilir; boş/yabancı değer → kategorisiz.
  category: z
    .string()
    .trim()
    .transform((v) => (GUIDE_CATEGORIES.some((c) => c.slug === v) ? v : null)),
  subtopic: optional(80),
  guideNo: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^d+$/.test(v) && Number(v) >= 1 && Number(v) <= 9999), "Geçerli bir numara girin.")
    .transform((v) => (v ? Number(v) : null)),
  relatedNos: z
    .string()
    .trim()
    .max(60)
    .refine((v) => v === "" || /^d+(s*,s*d+)*$/.test(v), "Numaraları virgülle ayırın (ör. 009, 056).")
    .transform((v) => v || null),
  nextStep: z
    .string()
    .trim()
    .transform((v) => (v in NEXT_STEPS ? v : null)),
  ...seoShape,
});

export async function savePost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "") || null;
  const parsed = schema.safeParse({ content: "", tags: "", publishedAt: "", category: "", subtopic: "", guideNo: "", relatedNos: "", nextStep: "", ...formObject(formData) });
  if (!parsed.success) return zodErrors(parsed.error);
  const { tags, ...d } = parsed.data;
  const content = sanitizeRichText(d.content);
  if (d.published && !content) return fail("Yayınlanacak yazının içeriği boş olamaz.", { content: "İçerik yazın veya taslak olarak kaydedin." });

  if (d.guideNo) {
    const clash = await prisma.blogPost.findFirst({ where: { guideNo: d.guideNo, ...(id ? { id: { not: id } } : {}) }, select: { title: true } });
    if (clash) return fail(`Bu makale numarası başka bir yazıda kullanılıyor: ${clash.title}`, { guideNo: "Numara kullanımda." });
  }

  const tagList = parseTags(tags);
  const productIds = ids(formData, "productIds");
  // Yayınlanıyorsa ve tarih girilmediyse şimdiki zaman; taslakta tarih korunur.
  const publishedAt = d.published ? (d.publishedAt ?? new Date()) : d.publishedAt;
  const data = { ...d, content: content || null, publishedAt, author: d.author ?? user.name };

  let savedId = id;
  let previousSlug: string | null = null;
  try {
    if (id) {
      const before = await prisma.blogPost.findUnique({ where: { id }, select: { slug: true, published: true } });
      if (!before) return fail("Yazı bulunamadı.");
      previousSlug = before.published ? before.slug : null; // taslak hiç yayınlanmadıysa yönlendirmeye gerek yok
      await prisma.blogPost.update({
        where: { id },
        data: {
          ...data,
          tags: { set: [], connectOrCreate: tagList.map((t) => ({ where: { slug: t.slug }, create: t })) },
          products: { set: productIds.map((x) => ({ id: x })) },
        },
      });
    } else {
      savedId = (
        await prisma.blogPost.create({
          data: {
            ...data,
            tags: { connectOrCreate: tagList.map((t) => ({ where: { slug: t.slug }, create: t })) },
            products: { connect: productIds.map((x) => ({ id: x })) },
          },
        })
      ).id;
    }
  } catch (e) {
    if (isUniqueViolation(e)) return fail("Bu URL (slug) başka bir yazıda kullanılıyor.", { slug: "Bu slug kullanımda." });
    throw e;
  }
  if (previousSlug && previousSlug !== d.slug) await recordSlugChange(routes.post(previousSlug), routes.post(d.slug));
  revalidateSite();
  redirect(`/admin/blog/${savedId}?kaydedildi=1`);
}

export async function deletePost(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin("ADMIN");
  await prisma.blogPost.delete({ where: { id } }).catch(() => null);
  revalidateSite();
  return { ok: true };
}

export async function togglePostFlag(id: string, flag: "published" | "featured") {
  await requireAdmin();
  const p = await prisma.blogPost.findUnique({ where: { id }, select: { published: true, featured: true, publishedAt: true, content: true } });
  if (!p) return;
  if (flag === "published" && !p.published && !p.content) return; // boş içerik yayınlanmaz
  await prisma.blogPost.update({
    where: { id },
    data: flag === "published" ? { published: !p.published, publishedAt: !p.published ? (p.publishedAt ?? new Date()) : p.publishedAt } : { featured: !p.featured },
  });
  revalidateSite();
}

export async function deleteBlogTag(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin("ADMIN");
  await prisma.blogTag.delete({ where: { id } }).catch(() => null);
  revalidateSite();
  return { ok: true };
}
