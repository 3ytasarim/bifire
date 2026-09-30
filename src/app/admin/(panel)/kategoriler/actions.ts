"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { fail, formObject, int, isUniqueViolation, optional, optionalImage, required, seoShape, slugField, bool, zodErrors, type ActionState } from "@/lib/admin/form";
import { revalidateSite } from "@/lib/admin/revalidate";
import { requireAdmin } from "@/lib/auth/guard";
import { routes } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { recordSlugChange } from "@/lib/redirects";
import { sanitizeRichText } from "@/lib/sanitize";

const schema = z.object({
  name: required("Kategori adı", 120),
  slug: slugField,
  parentId: optional(40),
  description: optional(600),
  content: z.string().max(100_000),
  image: optionalImage,
  imageAlt: optional(250),
  sortOrder: int(0, 9999),
  active: bool,
  ...seoShape,
});

export async function saveCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "") || null;
  const parsed = schema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;

  // Hiyerarşi en fazla 2 seviye: üst kategori kendisi olamaz ve kendisi bir alt kategori olamaz.
  if (d.parentId) {
    if (d.parentId === id) return fail("Bir kategori kendisinin üst kategorisi olamaz.", { parentId: "Geçersiz seçim." });
    const parent = await prisma.productCategory.findUnique({ where: { id: d.parentId }, select: { parentId: true } });
    if (!parent) return fail("Üst kategori bulunamadı.", { parentId: "Geçersiz seçim." });
    if (parent.parentId) return fail("Yalnızca ana kategoriler üst kategori olarak seçilebilir.", { parentId: "Alt kategori seçilemez." });
    if (id && (await prisma.productCategory.count({ where: { parentId: id } })) > 0) {
      return fail("Alt kategorileri olan bir kategori başka bir kategorinin altına taşınamaz.", { parentId: "Önce alt kategorileri taşıyın." });
    }
  }

  const data = { ...d, content: sanitizeRichText(d.content) || null };
  let savedId = id;
  try {
    if (id) {
      const before = await prisma.productCategory.findUnique({ where: { id }, select: { slug: true } });
      if (!before) return fail("Kategori bulunamadı.");
      await prisma.productCategory.update({ where: { id }, data });
      if (before.slug !== d.slug) await recordSlugChange(routes.category(before.slug), routes.category(d.slug));
    } else {
      savedId = (await prisma.productCategory.create({ data })).id;
    }
  } catch (e) {
    if (isUniqueViolation(e)) return fail("Bu URL (slug) başka bir kategoride kullanılıyor.", { slug: "Bu slug kullanımda." });
    throw e;
  }
  revalidateSite();
  redirect(`/admin/kategoriler/${savedId}?kaydedildi=1`);
}

export async function deleteCategory(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin("ADMIN");
  const [products, children] = await Promise.all([prisma.product.count({ where: { categoryId: id } }), prisma.productCategory.count({ where: { parentId: id } })]);
  if (products) return { ok: false, error: `Bu kategoride ${products} ürün var. Ürünler yanlışlıkla kaybolmasın diye önce ürünleri başka kategoriye taşıyın veya silin.` };
  if (children) return { ok: false, error: `Bu kategorinin ${children} alt kategorisi var. Önce onları taşıyın veya silin.` };
  await prisma.productCategory.delete({ where: { id } });
  revalidateSite();
  return { ok: true };
}

export async function toggleCategoryActive(id: string) {
  await requireAdmin();
  const c = await prisma.productCategory.findUnique({ where: { id }, select: { active: true } });
  if (c) await prisma.productCategory.update({ where: { id }, data: { active: !c.active } });
  revalidateSite();
}
