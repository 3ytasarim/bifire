import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModelView } from "@/components/collection/ModelView";
import { familyOf, modelName } from "@/lib/collection";
import { routes } from "@/lib/catalog";
import { buildModels, keyValues, formatSpec, modelPath } from "@/lib/models";
import { getCollectionSiblings, getFormOptions, getProductBySlug } from "@/lib/queries";
import { buildEntityMetadata, buildMetadata } from "@/lib/seo/metadata";
import { modelPageOf } from "@/content/model-pages";
import { getLocalContent, localKey } from "@/lib/local-content";
import { htmlToText } from "@/lib/sanitize";
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
 * Kendi içeriği olan modeller (content/model-pages.ts) kendi başlığı, açıklaması ve görseliyle indekslenir ve
 * site haritasına girer (self canonical).
 * Diğer model sayfaları aile metni + modelin kendi teknik değerleriyle indekslenir ve site haritasına girer.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, model: m } = await params;
  const data = await load(slug, m);
  if (!data) return {};
  const { product, model } = data;
  const page = modelPageOf(product.slug, model.slug);
  if (page) {
    return buildMetadata({
      title: page.seoTitle,
      description: page.metaDescription,
      keywords: page.keywords,
      path: modelPath(product.slug, model.slug),
      image: page.image.url,
      imageAlt: page.image.alt,
    });
  }
  // Yerel içerik varsa açıklama ve paylaşım görseli modele özgü olur (tekrar eden meta açıklamaları azalır).
  const local = await getLocalContent(localKey.model(product.slug, model.slug));
  const localText = htmlToText(local?.intro);
  const name = modelName(familyOf(product), product.name, model.size);
  const values = keyValues(model, 3).map((r) => `${r.label} ${formatSpec(r.value, r.unit)}`).join(", ");
  return buildEntityMetadata({
    name: `${name} ${model.code}`,
    path: modelPath(product.slug, model.slug),
    seo: { metaTitle: null, metaDescription: null, metaKeywords: null, canonicalUrl: null, ogImage: null, noIndex: false },
    fallbackDescription: [...(localText ? [localText] : []), `${name} (${model.code})${model.series ? `, ${model.series}` : ""}${values ? `: ${values}.` : "."} Teknik özellikler, ölçü çizimi ve üretim detayları; Bifire kendi üretim ve montaj.`],
    image: local?.image || product.coverImage,
    imageAlt: (local?.image && local.imageAlt) || product.coverImageAlt || product.name,
  });
}

export default async function ModelPage({ params }: Props) {
  const { slug, model: m } = await params;
  const data = await load(slug, m);
  if (!data) notFound();
  const { product, models, model } = data;
  const page = modelPageOf(product.slug, model.slug);
  const [[categories, products], settings, siblings, local] = await Promise.all([getFormOptions(), getSiteSettings(), getCollectionSiblings(product), getLocalContent(localKey.model(product.slug, model.slug))]);
  const category = product.category;
  const parent = category.parent?.active ? category.parent : null;
  const crumbs: Crumb[] = [
    { name: "Ana Sayfa", path: "/" },
    { name: "Şömine Modelleri", path: routes.products },
    ...(parent ? [{ name: parent.name, path: routes.category(parent.slug) }] : []),
    { name: category.name, path: routes.category(category.slug, parent?.slug) },
    { name: product.name, path: routes.product(product.slug) },
    { name: page?.h1 ?? [model.series, model.size].filter(Boolean).join(" · "), path: modelPath(product.slug, model.slug) },
  ];
  return <ModelView product={product} models={models} model={model} crumbs={crumbs} settings={settings} form={{ categories, products }} siblings={siblings} page={page} local={local} />;
}
