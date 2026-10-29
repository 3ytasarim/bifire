import Image from "next/image";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { Reveal } from "@/components/motion/Motion";
import { LoopVideo } from "@/components/ui/loop-video";

/**
 * Footer üstündeki kompakt koyu bant: "Size Uygun Şömineyi Birlikte Bulalım" — başlık, kısa metin, şömine görseli ve
 * seçim rehberini açan düğme (site genelindeki [data-guide-open] penceresi).
 */
export function SelectionFeature({ image, imageAlt, video }: { image: string | null; imageAlt?: string | null; video?: string | null }) {
  return (
    <section aria-labelledby="home-selection" className="section-pad bg-bone text-ink">
      <div className="shell grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14">
        <Reveal>
          <p className="studio-eyebrow text-ember-ink">Projenizin ilk adımı</p>
          <h2 id="home-selection" className="studio-h2 mt-4 max-w-[560px] text-balance">
            Size Uygun Şömineyi Birlikte Bulalım.
          </h2>
          <p className="mt-4 max-w-[480px] text-[15px] leading-relaxed text-steel">
            Mekânınızı ve beklentilerinizi tanıyalım; model, malzeme ve yerleşim seçeneklerini birlikte değerlendirelim.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <ArrowFillButton tone="ember" size="lg" data-guide-open="" aria-haspopup="dialog">
              Şöminenizi Seçmeye Başlayın
            </ArrowFillButton>
            <span className="text-[13px] text-stone">Üç kısa soruyla başlayın.</span>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          {/* Yatay çerçeve: dikey (9:16) video kırpılmadan ortada, arkasında aynı videonun bulanık kopyası zemini doldurur. */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-ink lg:aspect-[16/9]">
            {image ? <Image src={image} alt={imageAlt || "Modern şömine uygulaması"} fill sizes="(min-width: 1024px) 640px, 100vw" className={video ? "scale-110 object-cover opacity-60 blur-2xl" : "object-cover"} /> : <span className="ember-placeholder-dark absolute inset-0" />}
            {video ? (
              <>
                <div aria-hidden="true" className="absolute inset-0 scale-110 opacity-55 blur-2xl">
                  <LoopVideo src={video} />
                </div>
                <LoopVideo src={video} fit="contain" />
              </>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
