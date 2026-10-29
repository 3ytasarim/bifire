import Image from "next/image";
import { Reveal } from "@/components/motion/Motion";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { routes } from "@/lib/catalog";
import { StudioEyebrow } from "./studio";

/** Mimari görsel: Tuzla bölge sayfasının kapak görseli (üretim merkezimizin bulunduğu ilçe). */
const IMAGE = "/uploads/2026/10/bifire-bolge-rev-037-istanbul-tuzla-somine-062602.webp";

/**
 * Ana sayfa hizmet bölgeleri — mimari kompozisyon: solda başlık + davet, sağda geniş şömine görseli.
 * İl/bölge listesi yalnız Hizmet Bölgeleri sayfasında (ana sayfa sade).
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

      </div>
    </section>
  );
}
