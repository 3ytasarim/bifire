"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { FuelType, ViewType } from "@prisma/client";
import {
  bool,
  fail,
  formObject,
  int,
  isUniqueViolation,
  jsonArray,
  optional,
  optionalImage,
  optionalInt,
  optionalNumber,
  parseTags,
  required,
  seoShape,
  slugField,
  zodErrors,
  type ActionState,
} from "@/lib/admin/form";
import { revalidateSite } from "@/lib/admin/revalidate";
import { requireAdmin } from "@/lib/auth/guard";
import { routes } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { recordSlugChange } from "@/lib/redirects";
import { sanitizeRichText } from "@/lib/sanitize";
import { getMediaDimensions } from "@/lib/upload";

const localPath = z.string().trim().max(500).refine((v) => v.startsWith("/") && !v.startsWith("//"), "Geçersiz dosya yolu.");

const schema = z.object({
  name: required("Ürün adı", 200),
  slug: slugField,
  categoryId: required("Kategori", 40),
  modelCode: optional(80),
  brand: optional(80),
  shortDescription: optional(500),
  description: z.string().max(200_000),
  coverImage: optionalImage,
  coverImageAlt: optional(250),
  fuelType: z
    .string()
    .transform((v) => (v === "" ? null : v))
    .pipe(z.enum(FuelType).nullable()),
  viewType: z
    .string()
    .transform((v) => (v === "" ? null : v))
    .pipe(z.enum(ViewType).nullable()),
  powerKw: optionalNumber(1000),
  heatingArea: optional(60),
  efficiency: optionalNumber(100),
  widthMm: optionalInt(20000),
  heightMm: optionalInt(20000),
  depthMm: optionalInt(20000),
  weightKg: optionalNumber(100000),
  flueDiameterMm: optionalInt(2000),
  dimensionsNote: optional(250),
  featured: bool,
  active: bool,
  sortOrder: int(0, 9999),
  tags: z.string().max(1000),
  gallery: jsonArray(z.object({ url: localPath, alt: z.string().trim().max(250) })),
  specs: jsonArray(z.object({ group: z.string().trim().max(80), label: z.string().trim().max(120), value: z.string().trim().max(160), unit: z.string().trim().max(30) })),
  features: jsonArray(
    z.object({
      label: z.string().trim().max(60).default(""),
      title: z.string().trim().max(120).default(""),
      text: z.string().trim().max(700),
      note: z.string().trim().max(160).default(""),
    }),
  ),
  options: jsonArray(z.object({ group: z.string().trim().max(60), value: z.string().trim().max(80) })),
  faqs: jsonArray(z.object({ question: z.string().trim().max(200), answer: z.string().trim().max(1200) })),
  documents: jsonArray(
    z.object({
      title: z.string().trim().min(1, "Doküman başlığı boş olamaz.").max(160),
      url: localPath.refine((v) => v.startsWith("/uploads/") && v.endsWith(".pdf"), "Geçersiz doküman."),
      mimeType: z.literal("application/pdf"),
      size: z.number().int().min(1),
    }),
  ),
  ...seoShape,
});

export async function saveProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "") || null;
  const parsed = schema.safeParse({ tags: "", gallery: "", specs: "", features: "", options: "", faqs: "", documents: "", description: "", ...formObject(formData) });
  if (!parsed.success) return zodErrors(parsed.error);
  const { gallery, specs, features, options, faqs, documents, tags, ...d } = parsed.data;

  if (!(await prisma.productCategory.findUnique({ where: { id: d.categoryId }, select: { id: true } }))) {
    return fail("Kategori bulunamadı.", { categoryId: "Geçerli bir kategori seçin." });
  }

  const dims = await getMediaDimensions(gallery.map((g) => g.url));
  const tagList = parseTags(tags);
  const data = { ...d, description: sanitizeRichText(d.description) || null };

  let savedId = id;
  let previousSlug: string | null = null;
  try {
    savedId = await prisma.$transaction(async (tx) => {
      let productId = id;
      if (id) {
        const before = await tx.product.findUnique({ where: { id }, select: { slug: true } });
        if (!before) throw new Error("NOT_FOUND");
        previousSlug = before.slug;
        await tx.product.update({ where: { id }, data: { ...data, tags: { set: [] } } });
        await Promise.all([
          tx.productImage.deleteMany({ where: { productId: id } }),
          tx.productSpecification.deleteMany({ where: { productId: id } }),
          tx.productFeature.deleteMany({ where: { productId: id } }),
          tx.productOption.deleteMany({ where: { productId: id } }),
          tx.productFaq.deleteMany({ where: { productId: id } }),
          tx.productDocument.deleteMany({ where: { productId: id } }),
        ]);
      } else {
        productId = (await tx.product.create({ data })).id;
      }
      const pid = productId!;
      await tx.product.update({
        where: { id: pid },
        data: { tags: { connectOrCreate: tagList.map((t) => ({ where: { slug: t.slug }, create: t })) } },
      });
      await tx.productImage.createMany({
        data: gallery.map((g, i) => ({ productId: pid, url: g.url, alt: g.alt || null, width: dims.get(g.url)?.width ?? null, height: dims.get(g.url)?.height ?? null, sortOrder: i })),
      });
      await tx.productSpecification.createMany({
        data: specs
          .filter((s) => s.label && s.value)
          .map((s, i) => ({ productId: pid, group: s.group || null, label: s.label, value: s.value, unit: s.unit || null, sortOrder: i })),
      });
      await tx.productFeature.createMany({
        data: features
          .filter((f) => f.text)
          .map((f, i) => ({ productId: pid, label: f.label || null, title: f.title || null, text: f.text, note: f.note || null, sortOrder: i })),
      });
      await tx.productOption.createMany({ data: options.filter((o) => o.group && o.value).map((o, i) => ({ productId: pid, group: o.group, value: o.value, sortOrder: i })) });
      await tx.productFaq.createMany({ data: faqs.filter((q) => q.question && q.answer).map((q, i) => ({ productId: pid, question: q.question, answer: q.answer, sortOrder: i })) });
      await tx.productDocument.createMany({ data: documents.map((doc, i) => ({ productId: pid, ...doc, sortOrder: i })) });
      return pid;
    });
  } catch (e) {
    if (isUniqueViolation(e)) return fail("Bu URL (slug) başka bir üründe kullanılıyor.", { slug: "Bu slug kullanımda." });
    if (e instanceof Error && e.message === "NOT_FOUND") return fail("Ürün bulunamadı.");
    throw e;
  }
  if (previousSlug && previousSlug !== d.slug) await recordSlugChange(routes.product(previousSlug), routes.product(d.slug));
  revalidateSite();
  redirect(`/admin/urunler/${savedId}?kaydedildi=1`);
}

export async function deleteProduct(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin("ADMIN");
  // Görseller/özellikler/dokümanlar kaskadla silinir; talepler (ContactRequest) korunur (productId → null, ürün adı talepte kalır).
  await prisma.product.delete({ where: { id } }).catch(() => null);
  revalidateSite();
  return { ok: true };
}

export async function toggleProductFlag(id: string, flag: "active" | "featured") {
  await requireAdmin();
  const p = await prisma.product.findUnique({ where: { id }, select: { active: true, featured: true } });
  if (p) await prisma.product.update({ where: { id }, data: { [flag]: !p[flag] } });
  revalidateSite();
}
