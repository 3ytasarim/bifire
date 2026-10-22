import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Factory, MapPin, Wrench } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Motion";
import { ProductCard } from "@/components/site/Cards";
import { FaqList } from "@/components/site/FaqList";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { ProcessSteps } from "@/components/site/ProcessSteps";
import { RequestForm } from "@/components/site/RequestForm";
import { ShowroomBlock } from "@/components/site/ShowroomBlock";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { DISTRICT_CONTENT, districtContentBySlug } from "@/content/districts";
import { DISTRICTS, SHOWROOM_DISTRICT, districtProducts } from "@/content/regions";
import { routes } from "@/lib/catalog";
import { getFormOptions, getProductsBySlugs } from "@/lib/queries";
import { breadcrumbNode, faqNode, graph, serviceNode, webPageNode } from "@/lib/seo/json-ld";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import type { StaticPageKey } from "@/lib/seo/static-pages";

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return DISTRICT_CONTENT.map((d) => ({ ilce: d.slug }));
}

type Props = { params: Promise<{ ilce: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ilce } = await params;
  return districtContentBySlug(ilce) ? buildStaticPageMetadata(`bolge-${ilce}` as StaticPageKey) : {};
}

/**
 * İlçe sayfası (39 ilçe, her biri özgün içerik — content/districts). Şube iddiası yok: fabrika showroom Tuzla'da.
 */
