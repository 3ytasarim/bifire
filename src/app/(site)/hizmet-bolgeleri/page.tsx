import type { Metadata } from "next";
import { Factory, MapPin } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { RegionsGrid } from "@/components/site/RegionsGrid";
import { ShowroomBlock } from "@/components/site/ShowroomBlock";
import { DISTRICTS, DISTRICT_PAGES, SHOWROOM_DISTRICT } from "@/content/regions";
import { routes } from "@/lib/catalog";
import { breadcrumbNode, graph, itemListNode, serviceNode, webPageNode } from "@/lib/seo/json-ld";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { STATIC_PAGES } from "@/lib/seo/static-pages";

export function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("hizmet-bolgeleri");
}

const CRUMBS = [
  { name: "Ana Sayfa", path: "/" },
  { name: "Hizmet Bölgeleri", path: routes.regions },
];

export default function RegionsPage() {
  const items = DISTRICTS.map((d) => ({
    name: d.name,
    slug: d.slug,
    side: d.side,
    hint: d.hint,
    priority: Boolean(d.page),
    // Ayrı sayfası olmayan ilçe → ilçesi seçili başvuru formu (canonical'ı parametresiz /teklif-al).
    href: d.page ? routes.region(d.slug) : `${routes.quote}?ilce=${encodeURIComponent(d.name)}`,
  })).sort((a, b) => Number(b.priority) - Number(a.priority) || a.name.localeCompare(b.name, "tr"));

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path: routes.regions, name: "Hizmet Bölgeleri", description: STATIC_PAGES["hizmet-bolgeleri"].defaults.description, hasBreadcrumb: true }),
          breadcrumbNode(routes.regions, CRUMBS),
          serviceNode({
            path: routes.regions,
            name: "Şömine tasarımı, üretimi ve montajı",
            description: STATIC_PAGES["hizmet-bolgeleri"].defaults.description,
            serviceType: "Şömine tasarımı ve montajı",
            areaServed: ["İstanbul", ...DISTRICTS.map((d) => d.name)],
          }),
          itemListNode(routes.regions, DISTRICT_PAGES.map((d) => ({ name: d.page.title, path: routes.region(d.slug) }))),
        )}
      />
      <PageHero
        crumbs={CRUMBS}
        eyebrow="Hizmet bölgeleri"
        title="İstanbul'da projenizden başlayalım."
        intro="Tuzla fabrika showroomumuzdan başlayarak, uygulama yerinin koşullarını ve hizmet kapsamını birlikte değerlendirelim."
      >
        <ul className="flex flex-wrap gap-3">
          <li className="inline-flex min-h-11 items-center gap-2 rounded-full border border-linen bg-white px-4 text-[14px] font-semibold text-ink">
            <MapPin aria-hidden="true" className="h-4 w-4 text-ember" /> {DISTRICTS.length} ilçe
          </li>
          <li className="inline-flex min-h-11 items-center gap-2 rounded-full border border-linen bg-white px-4 text-[14px] font-semibold text-ink">
            <Factory aria-hidden="true" className="h-4 w-4 text-ember" /> Fabrika showroom: İstanbul {SHOWROOM_DISTRICT}
          </li>
        </ul>
      </PageHero>

      <section aria-labelledby="ilceler" className="bg-paper pb-16 sm:pb-24">
        <div className="shell">
          <h2 id="ilceler" className="sr-only">
            İlçeler
          </h2>
          <RegionsGrid items={items} />
          <p className="mt-8 max-w-3xl text-[14px] leading-relaxed text-stone">
            İlçe sayfaları o ilçede bir şubemiz bulunduğu anlamına gelmez. Tüm projeler Tuzla fabrika showroomumuz ve kendi montaj ekibimizle yürütülür; hizmet kapsamı ve takvim uygunluğu ön görüşmede netleştirilir.
          </p>
        </div>
      </section>

      <ShowroomBlock />
    </>
  );
}
