import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModelView } from "@/components/collection/ModelView";
import { familyOf, modelName } from "@/lib/collection";
import { routes } from "@/lib/catalog";
import { buildModels, keyValues, formatSpec, modelPath } from "@/lib/models";
import { getCollectionSiblings, getFormOptions, getProductBySlug } from "@/lib/queries";
import { buildEntityMetadata } from "@/lib/seo/metadata";
import type { Crumb } from "@/lib/seo/json-ld";
import { getSiteSettings } from "@/lib/settings";

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string; model: string }> };

async function load(slug: string, modelSlug: string) {
  const product = await getProductBySlug(slug);
  if (!product) return null;
  const models = buildModels(product);
  const model = models.find((m) => m.slug === modelSlug);
  return model ? { product, models, model } : null;
}

/**
 * Model sayfaları birbirine çok benzer (aynı aile metni, yalnız değerler farklı). Ölçekli/ince içerik riskine
 * karşı `noindex, follow`: arama motorları tüm modelleri ve değerlerini aile sayfasındaki listeden okur,
 * bağlantıları takip eder; model sayfaları site haritasına da eklenmez.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, model: m } = await params;
  const data = await load(slug, m);
  if (!data) return {};
  const { product, model } = data;
  const name = modelName(familyOf(product), product.name, model.size);
  const values = keyValues(model, 3).map((r) => `${r.label} ${formatSpec(r.value, r.unit)}`).join(", ");
  return buildEntityMetadata({
    name: `${name} ${model.code}`,
    path: modelPath(product.slug, model.slug),
    seo: { metaTitle: null, metaDescription: null, metaKeywords: null, canonicalUrl: null, ogImage: null, noIndex: true },
    fallbackDescription: [`${name} (${model.code})${model.series ? `, ${model.series}` : ""}${values ? `: ${values}.` : "."} Teknik özellikler, ölçü çizimi ve üretim detayları; Bifire kendi üretim ve montaj.`],
    image: product.coverImage,
    imageAlt: product.coverImageAlt || product.name,
  });
}

export default async function ModelPage({ params }: Props) {
  const { slug, model: m } = await params;
  const data = await load(slug, m);
  if (!data) notFound();
  const { product, models, model } = data;
  const [[categories, products], settings, siblings] = await Promise.all([getFormOptions(), getSiteSettings(), getCollectionSiblings(product)]);
  const category = product.category;
  const parent = category.parent?.active ? category.parent : null;
  const crumbs: Crumb[] = [
    { name: "Ana Sayfa", path: "/" },
    { name: "Ürünler", path: routes.products },
    ...(parent ? [{ name: parent.name, path: routes.category(parent.slug) }] : []),
    { name: category.name, path: routes.category(category.slug) },
    { name: product.name, path: routes.product(product.slug) },
    { name: [model.series, model.size].filter(Boolean).join(" · "), path: modelPath(product.slug, model.slug) },
  ];
  return <ModelView product={product} models={models} model={model} crumbs={crumbs} settings={settings} form={{ categories, products }} siblings={siblings} />;
}
