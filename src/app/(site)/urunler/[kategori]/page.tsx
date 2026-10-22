import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/site/Cards";
import { EmptyState } from "@/components/site/EmptyState";
import { FinalCta } from "@/components/site/FinalCta";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/site/RichText";
import { routes } from "@/lib/catalog";
import { getCategoryBySlug, getCategoryProducts, getModelCounts } from "@/lib/queries";
import { CollectionView } from "@/components/collection/CollectionView";
import { collectionCopy } from "@/lib/collection";
import { getImageMeta } from "@/lib/seo/image-meta";
import { breadcrumbNode, graph, imageNode, itemListNode, webPageNode, type Crumb } from "@/lib/seo/json-ld";
import { buildEntityMetadata, deriveDescription } from "@/lib/seo/metadata";

export const revalidate = 300;

// Kategoriler build'de değil ilk istekte üretilip önbelleğe alınır (ISR); yeni kategori için yeniden build gerekmez.
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ kategori: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kategori } = await params;
  const c = await getCategoryBySlug(kategori);
  if (!c) return {};
  return buildEntityMetadata({
    name: c.name,
    path: routes.category(c.slug),
    seo: c,
    fallbackDescription: [c.description, c.content],
    image: c.image,
    imageAlt: c.imageAlt,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { kategori } = await params;
  const category = await getCategoryBySlug(kategori);
  if (!category) notFound();

  const products = await getCategoryProducts([category.id, ...category.children.map((c) => c.id)]);
  const path = routes.category(category.slug);
  const crumbs: Crumb[] = [
    { name: "Ana Sayfa", path: "/" },
    { name: "Ürünler", path: routes.products },
    ...(category.parent ? [{ name: category.parent.name, path: routes.category(category.parent.slug) }] : []),
    { name: category.name, path },
  ];
  const imageMeta = category.image ? await getImageMeta(category.image) : null;
  const description = category.metaDescription || deriveDescription(category.description, category.content);

  const jsonLd = (
    <JsonLd
      data={graph(
        category.image ? imageNode(path, { url: category.image, alt: category.imageAlt || category.name, meta: imageMeta }) : null,
        webPageNode({ path, name: category.name, description, type: "CollectionPage", hasBreadcrumb: true, hasPrimaryImage: Boolean(category.image), dateModified: category.updatedAt }),
        breadcrumbNode(path, crumbs),
        products.length ? itemListNode(path, products.map((p) => ({ name: p.name, path: routes.product(p.slug) }))) : null,
      )}
    />
  );

  // Alt kategorili ürün grupları (Odunlu, Bahçe ve Tamamlayıcı…): koleksiyon düzeni — her ürün ailesi büyük kart.
  // Metinler Admin > Kategoriler'den (hero başlığı, seçim başlığı/metni, yaklaşım bandı); boşsa genel metin.
  if (category.children.length && products.length) {
    const modelCounts = await getModelCounts(products.map((p) => p.id));
    const copy = collectionCopy(category);
    return (
      <>
        {jsonLd}
        <CollectionView category={category} products={products} modelCounts={modelCounts} crumbs={crumbs} copy={copy} />
      </>
    );
  }

  return (
    <>
      <JsonLd
        data={graph(
          category.image ? imageNode(path, { url: category.image, alt: category.imageAlt || category.name, meta: imageMeta }) : null,
          webPageNode({ path, name: category.name, description, type: "CollectionPage", hasBreadcrumb: true, hasPrimaryImage: Boolean(category.image), dateModified: category.updatedAt }),
          breadcrumbNode(path, crumbs),
          products.length ? itemListNode(path, products.map((p) => ({ name: p.name, path: routes.product(p.slug) }))) : null,
        )}
      />
      <PageHero crumbs={crumbs} eyebrow={category.parent?.name ?? "Ürünler"} title={category.name} intro={category.description} image={category.image} imageAlt={category.imageAlt || category.name}>
        {category.children.length ? (
          <nav aria-label={`${category.name} alt kategorileri`}>
            <ul className="flex flex-wrap gap-2">
              {category.children.map((ch) => (
                <li key={ch.id}>
                  <Link href={routes.category(ch.slug)} className="inline-flex min-h-11 items-center border border-white/25 px-4 text-[13px] font-semibold tracking-[0.1em] text-white uppercase transition-colors hover:border-ember hover:bg-ember hover:text-ink">
                    {ch.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </PageHero>

      <section aria-labelledby="modeller" className="bg-paper py-16 sm:py-24">
        <div className="shell">
          <div className="flex items-end justify-between gap-6 border-b border-sand pb-6">
            <h2 id="modeller" className="display-3">
              {category.name} modelleri
            </h2>
            <p className="text-sm text-stone">{products.length} model</p>
          </div>
          {products.length ? (
            <ul className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => (
                <li key={p.id}>
                  <ProductCard product={p} priority={!category.image && i < 2} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-12">
              <EmptyState
                title="Bu kategoride modeller hazırlanıyor"
                text="İhtiyacınızı paylaşın; mekânınıza uygun seçenekleri sizin için derleyelim."
                action={{ label: "Teklif al", href: routes.quote }}
              />
            </div>
          )}
        </div>
      </section>

      {category.content ? (
        <section aria-label={`${category.name} hakkında`} className="border-t border-sand bg-bone py-16 sm:py-24">
          <div className="shell">
            <RichText html={category.content} className="mx-auto max-w-3xl" />
          </div>
        </section>
      ) : null}
      <FinalCta context={`Kategori: ${category.name}`} />
    </>
  );
}
