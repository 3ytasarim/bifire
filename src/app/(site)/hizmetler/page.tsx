import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { ProcessSteps } from "@/components/site/ProcessSteps";
import { ShowroomBlock } from "@/components/site/ShowroomBlock";
import { TrustPoints } from "@/components/site/TrustPoints";
import { SERVICES } from "@/content/company";
import { routes } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/settings";
import { breadcrumbNode, graph, itemListNode, webPageNode } from "@/lib/seo/json-ld";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { STATIC_PAGES } from "@/lib/seo/static-pages";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("hizmetler");
}

const CRUMBS = [
  { name: "Ana Sayfa", path: "/" },
  { name: "Hizmetler", path: routes.services },
];

export default async function ServicesPage() {
  const s = await getSiteSettings();
  // Hizmet kartı görselleri admin ayarlarındaki ana sayfa görsellerinden gelir (koda gömülü yol yok).
  const images = [
    { url: s.featureImage, alt: s.featureImageAlt },
    { url: s.aboutImage, alt: s.aboutImageAlt },
  ];

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path: routes.services, name: "Hizmetler", description: STATIC_PAGES.hizmetler.defaults.description, type: "CollectionPage", hasBreadcrumb: true }),
          breadcrumbNode(routes.services, CRUMBS),
          itemListNode(routes.services, SERVICES.map((x) => ({ name: x.name, path: routes.service(x.slug) }))),
        )}
      />
      <PageHero crumbs={CRUMBS} eyebrow="Hizmetler" title="Tasarımı, uygulamayla birlikte ele alalım." intro="Kendi üretimimiz ve montaj ekibimizle projenizin kararlarını bir arada değerlendirelim.">
        <div className="max-w-3xl">
          <TrustPoints compact />
        </div>
      </PageHero>

      <section aria-label="Hizmetlerimiz" className="bg-paper pb-16 sm:pb-24">
        <div className="shell">
          <ul className="grid gap-6 lg:grid-cols-2">
            {SERVICES.map((x, i) => {
              const img = images[i];
              return (
                <li key={x.slug}>
                  <Link href={routes.service(x.slug)} className="group relative isolate flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-[1.75rem] bg-ink p-8 text-white sm:min-h-[30rem] sm:p-10">
                    {img?.url ? (
                      <Image src={img.url} alt={img.alt || ""} fill sizes="(min-width: 1024px) 50vw, 100vw" className="-z-20 object-cover transition-transform duration-700 ease-(--ease-premium) group-hover:scale-[1.03]" />
                    ) : (
                      <span aria-hidden="true" className="ember-placeholder-dark absolute inset-0 -z-20" />
                    )}
                    <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/55 to-ink/5" />
                    <p className="eyebrow text-ember">{x.eyebrow}</p>
                    <h2 className="display-3 mt-4 text-white">{x.name}</h2>
                    <p className="mt-4 max-w-md text-[16px] leading-relaxed text-white/75">{x.summary}</p>
                    <span className="mt-8 inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.16em] text-white uppercase">
                      Hizmeti inceleyin <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <ProcessSteps eyebrow="Projenizin adımları" title="İlk fikirden uygulamaya." />
      <ShowroomBlock />
    </>
  );
}
