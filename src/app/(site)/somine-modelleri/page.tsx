import type { Metadata } from "next";
import Link from "next/link";
import { CategoryCard, ProductCard } from "@/components/site/Cards";
import { EmptyState } from "@/components/site/EmptyState";
import { FinalCta } from "@/components/site/FinalCta";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { routes } from "@/lib/catalog";
import { getAllProducts, getNavCategories } from "@/lib/queries";
import { breadcrumbNode, graph, itemListNode, webPageNode } from "@/lib/seo/json-ld";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { STATIC_PAGES } from "@/lib/seo/static-pages";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("urunler");
}

const CRUMBS = [
  { name: "Ana Sayfa", path: "/" },
  { name: "Şömine Modelleri", path: routes.products },
];

/** Koleksiyonlar (Şömine Modelleri) — ürün grupları ve tüm modeller. Eski /urunler adresi buraya kalıcı yönlenir. */
export default async function ProductsPage() {
  const [categories, products] = await Promise.all([getNavCategories(), getAllProducts()]);
  const byCategory = categories
    .map((c) => ({ ...c, items: products.filter((p) => p.category.slug === c.slug || c.children.some((ch) => ch.slug === p.category.slug)) }))
    .filter((c) => c.items.length);

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path: routes.products, name: "Şömine Modelleri", description: STATIC_PAGES.urunler.defaults.description, type: "CollectionPage", hasBreadcrumb: true }),
          breadcrumbNode(routes.products, CRUMBS),
          categories.length ? itemListNode(routes.products, categories.map((c) => ({ name: c.name, path: routes.category(c.slug) }))) : null,
        )}
      />
      <PageHero
        crumbs={CRUMBS}
        eyebrow="Koleksiyon"
        title="Şömine Modelleri"
        intro="Şömine hazneleri, elektrikli, doğalgazlı ve bioethanol şömineler, orta şömineler ve bahçe çözümleri. Mekânınıza ve kullanım alışkanlığınıza uygun modeli teknik özellikleriyle inceleyin."
      />

      {categories.length ? (
        <section aria-labelledby="kategoriler" className="bg-paper pt-4 pb-14 sm:pt-6 sm:pb-20">
          <div className="shell">
            <h2 id="kategoriler" className="display-3">
              Ürün grupları
            </h2>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:gap-6">
              {categories.map((c, i) => (
                <li key={c.id}>
                  <CategoryCard category={{ ...c, count: c._count.products }} aspect="aspect-[4/3] sm:aspect-[16/10]" sizes="(min-width: 1360px) 640px, (min-width: 640px) 50vw, 100vw" priority={i < 2} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <div className="bg-paper pb-24">
        <div className="shell space-y-20 sm:space-y-28">
          {byCategory.length ? (
            byCategory.map((c) => (
              <section key={c.id} aria-labelledby={`grup-${c.slug}`}>
                <div className="flex flex-col gap-4 border-t border-sand pt-10 sm:flex-row sm:items-end sm:justify-between">
                  <h2 id={`grup-${c.slug}`} className="display-3">
                    {c.name}
                  </h2>
                  <Link href={routes.category(c.slug)} className="link-underline text-[13px] font-semibold tracking-[0.16em] text-ember-ink uppercase">
                    {c.name} kategorisine git
                  </Link>
                </div>
                <ul className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
                  {c.items.map((p) => (
                    <li key={p.id}>
                      <ProductCard product={p} />
                    </li>
                  ))}
                </ul>
              </section>
            ))
          ) : (
            <EmptyState title="Ürünler çok yakında" text="Koleksiyonumuz hazırlanıyor. Bu arada ihtiyacınızı bize iletebilirsiniz." action={{ label: "Teklif al", href: routes.quote }} />
          )}
        </div>
      </div>
      <FinalCta />
    </>
  );
}
