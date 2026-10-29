import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Motion";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { REGION_GROUPS } from "@/content/region-groups";
import { PROVINCE_NAMES } from "@/content/service-areas/names";
import { routes } from "@/lib/catalog";
import { StudioEyebrow } from "./studio";

/** Mimari görsel: Tuzla bölge sayfasının kapak görseli (üretim merkezimizin bulunduğu ilçe). */
const IMAGE = "/uploads/2026/10/bifire-bolge-rev-037-istanbul-tuzla-somine-062602.webp";

/**
 * Ana sayfa hizmet bölgeleri — mimari kompozisyon: solda başlık + davet, sağda geniş şömine görseli,
 * altta ince çizgiyle ayrılmış bölge şeridi. Dağıtım ağı çağrıştıran çizgili harita kaldırıldı.
 */
export function HomeRegions() {
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

        {/* Bölge şeridi: her bölge kendi sayfasına (İstanbul/Ankara il sayfasına, diğerleri bölge grubu sayfasına) gider. */}
        <nav aria-label="Hizmet bölgeleri" className="mt-12 lg:mt-14">
          <Stagger as="ul" className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-sand bg-sand sm:grid-cols-3 lg:grid-cols-6" gap={0.06}>
            {REGION_GROUPS.map((g) => {
              const provinces = PROVINCE_NAMES.filter((p) => g.provinces.includes(p.slug));
              const districts = provinces.reduce((n, p) => n + p.districts.length, 0);
              return (
                <StaggerItem key={g.slug} className="h-full">
                  <Link
                    href={g.province ? routes.province(g.province) : routes.regionGroup(g.slug)}
                    className="group relative flex h-full min-h-[112px] flex-col justify-between gap-4 overflow-hidden bg-paper p-5 transition-colors duration-500 hover:bg-white"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="font-display text-[19px] leading-tight tracking-[-0.015em] text-ink transition-colors duration-300 group-hover:text-ember-ink">{g.label}</span>
                      <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-ember-ink transition-transform duration-500 ease-(--ease-premium) group-hover:rotate-45" />
                    </span>
                    <span className="text-[12px] tracking-[0.08em] text-stone tabular-nums">
                      {provinces.length > 1 ? `${provinces.length} il · ` : ""}
                      {districts} ilçe
                    </span>
                    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-ember transition-transform duration-700 ease-(--ease-premium) group-hover:scale-x-100" />
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </nav>
      </div>
    </section>
  );
}
