import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Motion";
import { GuideInvite } from "@/components/site/GuideInvite";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { REGION_GROUPS, regionGroupBySlug } from "@/content/region-groups";
import { provinceBySlug } from "@/content/service-areas";
import { routes } from "@/lib/catalog";
import { breadcrumbNode, graph, itemListNode, serviceNode, webPageNode } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

export function generateStaticParams() {
  return REGION_GROUPS.filter((g) => !g.province).map((g) => ({ bolge: g.slug }));
}

type Props = { params: Promise<{ bolge: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = regionGroupBySlug((await params).bolge);
  if (!g) return {};
  const cover = provinceBySlug(g.provinces[0]!)?.page.image;
  return buildMetadata({ title: g.seoTitle, description: g.description, path: routes.regionGroup(g.slug), image: cover?.url, imageAlt: cover?.alt });
}

/**
 * Bölge grubu sayfası (Marmara, Ege, Akdeniz, Bolu ve Düzce): gruptaki iller ve her ilin ilçeleri.
 * İl kartı il sayfasına, ilçe bağlantıları ilçe sayfalarına gider.
 */
export default async function RegionGroupPage({ params }: Props) {
  const g = regionGroupBySlug((await params).bolge);
  if (!g) notFound();
  const provinces = g.provinces.map(provinceBySlug).filter((p) => p !== null);
  const path = routes.regionGroup(g.slug);
  const crumbs = [
    { name: "Ana Sayfa", path: "/" },
    { name: "Hizmet Bölgeleri", path: routes.regions },
    { name: g.label, path },
  ];
  const districtCount = provinces.reduce((n, p) => n + p.districts.length, 0);

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path, name: g.title, description: g.description, hasBreadcrumb: true }),
          breadcrumbNode(path, crumbs),
          serviceNode({ path, name: g.title, description: g.description, serviceType: "Şömine tasarımı ve montajı", areaServed: provinces.map((p) => p.name) }),
          itemListNode(path, provinces.map((p) => ({ name: `${p.name} Şömine`, path: routes.province(p.slug) }))),
        )}
      />
      <PageHero crumbs={crumbs} eyebrow="Hizmet bölgelerimiz" title={g.title} intro={g.intro} image={provinces[0]?.page.image?.url ?? null} imageAlt={provinces[0]?.page.image?.alt ?? g.title}>
        <p className="text-[13px] font-semibold tracking-[0.14em] text-ember-ink uppercase tabular-nums">
          {provinces.length} il · {districtCount} ilçe
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {provinces.map((p) => (
            <li key={p.slug}>
              <a href={`#${p.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-sand bg-white/70 px-4 text-[14px] font-medium text-ink backdrop-blur transition-colors hover:border-ember hover:bg-ember hover:text-white">
                {p.name}
              </a>
            </li>
          ))}
        </ul>
      </PageHero>

      <div className="bg-paper">
        {provinces.map((p, i) => (
          <section key={p.slug} id={p.slug} aria-labelledby={`il-${p.slug}`} className={`section-pad scroll-mt-28 ${i % 2 ? "bg-bone" : "bg-paper"}`}>
            <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-14">
              <Reveal className="lg:col-span-5">
                <Link href={routes.province(p.slug)} className="group block">
                  <span className="zoom-media relative block aspect-[4/3] overflow-hidden rounded-2xl bg-sand">
                    {p.page.image ? <Image src={p.page.image.url} alt={p.page.image.alt} fill sizes="(min-width: 1024px) 520px, 100vw" className="object-cover" /> : <span className="ember-placeholder absolute inset-0" />}
                  </span>
                </Link>
              </Reveal>
              <div className="lg:col-span-7">
                <Reveal>
                  <p className="studio-eyebrow text-ember-ink tabular-nums">
                    {String(i + 1).padStart(2, "0")} / {p.districts.length} ilçe
                  </p>
                  <h2 id={`il-${p.slug}`} className="studio-h2 mt-4 text-ink">
                    {p.name}
                  </h2>
                  <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-steel">{p.page.focus}</p>
                </Reveal>
                <Stagger as="ul" className="mt-7 grid grid-cols-2 gap-x-6 sm:grid-cols-3" gap={0.02}>
                  {[...p.districts]
                    .sort((a, b) => a.name.localeCompare(b.name, "tr"))
                    .map((d) => (
                      <StaggerItem key={d.slug}>
                        <Link
                          href={routes.region(p.slug, d.slug)}
                          className="group/d flex min-h-10 items-center gap-0 border-b border-sand/70 text-[15px] text-ink transition-[color,gap] duration-500 ease-(--ease-premium) hover:gap-2 hover:text-ember-ink"
                        >
                          <span aria-hidden="true" className="block h-px w-0 bg-ember transition-[width] duration-500 ease-(--ease-premium) group-hover/d:w-3" />
                          {d.name}
                        </Link>
                      </StaggerItem>
                    ))}
                </Stagger>
                <Reveal className="mt-8">
                  <ArrowFillButton href={routes.province(p.slug)} tone="ember">
                    {`${p.name} sayfasını inceleyin`}
                  </ArrowFillButton>
                </Reveal>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section aria-label="Diğer hizmet bölgeleri" className="border-t border-sand bg-paper py-10">
        <div className="shell flex flex-wrap items-center gap-3">
          <span className="studio-eyebrow mr-2 text-steel">Diğer bölgeler</span>
          {REGION_GROUPS.filter((x) => x.slug !== g.slug).map((x) => (
            <Link
              key={x.slug}
              href={x.province ? routes.province(x.province) : routes.regionGroup(x.slug)}
              className="group inline-flex min-h-11 items-center gap-1.5 rounded-full border border-sand bg-white px-4 text-[14px] text-ink transition-colors hover:border-ember"
            >
              {x.label}
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-ember-ink transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          ))}
        </div>
      </section>

      <GuideInvite context={g.label} />
    </>
  );
}
