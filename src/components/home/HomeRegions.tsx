import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Motion";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { PROVINCE_NAMES } from "@/content/service-areas/names";
import { routes } from "@/lib/catalog";
import { StudioEyebrow } from "./studio";

/** Mimari görsel: Tuzla bölge sayfasının kapak görseli (üretim merkezimizin bulunduğu ilçe). */
const IMAGE = "/uploads/2026/10/bifire-bolge-rev-037-istanbul-tuzla-somine-062602.webp";

/** Alt şerit: bölge grupları (il sayfası varsa ona, yoksa hizmet bölgeleri sayfasına). */
const AREAS = [
  { label: "İstanbul", province: "istanbul" },
  { label: "Marmara" },
  { label: "Ege" },
  { label: "Akdeniz" },
  { label: "Ankara", province: "ankara" },
  { label: "Bolu ve Düzce" },
];

/**
 * Ana sayfa hizmet bölgeleri — mimari kompozisyon: solda başlık + davet, sağda geniş şömine görseli,
 * altta ince çizgiyle ayrılmış bölge şeridi. Dağıtım ağı çağrıştıran çizgili harita kaldırıldı.
 */
export function HomeRegions() {
  const has = (slug?: string) => slug && PROVINCE_NAMES.some((p) => p.slug === slug);
  return (
    <section aria-labelledby="home-regions" className="section-pad relative overflow-hidden bg-paper">
      <div className="shell">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-14">
          <Reveal>
            <StudioEyebrow>Hizmet bölgelerimiz</StudioEyebrow>
            <h2 id="home-regions" className="studio-h2 mt-5 text-balance text-ink">
              Mekânınıza Özel Şömine, Her Ayrıntısında Bifire.
            </h2>
            <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-steel">
              Şöminenizi yaşam alanınızın mimarisi, kullanım beklentileriniz ve malzeme tercihleriniz doğrultusunda birlikte şekillendiriyoruz.
            </p>
            <p className="mt-5 max-w-[520px] text-[17px] leading-relaxed text-steel">Hizmet bölgelerimizi keşfedin, projenizin ilk adımını birlikte atalım.</p>
            <div className="mt-8">
              <ArrowFillButton href={routes.regions} tone="ember" size="lg">
                Hizmet Bölgelerini Keşfedin
              </ArrowFillButton>
            </div>
          </Reveal>
          <Reveal delay={0.1} y={24}>
            <div className="zoom-media group relative aspect-[4/3] overflow-hidden rounded-2xl bg-bone lg:aspect-[874/716]">
              <Image src={IMAGE} alt="Mimari bir yaşam alanında traverten kaplamalı Bifire şömine" fill sizes="(min-width: 1024px) 700px, 100vw" className="object-cover" />
            </div>
          </Reveal>
        </div>

        <nav aria-label="Hizmet bölgeleri" className="mt-12 border-t border-sand pt-6 lg:mt-14">
          <Stagger as="ul" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-6" gap={0.06}>
            {AREAS.map((a, i) => (
              <Fragment key={a.label}>
                {i > 0 ? (
                  <li aria-hidden="true" className="text-ember">
                    ·
                  </li>
                ) : null}
                <StaggerItem>
                  <Link
                    href={has(a.province) ? routes.province(a.province!) : routes.regions}
                    className="link-underline inline-flex min-h-11 items-center font-display text-[17px] tracking-[0.01em] text-ink transition-colors hover:text-ember-ink sm:text-[19px]"
                  >
                    {a.label}
                  </Link>
                </StaggerItem>
              </Fragment>
            ))}
          </Stagger>
        </nav>
      </div>
    </section>
  );
}
