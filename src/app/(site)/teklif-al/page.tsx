import type { Metadata } from "next";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { RequestForm } from "@/components/site/RequestForm";
import { TrustPoints } from "@/components/site/TrustPoints";
import { PROCESS } from "@/content/company";
import { DISTRICT_OPTIONS } from "@/content/service-areas/names";
import { routes } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { getFormOptions } from "@/lib/queries";
import { breadcrumbNode, graph, webPageNode } from "@/lib/seo/json-ld";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { STATIC_PAGES } from "@/lib/seo/static-pages";

// ?urun=slug ve ?ilce=Ad yalnızca formu önceden doldurur; canonical her zaman parametresiz /teklif-al.
export function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("teklif-al");
}

const CRUMBS = [
  { name: "Ana Sayfa", path: "/" },
  { name: "Proje Başvurusu", path: routes.quote },
];

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ urun?: string; ilce?: string }> }) {
  const { urun, ilce } = await searchParams;
  const district = ilce && DISTRICT_OPTIONS.includes(String(ilce)) ? String(ilce) : undefined;
  const [[categories, products], preset] = await Promise.all([
    getFormOptions(),
    urun ? prisma.product.findFirst({ where: { slug: String(urun).slice(0, 100), active: true }, select: { id: true, categoryId: true } }) : null,
  ]);

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path: routes.quote, name: "Proje Başvurusu", description: STATIC_PAGES["teklif-al"].defaults.description, hasBreadcrumb: true }),
          breadcrumbNode(routes.quote, CRUMBS),
        )}
      />
      <PageHero crumbs={CRUMBS} eyebrow="Proje başvurusu" title="Projenizi konuşalım." intro="Fotoğraflar, yaklaşık ölçüler ve beklentiniz ilk görüşme için iyi bir başlangıçtır. Mekânınızın ilçesini, düşündüğünüz ürün veya hizmeti ve uygulama dönemini paylaşın." />
      <section className="bg-paper py-16 sm:py-24">
        <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-4">
            <h2 className="display-3">Nasıl ilerliyoruz?</h2>
            <ol className="mt-8 border-t border-sand">
              {PROCESS.map((s, i) => (
                <li key={s.key} className="flex gap-5 border-b border-sand py-6">
                  <span className="font-display text-sm font-semibold text-ember-ink tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-steel">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-[14px] leading-relaxed text-stone">Varsa plan, fotoğraf ve baca bilgisini görüşme sırasında ekibimizle paylaşabilirsiniz.</p>
            <div className="mt-8">
              <TrustPoints compact />
            </div>
          </div>
          <div className="lg:col-span-8">
            <RequestForm
              type="QUOTE"
              categories={categories}
              products={products}
              defaultProductId={preset?.id}
              defaultCategoryId={preset?.categoryId}
              defaultDistrict={district}
              sourcePath={routes.quote}
              submitLabel="Başvuruyu gönder"
              showroomToggle
              district
              project
            />
          </div>
        </div>
      </section>
    </>
  );
}
