import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Factory, MapPin, Wrench } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Motion";
import { ProductCard } from "@/components/site/Cards";
import { FaqList } from "@/components/site/FaqList";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { ProcessSteps } from "@/components/site/ProcessSteps";
import { RequestForm } from "@/components/site/RequestForm";
import { ShowroomBlock } from "@/components/site/ShowroomBlock";
import { DISTRICT_EXTRA, DISTRICT_PAGES, SHOWROOM_DISTRICT, districtBySlug } from "@/content/regions";
import { routes } from "@/lib/catalog";
import { getFormOptions, getProductsBySlugs } from "@/lib/queries";
import { getSiteSettings, showroomImageOf } from "@/lib/settings";
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
  const extra = DISTRICT_EXTRA[d.slug];

  const path = routes.region(d.slug);
  const crumbs = [
    { name: "Ana Sayfa", path: "/" },
    { name: "Hizmet Bölgeleri", path: routes.regions },
    { name: d.name, path },
  ];
  const [[categories, products], recommended, settings] = await Promise.all([getFormOptions(), getProductsBySlugs(extra?.products ?? []), getSiteSettings()]);
  const others = DISTRICT_PAGES.filter((x) => x.slug !== d.slug);
  const focus = [...d.page.focus, ...(extra?.focus ?? [])];
  const faqs = [...d.page.faqs, ...(extra?.faqs ?? [])];
  const isShowroomDistrict = d.name === SHOWROOM_DISTRICT;
  const heroImg = showroomImageOf(settings);

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path, name: d.page.title, description: d.page.metaDescription, hasBreadcrumb: true }),
          breadcrumbNode(path, crumbs),
          serviceNode({ path, name: d.page.title, description: d.page.metaDescription, serviceType: "Şömine tasarımı, üretimi ve montajı", areaServed: [`${d.name}, İstanbul`] }),
          faqNode(path, faqs),
        )}
      />
      <PageHero crumbs={crumbs} eyebrow={`${d.side} · ${d.name}`} title={d.page.title} intro={d.page.intro} image={isShowroomDistrict ? heroImg.url : null} imageAlt={heroImg.alt}>
        <ul className="flex flex-wrap gap-2.5">
          {[
            { Icon: Factory, text: isShowroomDistrict ? "Fabrika showroom ilçede" : `Fabrika showroom: ${SHOWROOM_DISTRICT}` },
            { Icon: Wrench, text: "Kendi montaj ekibimiz" },
            { Icon: MapPin, text: `${d.name} için proje görüşmesi` },
          ].map(({ Icon, text }) => (
            <li key={text} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-linen bg-white px-4 text-[14px] font-semibold text-ink">
              <Icon aria-hidden="true" className="h-4 w-4 text-ember" /> {text}
            </li>
          ))}
        </ul>
      </PageHero>

      {extra?.body.length ? (
        <section aria-labelledby="ilce-yaklasim" className="relative overflow-hidden bg-white py-16 sm:py-24">
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.12),transparent_65%)]" />
          <div className="shell relative grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow text-ember-ink">Yaklaşımımız</p>
              <h2 id="ilce-yaklasim" className="display-3 mt-5 text-balance">
                {d.page.locative} projeler için.
              </h2>
            </Reveal>
            <div className="space-y-6 lg:col-span-7">
              {extra.body.map((p, i) => (
                <Reveal key={p} delay={i * 0.1}>
                  <p className={i === 0 ? "lead text-ink" : "text-[17px] leading-relaxed text-steel"}>{p}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="ilce-odak" className="bg-ink py-16 text-white sm:py-24">
        <div className="shell">
          <Reveal>
            <p className="eyebrow text-ember">{d.name} projelerinde öne çıkanlar</p>
            <h2 id="ilce-odak" className="display-3 mt-5 max-w-2xl text-balance text-white">
              Mekânınızı tanıyarak başlayalım.
            </h2>
          </Reveal>
          <Stagger className="mt-12 grid gap-4 md:grid-cols-2">
            {focus.map((f, i) => (
              <StaggerItem key={f.title} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition-colors duration-500 hover:border-ember/50 sm:p-8">
                <span aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-ember/0 blur-3xl transition-colors duration-700 group-hover:bg-ember/25" />
                <p className="font-display text-4xl leading-none font-semibold tracking-[-0.03em] text-white/15 transition-colors duration-500 group-hover:text-ember">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-5 font-display text-xl font-semibold text-white sm:text-2xl">{f.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-white/70">{f.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {recommended.length ? (
        <section aria-labelledby="ilce-urunler" className="bg-paper py-16 sm:py-24">
          <div className="shell">
            <Reveal className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow text-ember-ink">Bu tür projelerde öne çıkanlar</p>
                <h2 id="ilce-urunler" className="display-3 mt-5">
                  Şömine tipleri
                </h2>
              </div>
              <Link href={routes.products} className="link-underline text-[13px] font-semibold tracking-[0.16em] text-ember-ink uppercase">
                Tüm ürünler
              </Link>
            </Reveal>
            <Stagger className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {recommended.map((p) => (
                <StaggerItem key={p.id}>
                  <ProductCard product={p} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      <ProcessSteps />

      <section aria-labelledby="ilce-sss" className="bg-paper py-16 sm:py-24">
        <div className="shell grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow text-ember-ink">Sık sorulanlar</p>
            <h2 id="ilce-sss" className="display-3 mt-5">
              {d.name} için sorular.
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-8" delay={0.1}>
            <FaqList items={faqs} />
          </Reveal>
        </div>
      </section>

      <section id="basvuru" aria-labelledby="ilce-basvuru" className="scroll-mt-28 border-t border-sand bg-bone py-16 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow text-ember-ink">Projenizi konuşalım</p>
            <h2 id="ilce-basvuru" className="display-2 mt-5">
              {d.page.locative} projeniz için başvurun
            </h2>
            <p className="lead mt-6 text-steel">Mekân fotoğrafları, yaklaşık ölçüler ve beklentinizle başlayın; showroom ziyaretinizi de birlikte planlayalım.</p>
          </Reveal>
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
                <Link href={routes.region(o.slug)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-linen bg-paper px-4 text-[14px] font-semibold text-ink transition-colors hover:border-ink">
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
