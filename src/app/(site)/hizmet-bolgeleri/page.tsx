import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion/Motion";
import { JourneyLine } from "@/components/areas/JourneyLine";
import { RegionFinder } from "@/components/areas/RegionFinder";
import { FaqList } from "@/components/site/FaqList";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { ShowroomBlock } from "@/components/site/ShowroomBlock";
import { TrustPoints } from "@/components/site/TrustPoints";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { PRIORITY_DISTRICTS, REGION_FAQS, REGION_JOURNEY } from "@/content/regions";
import { PROVINCES } from "@/content/service-areas";
import { PROVINCE_NAMES } from "@/content/service-areas/names";
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

/**
 * Hizmet Bölgeleri: 17 il ve 271 ilçe. Bölge bulucu (anlık arama + il sekmeleri), il kartları, proje yolculuğu
 * (kaydırdıkça dolan çizgi), SSS ve showroom. Fabrika showroom Tuzla'dadır; ilçe sayfaları şube iddiası taşımaz.
 */
/** İl sayfası görseli (kartlarda küçük önizleme). */
const provinceImage = (slug: string) => PROVINCES.find((p) => p.slug === slug)?.page.image?.url ?? null;

export default function RegionsPage() {
  const districtCount = PROVINCE_NAMES.reduce((n, p) => n + p.districts.length, 0);
  const description = STATIC_PAGES["hizmet-bolgeleri"].defaults.description;
  const stats = [
    { value: PROVINCE_NAMES.length, label: "il" },
    { value: districtCount, label: "ilçe sayfası" },
    { value: 1, label: "fabrika showroom · Tuzla" },
  ];

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path: routes.regions, name: "Hizmet Bölgeleri", description, hasBreadcrumb: true }),
          breadcrumbNode(routes.regions, CRUMBS),
          serviceNode({ path: routes.regions, name: "Şömine tasarımı, üretimi ve montajı", description, serviceType: "Şömine tasarımı ve montajı", areaServed: PROVINCE_NAMES.map((p) => p.name) }),
          itemListNode(routes.regions, PROVINCE_NAMES.map((p) => ({ name: `${p.name} Şömine`, path: routes.province(p.slug) }))),
          faqNode(routes.regions, REGION_FAQS),
        )}
      />
      <PageHero
        crumbs={CRUMBS}
        eyebrow="Hizmet bölgeleri"
        title="Tuzla’daki üretimimizden projenize."
        intro="İstanbul başta olmak üzere Marmara’daki 10 il, Ankara, İzmir, Muğla, Aydın, Antalya, Bolu ve Düzce’deki şömine projelerini kendi üretimimiz ve kendi montaj ekibimizle değerlendiriyoruz. Kapsam ve takvim, proje konumu ve ekip uygunluğuyla netleşir."
      >
        <div className="flex flex-wrap items-center gap-3">
          <ArrowFillButton href="#bolge-bul" tone="ink">
            Bölgenizi bulun
          </ArrowFillButton>
          <ArrowFillButton href={routes.quote} tone="ember">
            Projenizi paylaşın
          </ArrowFillButton>
        </div>
        <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-sand pt-6">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse">
              <dt className="mt-1 text-[11px] leading-snug font-semibold tracking-[0.14em] text-stone uppercase">{s.label}</dt>
              <dd className="font-display text-4xl leading-none font-semibold tracking-[-0.03em] text-ink sm:text-5xl">
                <CountUp value={s.value} />
                <span className="text-ember">.</span>
              </dd>
            </div>
          ))}
        </dl>
      </PageHero>

      <section aria-label="Tasarım, üretim ve montaj" className="bg-paper pb-10">
        <div className="shell">
          <TrustPoints />
        </div>
      </section>

      <section id="bolge-bul" aria-labelledby="bolge-bul-baslik" className="scroll-mt-28 bg-paper pb-16 sm:pb-24">
        <div className="shell">
          <Reveal className="mb-10 grid gap-4 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="eyebrow text-ember-ink">Bölge bulucu</p>
              <h2 id="bolge-bul-baslik" className="display-3 mt-5">
                İlinizi ve ilçenizi seçin.
              </h2>
            </div>
            <p className="text-[16px] leading-relaxed text-steel lg:col-span-5">İlçenizi yazın ya da ili seçin; o bölgedeki tasarım ve uygulama sürecini inceleyin.</p>
          </Reveal>
          <RegionFinder provinces={PROVINCE_NAMES} priority={PRIORITY_DISTRICTS.map((d) => d.slug)} />
        </div>
      </section>

      <section aria-labelledby="iller" className="bg-white py-16 sm:py-24">
        <div className="shell">
          <Reveal>
            <p className="eyebrow text-ember-ink">{PROVINCE_NAMES.length} il</p>
            <h2 id="iller" className="display-3 mt-5">
              Marmara’dan Ege’ye, Akdeniz’e ve Ankara’ya.
            </h2>
          </Reveal>
          <Stagger as="ol" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" gap={0.06}>
            {PROVINCE_NAMES.map((p, i) => (
              <StaggerItem key={p.slug} className="h-full">
                <Link
                  href={routes.province(p.slug)}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-linen bg-paper p-6 transition-[border-color,box-shadow,background-color] duration-500 hover:border-ember/40 hover:bg-white hover:shadow-[0_24px_48px_-28px_rgb(12_12_13/0.35)]"
                >
                  <span aria-hidden="true" className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-ember/0 blur-3xl transition-colors duration-700 group-hover:bg-ember/20" />
                  {provinceImage(p.slug) ? (
                    <span className="relative -mx-6 -mt-6 mb-6 block aspect-[16/9] overflow-hidden">
                      <Image src={provinceImage(p.slug)!} alt="" fill sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 92vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
                    </span>
                  ) : null}
                  <span className="relative flex items-start justify-between gap-4">
                    <span className="font-display text-sm font-semibold text-stone tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink transition-colors duration-500 group-hover:bg-ember">
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                    </span>
                  </span>
                  <span className="relative mt-6 font-display text-3xl leading-none font-semibold tracking-[-0.02em] text-ink">{p.name}</span>
                  <span className="relative mt-2 text-[13px] font-semibold tracking-[0.12em] text-ember-ink uppercase tabular-nums">{p.districts.length} ilçe</span>
                  <span className="relative mt-3 line-clamp-2 text-[14px] leading-relaxed text-steel">{p.focus}</span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section aria-labelledby="bolge-yolculuk" className="border-y border-sand bg-paper py-16 sm:py-24">
        <div className="shell">
          <Reveal className="mb-12">
            <p className="eyebrow text-ember-ink">Projenizin yolculuğu</p>
            <h2 id="bolge-yolculuk" className="display-3 mt-5">
              İlk fikirden yaşam alanınıza.
            </h2>
          </Reveal>
          <JourneyLine steps={REGION_JOURNEY} />
        </div>
      </section>

      <section aria-labelledby="bolge-sss" className="bg-white py-16 sm:py-24">
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
