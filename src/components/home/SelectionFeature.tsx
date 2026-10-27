import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Motion";

/**
 * Footer üstündeki kompakt koyu bant: "Size Uygun Şömineyi Birlikte Bulalım" — başlık, kısa metin, şömine görseli ve
 * seçim rehberini açan düğme (site genelindeki [data-guide-open] penceresi).
 */
export function SelectionFeature({ image, imageAlt }: { image: string | null; imageAlt?: string | null }) {
  return (
    <section aria-labelledby="home-selection" className="dark-surface bg-smoke py-10 text-white lg:py-12">
      <div className="shell grid items-center gap-8 lg:grid-cols-[634fr_576fr] lg:gap-14">
        <Reveal>
          <p className="studio-eyebrow text-amber">Projenizin ilk adımı</p>
          <h2 id="home-selection" className="mt-4 font-display text-[1.9rem] leading-[1.1] font-normal tracking-[-0.035em] text-balance sm:text-[2.3rem] lg:text-[2.7rem]">
            Size Uygun Şömineyi Birlikte Bulalım.
          </h2>
          <p className="mt-4 max-w-[480px] text-[14px] leading-relaxed text-white/70">
            Mekânınızı ve beklentilerinizi tanıyalım; model, malzeme ve yerleşim seçeneklerini birlikte değerlendirelim.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="button"
              data-guide-open=""
              aria-haspopup="dialog"
              className="group relative inline-flex min-h-12 cursor-pointer items-center gap-2 overflow-hidden rounded-full border border-glow px-6 text-[14px] font-medium text-white"
            >
              <span aria-hidden="true" className="absolute inset-0 origin-left scale-x-0 bg-glow transition-transform duration-500 ease-(--ease-premium) group-hover:scale-x-100" />
              <span className="relative transition-colors duration-500 group-hover:text-ink">Şöminenizi Seçmeye Başlayın</span>
              <ArrowUpRight aria-hidden="true" className="relative h-4 w-4 transition-[transform,color] duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" />
            </button>
            <span className="text-[13px] text-white/55">Üç kısa soruyla başlayın.</span>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="relative aspect-[576/365] overflow-hidden rounded-2xl bg-graphite">
            {image ? <Image src={image} alt={imageAlt || "Modern şömine uygulaması"} fill sizes="(min-width: 1024px) 576px, 100vw" className="object-cover" /> : <span className="ember-placeholder-dark absolute inset-0" />}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
