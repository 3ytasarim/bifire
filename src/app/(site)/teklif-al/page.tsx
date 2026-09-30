import type { Metadata } from "next";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { RequestForm } from "@/components/site/RequestForm";
import { routes } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { getFormOptions } from "@/lib/queries";
import { breadcrumbNode, graph, webPageNode } from "@/lib/seo/json-ld";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { STATIC_PAGES } from "@/lib/seo/static-pages";

// ?urun=slug yalnızca formu önceden doldurur; canonical her zaman parametresiz /teklif-al.
export function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("teklif-al");
}

const CRUMBS = [
  { name: "Ana Sayfa", path: "/" },
  { name: "Teklif Al", path: routes.quote },
];

const STEPS = [
  { title: "Talebinizi iletin", text: "Mekân, ölçü ve beklentilerinizi paylaşın; varsa fotoğraf ve çizimleri daha sonra iletebilirsiniz." },
  { title: "Sizi arayalım", text: "İhtiyacınızı netleştirmek için kısa bir görüşme yapar, gerekirse keşif planlarız." },
  { title: "Teklifinizi alın", text: "Uygun ürün seçenekleri ve uygulama kapsamıyla birlikte teklifinizi hazırlarız." },
];

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ urun?: string }> }) {
  const { urun } = await searchParams;
  const [[categories, products], preset] = await Promise.all([
    getFormOptions(),
    urun ? prisma.product.findFirst({ where: { slug: String(urun).slice(0, 100), active: true }, select: { id: true, categoryId: true } }) : null,
  ]);

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path: routes.quote, name: "Teklif Al", description: STATIC_PAGES["teklif-al"].defaults.description, hasBreadcrumb: true }),
          breadcrumbNode(routes.quote, CRUMBS),
        )}
      />
      <PageHero crumbs={CRUMBS} eyebrow="Teklif" title="Size özel şömine teklifi" intro="Birkaç bilgiyle başlayalım; mekânınıza uygun seçenekleri ve teklifimizi hazırlayalım." />
      <section className="bg-paper py-16 sm:py-24">
        <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-4">
            <h2 className="display-3">Nasıl ilerliyoruz?</h2>
            <ol className="mt-8 border-t border-sand">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-5 border-b border-sand py-6">
                  <span className="font-display text-sm font-semibold text-ember-ink tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-steel">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-8">
            <RequestForm
              type="QUOTE"
              categories={categories}
              products={products}
              defaultProductId={preset?.id}
              defaultCategoryId={preset?.categoryId}
              sourcePath={routes.quote}
              submitLabel="Teklif iste"
            />
          </div>
        </div>
      </section>
    </>
  );
}
