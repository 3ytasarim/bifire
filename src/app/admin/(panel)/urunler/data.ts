import "server-only";
import { routes } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import type { ProductFormData } from "./ProductForm";

export function getCategoryOptions() {
  return prisma.productCategory
    .findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, parent: { select: { name: true } } } })
    .then((rows) => rows.map((r) => ({ id: r.id, name: r.name, parentName: r.parent?.name ?? null })));
}

/** Ürünü istemci formuna uygun hale getirir (Decimal → string; ilişkiler → düz diziler). */
export async function getProductForm(id: string): Promise<(ProductFormData & { updatedAt: Date }) | null> {
  const p = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      drawings: { orderBy: { sortOrder: "asc" } },
      specifications: { orderBy: { sortOrder: "asc" } },
      features: { orderBy: { sortOrder: "asc" } },
      options: { orderBy: { sortOrder: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
      documents: { orderBy: { sortOrder: "asc" } },
      tags: { select: { name: true } },
      category: { select: { slug: true, parent: { select: { slug: true } } } },
    },
  });
  if (!p) return null;
  const dec = (v: { toString(): string } | null) => (v === null ? "" : v.toString());
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryId: p.categoryId,
    path: routes.product(p.slug, p.category.slug, p.category.parent?.slug),
    modelCode: p.modelCode,
    brand: p.brand,
    shortDescription: p.shortDescription,
    description: p.description,
    coverImage: p.coverImage,
    coverImageAlt: p.coverImageAlt,
    imageNote: p.imageNote,
    conceptImage: p.conceptImage,
    conceptImageAlt: p.conceptImageAlt,
    fuelType: p.fuelType,
    viewType: p.viewType,
    powerKw: dec(p.powerKw),
    heatingArea: p.heatingArea,
    efficiency: dec(p.efficiency),
    widthMm: p.widthMm,
    heightMm: p.heightMm,
    depthMm: p.depthMm,
    weightKg: dec(p.weightKg),
    flueDiameterMm: p.flueDiameterMm,
    dimensionsNote: p.dimensionsNote,
    familyTitle: p.familyTitle,
    collectionTag: p.collectionTag,
    collectionLine: p.collectionLine,
    collectionDesc: p.collectionDesc,
    viewText: p.viewText,
    placeText: p.placeText,
    focusText: p.focusText,
    detailIntro: p.detailIntro,
    specNote: p.specNote,
    detailNote: p.detailNote,
    featured: p.featured,
    active: p.active,
    sortOrder: p.sortOrder,
    tags: p.tags.map((t) => t.name).join(", "),
    gallery: p.images.map((i) => ({ url: i.url, alt: i.alt ?? "" })),
    drawings: p.drawings.map((i) => ({ url: i.url, alt: i.alt ?? "", variant: i.variant ?? "" })),
    specs: p.specifications.map((s) => ({ group: s.group ?? "", label: s.label, value: s.value, unit: s.unit ?? "", variant: s.variant ?? "" })),
    features: p.features.map((f) => ({ label: f.label ?? "", title: f.title ?? "", text: f.text, note: f.note ?? "" })),
    options: p.options.map((o) => ({ group: o.group, value: o.value })),
    faqs: p.faqs.map((q) => ({ question: q.question, answer: q.answer })),
    documents: p.documents.map((d) => ({ title: d.title, url: d.url, mimeType: d.mimeType, size: d.size })),
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    metaKeywords: p.metaKeywords,
    canonicalUrl: p.canonicalUrl,
    ogImage: p.ogImage,
    noIndex: p.noIndex,
    updatedAt: p.updatedAt,
  };
}
