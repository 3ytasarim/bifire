import type { Metadata } from "next";
import { Factory, MapPin } from "lucide-react";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion/Motion";
import { FaqList } from "@/components/site/FaqList";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { RegionsGrid } from "@/components/site/RegionsGrid";
import { ShowroomBlock } from "@/components/site/ShowroomBlock";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { TrustPoints } from "@/components/site/TrustPoints";
import { DISTRICTS, REGION_FAQS, REGION_JOURNEY, SHOWROOM_DISTRICT, SIDES } from "@/content/regions";
import { routes } from "@/lib/catalog";
import { breadcrumbNode, faqNode, graph, itemListNode, serviceNode, webPageNode } from "@/lib/seo/json-ld";
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
    priority: Boolean(d.priority),
    href: routes.region(d.slug),
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
          itemListNode(routes.regions, DISTRICTS.map((d) => ({ name: `${d.name} Şömine`, path: routes.region(d.slug) }))),
          faqNode(routes.regions, REGION_FAQS),
        )}
      />
      <PageHero
        crumbs={CRUMBS}
        eyebrow="Hizmet bölgeleri"
        title="İstanbul’da şömine tasarımı, üretim ve montaj."
        intro="Kendi üretimimiz, kendi montaj ekibimiz ve Tuzla fabrika showroomumuzla şömine projenizi birlikte değerlendirelim."
      >
        <div className="flex flex-wrap items-center gap-3">
          <ArrowFillButton href="#ilceler" tone="ink">
            İlçenizi bulun
          </ArrowFillButton>
          <ArrowFillButton href={routes.quote} tone="ember">
            Projenizi paylaşın
          </ArrowFillButton>
        </div>
        <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-stone">Öncelikli odağımız Tuzla, çevre ilçeler ve Anadolu Yakası; Avrupa Yakası’nda özellikle Sarıyer.</p>
        <ul className="mt-6 flex flex-wrap gap-3">
          <li className="inline-flex min-h-11 items-center gap-2 rounded-full border border-linen bg-white px-4 text-[14px] font-semibold text-ink">
            <MapPin aria-hidden="true" className="h-4 w-4 text-ember" /> <CountUp value={DISTRICTS.length} /> ilçe
          </li>
          <li className="inline-flex min-h-11 items-center gap-2 rounded-full border border-linen bg-white px-4 text-[14px] font-semibold text-ink">
            <Factory aria-hidden="true" className="h-4 w-4 text-ember" /> Fabrika showroom: İstanbul {SHOWROOM_DISTRICT}
          </li>
        </ul>
      </PageHero>

      <section aria-label="Tasarım, üretim ve montaj" className="bg-paper pb-10">
        <div className="shell">
          <TrustPoints />
        </div>
      </section>

      <section aria-labelledby="yakalar" className="bg-paper pb-16 sm:pb-20">
        <div className="shell">
          <h2 id="yakalar" className="sr-only">
            Anadolu ve Avrupa Yakası
          </h2>
          <Stagger className="grid gap-4 md:grid-cols-2">
            {SIDES.map((x) => {
              const count = DISTRICTS.filter((d) => d.side === x.side).length;
              return (
                <StaggerItem key={x.side} className="group relative overflow-hidden rounded-[1.75rem] bg-ink p-8 text-white sm:p-10">
                  <span aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-ember/20 blur-3xl transition-colors duration-700 group-hover:bg-ember/35" />
                  <p className="font-display text-6xl leading-none font-semibold tracking-[-0.04em] text-white">
                    <CountUp value={count} />
                    <span className="text-ember">.</span>
                  </p>
                  <p className="mt-2 text-[11px] font-semibold tracking-[0.2em] text-white/60 uppercase">ilçe · {x.side}</p>
                  <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-white/75">{x.text}</p>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      <section id="ilceler" aria-labelledby="ilceler-baslik" className="scroll-mt-28 bg-paper pb-16 sm:pb-24">
        <div className="shell">
          <Reveal className="mb-8">
            <p className="eyebrow text-ember-ink">İstanbul ilçeleri</p>
            <h2 id="ilceler-baslik" className="display-3 mt-5">
              İlçenizi bulun.
            </h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-steel">
              Bulunduğunuz ilçeyi seçin; tasarım ve uygulama sürecini inceleyin. Diğer bölgelerde hizmet uygunluğunu adres, proje kapsamı ve takvim üzerinden birlikte değerlendirelim.
            </p>
          </Reveal>
          <RegionsGrid items={items} />
          <p className="mt-8 max-w-3xl text-[14px] leading-relaxed text-stone">
            İlçe sayfaları o ilçede bir şubemiz bulunduğu anlamına gelmez. Tüm projeler Tuzla fabrika showroomumuz ve kendi montaj ekibimizle yürütülür; hizmet kapsamı ve takvim uygunluğu ön görüşmede netleştirilir.
          </p>
        </div>
      </section>

      <section aria-labelledby="bolge-yolculuk" className="bg-white py-16 sm:py-24">
        <div className="shell">
          <Reveal>
            <p className="eyebrow text-ember-ink">Projenizin yolculuğu</p>
            <h2 id="bolge-yolculuk" className="display-3 mt-5">
              İlk fikirden yaşam alanınıza.
            </h2>
          </Reveal>
          <Stagger as="ol" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" gap={0.12}>
            {REGION_JOURNEY.map((j, i) => (
              <StaggerItem key={j.title} className="group rounded-2xl border border-linen bg-paper p-6 transition-colors duration-500 hover:border-ember/40 hover:bg-white sm:p-7">
                <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full border border-ember/30 bg-white font-display text-sm font-semibold text-ember-ink tabular-nums transition-colors duration-500 group-hover:bg-ember group-hover:text-ink">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-ink">{j.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-steel">{j.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section aria-labelledby="bolge-sss" className="bg-paper py-16 sm:py-24">
        <div className="shell grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow text-ember-ink">Başlamadan önce</p>
            <h2 id="bolge-sss" className="display-3 mt-5">
              Merak ettikleriniz.
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-8" delay={0.1}>
            <FaqList items={REGION_FAQS} />
          </Reveal>
        </div>
      </section>

      <ShowroomBlock />
    </>
  );
}
