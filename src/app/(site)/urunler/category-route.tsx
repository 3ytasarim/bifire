import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ProductCard } from "@/components/site/Cards";
import { EmptyState } from "@/components/site/EmptyState";
import { FinalCta } from "@/components/site/FinalCta";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { SeoArticle } from "@/components/site/SeoArticle";
import { ImageNote } from "@/components/site/ProductBrandParts";
import { routes } from "@/lib/catalog";
import { getCategoryBySlug, getCategoryProducts, getModelCounts, getSoleProductCategory } from "@/lib/queries";
import { CollectionView } from "@/components/collection/CollectionView";
import { collectionCopy } from "@/lib/collection";
import { extractFaq } from "@/lib/html-sections";
import { getImageMeta } from "@/lib/seo/image-meta";
import { breadcrumbNode, faqNode, graph, imageNode, itemListNode, webPageNode, type Crumb } from "@/lib/seo/json-ld";
import { buildEntityMetadata, deriveDescription } from "@/lib/seo/metadata";

/**
 * Kategori sayfası (iki kökten servis edilir: /somine-modelleri/[kategori] ve /urunler/[kategori] — bkz.
 * categoryBase). Kategori yanlış kökten istenirse doğru adrese kalıcı yönlenir.
 */

/** Kayıtlı canonical boş ya da kategorinin kendi adresi mi (yönetici başka bir adres girmediyse). */
const isSelfOrEmpty = (canonical: string | null, slug: string) => !canonical || /\/([^/?#]+)\/?$/.exec(canonical)?.[1] === slug;

export async function categoryMetadata(kategori: string): Promise<Metadata> {
  const c = await getCategoryBySlug(kategori);
  if (!c) return {};
  const sole = await getSoleProductCategory(c.id);
  return buildEntityMetadata({
    name: c.name,
    path: routes.category(c.slug, c.parent?.slug),
    // Tek ürünlü kategori: aynı metin ürün sayfasında; arama motoruna ürün sayfası gösterilir.
    seo: sole && isSelfOrEmpty(c.canonicalUrl, c.slug) ? { ...c, canonicalUrl: routes.product(sole.productSlug, c.slug, c.parent?.slug) } : c,
    fallbackDescription: [c.description, c.content],
    image: c.image,
    imageAlt: c.imageAlt,
  });
}

export async function CategoryRoute({ kategori, at }: { kategori: string; at: string }) {
  const category = await getCategoryBySlug(kategori);
  if (!category) notFound();
  if (routes.category(category.slug, category.parent?.slug) !== at) permanentRedirect(routes.category(category.slug, category.parent?.slug));

  const products = await getCategoryProducts([category.id, ...category.children.map((c) => c.id)]);
  const path = routes.category(category.slug, category.parent?.slug);
  const crumbs: Crumb[] = [
    { name: "Ana Sayfa", path: "/" },
    { name: "Şömine Modelleri", path: routes.products },
    ...(category.parent?.parent ? [{ name: category.parent.parent.name, path: routes.category(category.parent.parent.slug) }] : []),
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
        products.length ? itemListNode(path, products.map((p) => ({ name: p.name, path: routes.product(p.slug, p.category.slug) }))) : null,
        faqNode(path, extractFaq(category.content)),
      )}
    />
  );

  // Alt kategorilerinde çok sayıda ürün olan grup (ör. Elektrikli → 2 Boyutlu / 3 Boyutlu): alt kategori başına
  // ürün ızgarası (ilk 8 ürün + tümü bağlantısı). Ürün ailesi kartları yerine katalog düzeni.
  const byChild = category.children.map((ch) => ({ ...ch, products: products.filter((p) => p.category.slug === ch.slug) }));
  if (byChild.some((ch) => ch.products.length > 1)) {
    const own = products.filter((p) => p.category.slug === category.slug);
    const groups = [...byChild.filter((ch) => ch.products.length), ...(own.length ? [{ id: category.id, name: `Diğer ${category.name.toLocaleLowerCase("tr")}`, slug: category.slug, products: own }] : [])];
    return (
      <>
        {jsonLd}
        <PageHero crumbs={crumbs} eyebrow={category.parent?.name ?? "Ürünler"} title={category.heroTitle || category.name} intro={category.description} image={category.image} imageAlt={category.imageAlt || category.name}>
          <nav aria-label={`${category.name} alt kategorileri`}>
            <ul className="flex flex-wrap gap-2">
              {groups.map((g) => (
                <li key={g.id}>
                  <a href={`#grup-${g.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/15 bg-white/70 px-4 text-[13px] font-semibold text-ink backdrop-blur transition-colors hover:border-ember hover:bg-ember hover:text-white">
                    {g.name} <span className="text-stone tabular-nums">{g.products.length}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </PageHero>
        {groups.map((g, gi) => (
          <section key={g.id} id={`grup-${g.slug}`} aria-labelledby={`grup-${g.slug}-baslik`} className={`scroll-mt-28 py-16 sm:py-20 ${gi % 2 ? "bg-white" : "bg-paper"}`}>
            <div className="shell">
              <div className="flex flex-wrap items-end justify-between gap-6 border-b border-sand pb-6">
                <h2 id={`grup-${g.slug}-baslik`} className="display-3">
                  {g.name}
                </h2>
                <p className="text-sm text-stone">{g.products.length} model</p>
              </div>
              <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {g.products.slice(0, 8).map((p, i) => (
                  <li key={p.id}>
                    <ProductCard product={p} priority={gi === 0 && i < 2} />
                  </li>
                ))}
              </ul>
              <GridImageNote products={g.products.slice(0, 8)} />
              {g.products.length > 8 && g.slug !== category.slug ? (
                <div className="mt-10">
                  <Link href={routes.category(g.slug, category.slug)} className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-ink pr-2 pl-6 text-[14px] font-semibold text-white transition-colors hover:bg-ember hover:text-white">
                    Tüm {g.name.toLocaleLowerCase("tr")} ({g.products.length})
                    <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                  </Link>
                </div>
              ) : null}
            </div>
          </section>
        ))}
        <SeoArticle html={category.content} name={category.name} />
        <FinalCta context={`Kategori: ${category.name}`} />
      </>
    );
  }

  // Alt kategorili ürün grupları (Odunlu, Bahçe ve Tamamlayıcı…): koleksiyon düzeni — her ürün ailesi büyük kart.
  // Metinler Admin > Kategoriler'den (hero başlığı, seçim başlığı/metni, yaklaşım bandı); boşsa genel metin.
  if (category.children.length && products.length) {
    const modelCounts = await getModelCounts(products.map((p) => p.id));
    const copy = collectionCopy(category);
    return (
      <>
        {jsonLd}
        <CollectionView category={category} products={products} modelCounts={modelCounts} crumbs={crumbs} copy={copy} article={<SeoArticle html={category.content} name={category.name} />} />
      </>
    );
  }

  return (
    <>
      {jsonLd}
      <PageHero crumbs={crumbs} eyebrow={category.parent?.name ?? "Ürünler"} title={category.heroTitle || category.name} intro={category.description} image={category.image} imageAlt={category.imageAlt || category.name}>
        {category.children.length ? (
          <nav aria-label={`${category.name} alt kategorileri`}>
            <ul className="flex flex-wrap gap-2">
              {category.children.map((ch) => (
                <li key={ch.id}>
                  <Link href={routes.category(ch.slug, category.slug)} className="inline-flex min-h-11 items-center rounded-full border border-sand bg-white/70 px-4 text-[13px] font-semibold tracking-[0.1em] text-ink uppercase backdrop-blur transition-colors hover:border-ember hover:bg-ember hover:text-white">
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
          ) : null}
          {products.length ? <GridImageNote products={products} /> : (
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

      <SeoArticle html={category.content} name={category.name} />
      <FinalCta context={`Kategori: ${category.name}`} />
    </>
  );
}

/** Izgaradaki kart görsellerinden biri temsili/yapay zekâ görseliyse notu ızgaranın altında bir kez gösterir. */
function GridImageNote({ products }: { products: { imageNote: string | null }[] }) {
  const note = products.find((p) => p.imageNote)?.imageNote;
  return note ? <ImageNote text={`Kart görselleri: ${note.charAt(0).toLocaleLowerCase("tr")}${note.slice(1)}`} /> : null;
}
