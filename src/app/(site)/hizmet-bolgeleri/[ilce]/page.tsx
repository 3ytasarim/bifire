import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { FaqList } from "@/components/site/FaqList";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { ProcessSteps } from "@/components/site/ProcessSteps";
import { RequestForm } from "@/components/site/RequestForm";
import { ShowroomBlock } from "@/components/site/ShowroomBlock";
import { TrustPoints } from "@/components/site/TrustPoints";
import { DISTRICT_PAGES, districtBySlug } from "@/content/regions";
import { routes } from "@/lib/catalog";
import { getFormOptions } from "@/lib/queries";
import { breadcrumbNode, faqNode, graph, serviceNode, webPageNode } from "@/lib/seo/json-ld";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import type { StaticPageKey } from "@/lib/seo/static-pages";

export const revalidate = 300;
// Yalnızca özgün içerikli öncelikli ilçeler (ince içerik riskine karşı); diğerleri 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return DISTRICT_PAGES.map((d) => ({ ilce: d.slug }));
}

type Props = { params: Promise<{ ilce: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ilce } = await params;
  return districtBySlug(ilce) ? buildStaticPageMetadata(`bolge-${ilce}` as StaticPageKey) : {};
}

export default async function DistrictPage({ params }: Props) {
  const { ilce } = await params;
  const d = districtBySlug(ilce);
  if (!d) notFound();

  const path = routes.region(d.slug);
  const crumbs = [
    { name: "Ana Sayfa", path: "/" },
    { name: "Hizmet Bölgeleri", path: routes.regions },
    { name: d.name, path },
  ];
  const [categories, products] = await getFormOptions();
  const others = DISTRICT_PAGES.filter((x) => x.slug !== d.slug);

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path, name: d.page.title, description: d.page.metaDescription, hasBreadcrumb: true }),
          breadcrumbNode(path, crumbs),
          serviceNode({ path, name: d.page.title, description: d.page.metaDescription, serviceType: "Şömine tasarımı ve montajı", areaServed: [`${d.name}, İstanbul`] }),
          faqNode(path, d.page.faqs),
        )}
      />
      <PageHero crumbs={crumbs} eyebrow={`${d.side} · ${d.name}`} title={d.page.title} intro={d.page.intro}>
        <div className="max-w-3xl">
          <TrustPoints compact />
        </div>
      </PageHero>

      <section aria-labelledby="ilce-odak" className="bg-white py-16 sm:py-24">
        <div className="shell">
          <p className="eyebrow text-ember-ink">{d.name} projelerinde öne çıkanlar</p>
          <h2 id="ilce-odak" className="display-3 mt-5 max-w-2xl text-balance">
            Mekânınızı tanıyarak başlayalım.
          </h2>
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {d.page.focus.map((f, i) => (
              <li key={f.title} className="reveal rounded-2xl border border-linen bg-paper p-6 sm:p-7">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase tabular-nums">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 font-display text-xl font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-steel">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ProcessSteps />

      <section aria-labelledby="ilce-sss" className="bg-paper py-16 sm:py-24">
        <div className="shell grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow text-ember-ink">Sık sorulanlar</p>
            <h2 id="ilce-sss" className="display-3 mt-5">
              {d.name} için sorular.
            </h2>
          </div>
          <FaqList items={d.page.faqs} className="lg:col-span-8" />
        </div>
      </section>

      <section id="basvuru" aria-labelledby="ilce-basvuru" className="scroll-mt-28 border-t border-sand bg-bone py-16 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-ember-ink">Projenizi konuşalım</p>
            <h2 id="ilce-basvuru" className="display-2 mt-5">
              {d.page.locative} projeniz için başvurun
            </h2>
            <p className="lead mt-6 text-steel">Mekân fotoğrafları, yaklaşık ölçüler ve beklentinizle başlayın; showroom ziyaretinizi de birlikte planlayalım.</p>
          </div>
          <div className="lg:col-span-7">
            <RequestForm type="QUOTE" categories={categories} products={products} sourcePath={path} submitLabel="Başvuruyu gönder" showroomToggle district defaultDistrict={d.name} />
          </div>
        </div>
      </section>

      <ShowroomBlock />

      <nav aria-labelledby="diger-ilceler" className="bg-white py-14 sm:py-20">
        <div className="shell">
          <h2 id="diger-ilceler" className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">
            Diğer öncelikli görüşme bölgeleri
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={routes.region(o.slug)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-linen bg-paper px-4 text-[14px] font-semibold text-ink hover:border-ink">
                  {o.name} <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-ember-ink" />
                </Link>
              </li>
            ))}
            <li>
              <Link href={routes.regions} className="inline-flex min-h-11 items-center rounded-full px-4 text-[14px] font-semibold text-ember-ink underline-offset-4 hover:underline">
                Tüm ilçeler
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