export default async function DistrictPage({ params }: Props) {
  const { ilce } = await params;
  const d = districtContentBySlug(ilce);
  if (!d) notFound();

  const path = routes.region(d.slug);
  const crumbs = [
    { name: "Ana Sayfa", path: "/" },
    { name: "Hizmet Bölgeleri", path: routes.regions },
    { name: `${d.name} Şömine`, path },
  ];
  const [[categories, products], recommended] = await Promise.all([getFormOptions(), getProductsBySlugs(districtProducts(d.slug))]);
  const isShowroom = d.name === SHOWROOM_DISTRICT;
  const priority = DISTRICTS.filter((x) => x.priority && x.slug !== d.slug);
  const sameSide = DISTRICTS.filter((x) => !x.priority && x.side === d.side && x.slug !== d.slug).slice(0, 8);

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path, name: d.h1, description: d.metaDescription, hasBreadcrumb: true }),
          breadcrumbNode(path, crumbs),
          serviceNode({ path, name: d.h1, description: d.metaDescription, serviceType: "Şömine tasarımı, üretimi ve montajı", areaServed: [`${d.name}, İstanbul`] }),
          faqNode(path, d.faqs),
        )}
      />
      <PageHero crumbs={crumbs} eyebrow={`${d.side} · ${d.name}`} title={d.h1} intro={d.intro}>
        <div className="flex flex-wrap items-center gap-3">
          <ArrowFillButton href="#basvuru" tone="ember">
            Projenizi birlikte değerlendirelim
          </ArrowFillButton>
          <Link href={routes.regions} className="inline-flex min-h-12 items-center gap-2 px-2 text-[14px] font-semibold text-ink underline-offset-4 hover:underline">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Tüm hizmet bölgeleri
          </Link>
        </div>
        <ul className="mt-6 flex flex-wrap gap-2.5">
          {[
            { Icon: Factory, text: isShowroom ? "Fabrika showroom ilçede" : `Fabrika showroom: ${SHOWROOM_DISTRICT}` },
            { Icon: Wrench, text: "Kendi üretim ve montaj ekibi" },
            { Icon: MapPin, text: `${d.name} için proje görüşmesi` },
          ].map(({ Icon, text }) => (
            <li key={text} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-linen bg-white px-4 text-[13px] font-semibold text-ink">
              <Icon aria-hidden="true" className="h-4 w-4 text-ember" /> {text}
            </li>
          ))}
        </ul>
      </PageHero>

      <section aria-labelledby="ilce-icerik" className="relative overflow-hidden bg-white py-16 sm:py-24">
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.12),transparent_65%)]" />
        <div className="shell relative grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Reveal className="lg:sticky lg:top-32">
              <p className="eyebrow text-ember-ink">{d.name} şömine projesi</p>
              <h2 id="ilce-icerik" className="display-3 mt-5 text-balance">
                Projenizi adım adım netleştirelim.
              </h2>
              <dl className="mt-10 space-y-5 rounded-2xl border border-linen bg-paper p-6">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">Görüşmeye hazırlık</p>
                <div>
                  <dt className="text-[12px] text-stone">Projenizin konumu</dt>
                  <dd className="mt-0.5 font-semibold text-ink">{d.name}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-stone">Üretim ve showroom merkezimiz</dt>
                  <dd className="mt-0.5 font-semibold text-ink">İstanbul {SHOWROOM_DISTRICT}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-stone">Paylaşabileceğiniz bilgiler</dt>
                  <dd className="mt-0.5 text-[14px] leading-relaxed text-ink">Mekân fotoğrafları, varsa plan, yaklaşık ölçüler ve kullanım beklentisi.</dd>
                </div>
                <Link href={routes.showroom} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ember-ink underline-offset-4 hover:underline">
                  Fabrika showroomunu inceleyin <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                </Link>
              </dl>
            </Reveal>
          </div>
          <Stagger as="ol" className="space-y-4 lg:col-span-8">
            {d.sections.map((s, i) => (
              <StaggerItem key={s.title} className="group relative overflow-hidden rounded-[1.5rem] border border-linen bg-paper p-7 transition-shadow duration-500 hover:shadow-[0_24px_48px_-28px_rgb(12_12_13/0.35)] sm:p-9">
                <span aria-hidden="true" className="absolute top-6 right-7 font-display text-5xl leading-none font-semibold tracking-[-0.04em] text-sand transition-colors duration-500 group-hover:text-ember/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-ember transition-transform duration-700 ease-(--ease-premium) group-hover:scale-x-100" />
                <h3 className="max-w-[85%] font-display text-xl font-semibold text-ink sm:text-2xl">{s.title}</h3>
                <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-steel">
                  {s.paras.map((p) => (
                    <p key={p.slice(0, 40)}>{p}</p>
                  ))}
                </div>
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
            <p className="eyebrow text-ember-ink">Sık sorulan sorular</p>
            <h2 id="ilce-sss" className="display-3 mt-5">
              {d.name} için sorular.
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-8" delay={0.1}>
            <FaqList items={d.faqs} />
          </Reveal>
        </div>
      </section>

      <section id="basvuru" aria-labelledby="ilce-basvuru" className="scroll-mt-28 border-t border-sand bg-bone py-16 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow text-ember-ink">İlk adımı birlikte belirleyelim</p>
            <h2 id="ilce-basvuru" className="display-2 mt-5">
              {d.name} için görüşme planlayın
            </h2>
            <p className="lead mt-6 text-steel">Mekân fotoğraflarınız, varsa planınız ve kullanım beklentinizle başlayın; showroom ziyaretinizi de birlikte planlayalım.</p>
          </Reveal>
          <div className="lg:col-span-7">
            <RequestForm type="QUOTE" categories={categories} products={products} sourcePath={path} submitLabel="Görüşme talebimi gönder" showroomToggle district defaultDistrict={d.name} />
          </div>
        </div>
      </section>

      <ShowroomBlock title="Kararınızı Tuzla fabrika showroomunda somutlaştıralım" intro={d.closing ?? undefined} />

      <nav aria-labelledby="diger-ilceler" className="bg-white py-14 sm:py-20">
        <div className="shell space-y-8">
          <div>
            <h2 id="diger-ilceler" className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">
              Öncelikli görüşme bölgeleri
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {priority.map((o) => (
                <li key={o.slug}>
                  <Link href={routes.region(o.slug)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-ember/30 bg-ember/[0.04] px-4 text-[14px] font-semibold text-ink transition-colors hover:border-ember">
                    {o.name} <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-ember-ink" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {sameSide.length ? (
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">{d.side} ilçeleri</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {sameSide.map((o) => (
                  <li key={o.slug}>
                    <Link href={routes.region(o.slug)} className="inline-flex min-h-11 items-center rounded-full border border-linen bg-paper px-4 text-[14px] font-semibold text-ink transition-colors hover:border-ink">
                      {o.name}
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
          ) : null}
        </div>
      </nav>
    </>
  );
}
