import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { ProcessSteps } from "@/components/site/ProcessSteps";
import { RequestForm } from "@/components/site/RequestForm";
import { SeoArticle } from "@/components/site/SeoArticle";
import { ShowroomBlock } from "@/components/site/ShowroomBlock";
import { SERVICES, serviceBySlug } from "@/content/company";
import { DISTRICTS } from "@/content/regions";
import { routes } from "@/lib/catalog";
import { getFormOptions } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";
import { breadcrumbNode, faqNode, graph, serviceNode, webPageNode } from "@/lib/seo/json-ld";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;
export const dynamicParams = false;

const SEO_KEY = { "ozel-olcu-somine-tasarimi": "hizmet-ozel-olcu", "somine-montaji": "hizmet-montaj" } as const;
type Slug = keyof typeof SEO_KEY;

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return slug in SEO_KEY ? buildStaticPageMetadata(SEO_KEY[slug as Slug]) : {};
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) notFound();

  const path = routes.service(service.slug);
  const crumbs = [
    { name: "Ana Sayfa", path: "/" },
    { name: "Hizmetler", path: routes.services },
    { name: service.name, path },
  ];
  const [[categories, products], s] = await Promise.all([getFormOptions(), getSiteSettings()]);
  const hero = service.slug === "somine-montaji" ? { url: s.aboutImage, alt: s.aboutImageAlt } : { url: s.featureImage, alt: s.featureImageAlt };

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path, name: service.name, description: service.metaDescription, hasBreadcrumb: true }),
          breadcrumbNode(path, crumbs),
          serviceNode({ path, name: service.name, description: service.metaDescription, serviceType: service.name, areaServed: ["İstanbul", ...DISTRICTS.filter((d) => d.priority).map((d) => d.name)] }),
          faqNode(path, service.faqs),
        )}
      />
      <PageHero crumbs={crumbs} eyebrow={service.eyebrow} title={service.name} intro={service.intro} image={hero.url} imageAlt={hero.alt} />

      <section aria-labelledby="hizmet-kapsam" className="bg-white py-16 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="eyebrow text-ember-ink">Birlikte ele aldıklarımız</p>
            <h2 id="hizmet-kapsam" className="display-3 mt-5">
              Görünüş ve uygulama aynı planda.
            </h2>
            <ul className="mt-8 space-y-3">
              {service.includes.map((it) => (
                <li key={it} className="flex gap-3 text-[16px] text-ink">
                  <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-ember" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
            {service.sections.map((x, i) => (
              <li key={x.title} className="reveal rounded-2xl border border-linen bg-paper p-6 sm:p-7">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase tabular-nums">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 font-display text-xl font-semibold text-ink">{x.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-steel">{x.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ProcessSteps />

      {/* Uzun metin, SSS ve rehber bağlantıları (hizmet sayfası Word paketi). */}
      <SeoArticle html={service.article} name={service.name} />

      <section id="basvuru" aria-labelledby="hizmet-basvuru" className="scroll-mt-28 border-t border-sand bg-bone py-16 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-ember-ink">Projenizi konuşalım</p>
            <h2 id="hizmet-basvuru" className="display-2 mt-5">
              {service.name} için başvurun
            </h2>
            <p className="lead mt-6 text-steel">Fotoğraflar, yaklaşık ölçüler ve beklentiniz ilk görüşme için iyi bir başlangıçtır.</p>
          </div>
          <div className="lg:col-span-7">
            <RequestForm type="QUOTE" categories={categories} products={products} sourcePath={path} submitLabel="Başvuruyu gönder" showroomToggle district />
          </div>
        </div>
      </section>

      <ShowroomBlock />
    </>
  );
}
