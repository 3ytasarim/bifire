"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Motion";
import { StudioEyebrow, StudioLink } from "./studio";

/** Ton önizlemesi: görsele uygulanan filtre (yalnızca fikir vermek için; gerçek malzeme seçimi projede yapılır). */
const TONES = [
  { key: "tas", label: "Açık taş", swatch: "#d9d2c4", filter: "saturate(0.8) brightness(1.08) sepia(0.12)" },
  { key: "antrasit", label: "Antrasit", swatch: "#3a3d38", filter: "grayscale(0.6) brightness(0.86) contrast(1.12)" },
  { key: "sicak", label: "Sıcak tonlar", swatch: "#a77b52", filter: "sepia(0.35) saturate(1.3) hue-rotate(-8deg) brightness(1.02)" },
] as const;

/**
 * Mekânınıza özel tasarım daveti: ton seçiciyle görsel üzerinde anlık önizleme + mekân fotoğrafı başvurusu
 * (site genelindeki [data-design-open] penceresini açar; ayrıntı sayfası bağlantısı da var).
 */
export function DesignInvite({ image, imageAlt }: { image: string | null; imageAlt?: string | null }) {
  const [tone, setTone] = useState<(typeof TONES)[number]["key"]>("tas");
  const active = TONES.find((t) => t.key === tone) ?? TONES[0];
  return (
    <section aria-labelledby="home-design" className="section-pad bg-bone">
      <div className="shell grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal className="lg:order-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sand lg:aspect-[605/520]">
            {image ? (
              <Image
                src={image}
                alt={imageAlt || "Mekâna özel tasarlanmış şömine"}
                fill
                sizes="(min-width: 1024px) 605px, 100vw"
                className="object-cover transition-[filter] duration-700 ease-(--ease-premium)"
                style={{ filter: active.filter }}
              />
            ) : (
              <span className="ember-placeholder absolute inset-0" />
            )}
            <span className="absolute bottom-4 left-4 rounded-full bg-paper/90 px-3.5 py-1.5 text-[12px] font-medium text-ink backdrop-blur-md" aria-live="polite">
              Ton önizlemesi: {active.label}
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.06} className="lg:order-1">
          <StudioEyebrow no="03">Mekânınıza özel tasarım</StudioEyebrow>
          <h2 id="home-design" className="studio-h2 mt-5 max-w-[560px] text-balance text-ink">
            Mekânınızın fotoğrafını paylaşın, şöminenizi birlikte tasarlayalım.
          </h2>
          <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-steel">
            Mekânınız ve tercihleriniz doğrultusunda hazırlayacağımız görsel yerleşim önerisiyle şöminenizin evinizde oluşturacağı etkiyi değerlendirin.
          </p>
          <div className="mt-8" role="group" aria-label="Ton önizlemesi">
            <p className="studio-eyebrow text-steel">Ton seçin</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  aria-pressed={tone === t.key}
                  onClick={() => setTone(t.key)}
                  className={`inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-full border px-4 text-[13px] font-medium transition-colors duration-300 ${
                    tone === t.key ? "border-ink bg-ink text-white" : "border-sand bg-white text-ink hover:border-ink"
                  }`}
                >
                  <span aria-hidden="true" className="h-4 w-4 rounded-full ring-1 ring-black/10" style={{ background: t.swatch }} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
            <button
              type="button"
              data-design-open=""
              aria-haspopup="dialog"
              className="group inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border border-ember bg-transparent px-6 text-[14px] font-medium text-ink transition-colors duration-300 hover:bg-ember hover:text-white"
            >
              Mekânım için başlayalım
              <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
            <StudioLink href="/mekaniniza-ozel-tasarim">Süreci inceleyin</StudioLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
