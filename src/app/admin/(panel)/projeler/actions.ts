"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { bool, fail, formObject, ids, int, isUniqueViolation, jsonArray, optional, optionalImage, required, seoShape, slugField, zodErrors, type ActionState } from "@/lib/admin/form";
import { revalidateSite } from "@/lib/admin/revalidate";
import { requireAdmin } from "@/lib/auth/guard";
import { routes } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { recordSlugChange } from "@/lib/redirects";
import { sanitizeRichText } from "@/lib/sanitize";
import { getMediaDimensions } from "@/lib/upload";

const schema = z.object({
  title: required("Proje adı", 200),
  slug: slugField,
  location: optional(120),
  projectType: optional(120),
  shortDescription: optional(500),
  content: z.string().max(200_000),
  coverImage: optionalImage,
  coverImageAlt: optional(250),
  completedAt: z
    .string()
    .trim()
    .refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Geçerli bir tarih girin.")
    .transform((v) => (v ? new Date(`${v}T12:00:00Z`) : null)),
  featured: bool,
  active: bool,
  sortOrder: int(0, 9999),
  gallery: jsonArray(z.object({ url: z.string().trim().max(500).refine((v) => v.startsWith("/") && !v.startsWith("//")), alt: z.string().trim().max(250) })),
  ...seoShape,
});

export async function saveProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "") || null;
  const parsed = schema.safeParse({ gallery: "", content: "", completedAt: "", ...formObject(formData) });
  if (!parsed.success) return zodErrors(parsed.error);
  const { gallery, ...d } = parsed.data;
  const productIds = ids(formData, "productIds");
  const dims = await getMediaDimensions(gallery.map((g) => g.url));
  const data = { ...d, content: sanitizeRichText(d.content) || null };

  let savedId = id;
  let previousSlug: string | null = null;
  try {
    savedId = await prisma.$transaction(async (tx) => {
      let pid = id;
      if (id) {
        const before = await tx.project.findUnique({ where: { id }, select: { slug: true } });
        if (!before) throw new Error("NOT_FOUND");
        previousSlug = before.slug;
        await tx.project.update({ where: { id }, data: { ...data, products: { set: productIds.map((x) => ({ id: x })) } } });
        await tx.projectImage.deleteMany({ where: { projectId: id } });
      } else {
        pid = (await tx.project.create({ data: { ...data, products: { connect: productIds.map((x) => ({ id: x })) } } })).id;
      }
      await tx.projectImage.createMany({
        data: gallery.map((g, i) => ({ projectId: pid!, url: g.url, alt: g.alt || null, width: dims.get(g.url)?.width ?? null, height: dims.get(g.url)?.height ?? null, sortOrder: i })),
      });
      return pid!;
    });
  } catch (e) {
    if (isUniqueViolation(e)) return fail("Bu URL (slug) başka bir projede kullanılıyor.", { slug: "Bu slug kullanımda." });
    if (e instanceof Error && e.message === "NOT_FOUND") return fail("Proje bulunamadı.");
    throw e;
  }
  if (previousSlug && previousSlug !== d.slug) await recordSlugChange(routes.project(previousSlug), routes.project(d.slug));
  revalidateSite();
  redirect(`/admin/projeler/${savedId}?kaydedildi=1`);
}

export async function deleteProject(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin("ADMIN");
  await prisma.project.delete({ where: { id } }).catch(() => null);
  revalidateSite();
  return { ok: true };
}

export async function toggleProjectFlag(id: string, flag: "active" | "featured") {
  await requireAdmin();
  const p = await prisma.project.findUnique({ where: { id }, select: { active: true, featured: true } });
  if (p) await prisma.project.update({ where: { id }, data: { [flag]: !p[flag] } });
  revalidateSite();
}
