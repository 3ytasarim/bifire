import Image from "next/image";
import { MapPin } from "lucide-react";
import { ParallaxFrame, Reveal } from "@/components/motion/Motion";
import { StudioEyebrow, StudioLink } from "./studio";

/** Varsayılan görsel: Tuzla fabrika showroom (rehber 034 kapağı). Site Ayarları'nda showroom görseli varsa o kullanılır. */
const DEFAULT_IMAGE = "/uploads/2026/10/bifire-rehber-034_tuzla-fabrika-showroomda-somine-projesini-nasil-degerlendiriyoruz-87d2b4.webp";

/** Tuzla fabrika showroom: geniş görsel + iki sütunlu açıklama. */
export function HomeShowroom({ image, imageAlt }: { image?: string | null; imageAlt?: string | null }) {
  return (
    <section aria-labelledby="home-showroom" className="section-pad bg-paper">
      <div className="shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div>
            <StudioEyebrow no="04">Tuzla fabrika showroom</StudioEyebrow>
            <h2 id="home-showroom" className="studio-h2 mt-4 text-ink">
              Kararınızı showroom&apos;da somutlaştıralım.
            </h2>
          </div>
          <StudioLink href="/fabrika-showroom">Ziyaret deneyimini keşfedin</StudioLink>
        </Reveal>
        <Reveal delay={0.06} className="mt-8 lg:mt-10">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-bone sm:aspect-[16/8] lg:aspect-[16/5]">
            <ParallaxFrame className="absolute inset-0">
              <Image src={image || DEFAULT_IMAGE} alt={imageAlt || "Bifire Tuzla fabrika showroom: sergilenen şömine modelleri ve görüşme alanı"} fill sizes="(min-width: 1360px) 1280px, 100vw" className="object-cover" />
            </ParallaxFrame>
            <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-paper/90 px-3.5 py-1.5 text-[12px] font-medium text-ink backdrop-blur-md">
              <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-ember" /> İstanbul, Tuzla
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="mt-6 grid gap-5 border-t border-sand pt-6 lg:mt-8 lg:grid-cols-2 lg:gap-14">
          <h3 className="font-display text-[21px] leading-snug font-normal tracking-[-0.02em] text-ink sm:text-[23px]">
            Modeli, malzemeyi ve üretim yaklaşımını aynı yerde değerlendirin.
          </h3>
          <p className="text-[15px] leading-relaxed text-steel">
            Tuzla&apos;daki fabrika showroomumuzda cam geometrilerini, kaplama alternatiflerini ve yalıtım yaklaşımımızı projeniz üzerinden birlikte ele alalım. Mekân fotoğraflarınız ve varsa planınız görüşmemizin başlangıcı olsun.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
