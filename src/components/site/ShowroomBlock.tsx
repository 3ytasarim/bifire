import Image from "next/image";
import { MapPin } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Motion";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { SHOWROOM } from "@/content/company";
import { getSiteSettings, showroomImageOf } from "@/lib/settings";

/**
 * Tuzla fabrika showroom çağrısı (ana sayfa, ürün, hizmet, rehber ve bölge sayfalarında ortak).
 * Görsel kartın tamamını kaplar (her oranda kırpılarak oturur, zoom/kayma yok); üstünde
 * cam efektli içerik paneli, nabız animasyonlu konum rozeti ve sırayla beliren adım kartları.
 * Görsel admin ayarlarından gelir (showroom görseli, yoksa manifesto görseli); hiçbiri yoksa sıcak yer tutucu.
 */
export async function ShowroomBlock({ title = SHOWROOM.title, intro = SHOWROOM.intro }: { title?: string; intro?: string }) {
  const { url: image, alt: imageAlt } = showroomImageOf(await getSiteSettings());
  return (
    <section aria-labelledby="showroom-cta" className="bg-paper py-16 sm:py-24">
      <div className="shell">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-ink text-white">
          {/* Görsel sağda; sola doğru koyu zemine erir — panel şömineyi örtmez. Mobilde üstte tam genişlik. */}
          <div className="absolute inset-x-0 top-0 -z-10 h-72 [mask-image:linear-gradient(to_bottom,black_55%,transparent)] sm:h-80 lg:inset-y-0 lg:right-0 lg:left-auto lg:h-auto lg:w-[64%] lg:[mask-image:linear-gradient(to_right,transparent,black_38%)]">
            {image ? (
              <Image src={image} alt={imageAlt || ""} fill sizes="(min-width: 1280px) 1280px, 100vw" className="object-cover" />
            ) : (
              <span aria-hidden="true" className="ember-placeholder-dark absolute inset-0" />
            )}
          </div>

          <Reveal className="absolute top-5 right-5 hidden sm:block" delay={0.3}>
            <p className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-ink/60 py-2 pr-4 pl-2.5 text-[12px] font-semibold tracking-[0.12em] uppercase backdrop-blur-md">
              <span aria-hidden="true" className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-ember opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ember" />
              </span>
              Tuzla · İstanbul
            </p>
          </Reveal>

          <div className="grid min-h-[36rem] items-end p-5 pt-56 sm:p-8 sm:pt-64 lg:grid-cols-12 lg:items-center lg:p-12">
            <Reveal className="lg:col-span-6 xl:col-span-5" y={24}>
              <div className="rounded-[1.5rem] border border-white/15 bg-white/[0.07] p-6 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.8)] backdrop-blur-xl sm:p-9">
                <p className="eyebrow inline-flex items-center gap-2 text-ember">
                  <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                  {SHOWROOM.eyebrow}
                </p>
                <h2 id="showroom-cta" className="display-3 mt-5 text-balance text-white">
                  {title}
                </h2>
                <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-white/75">{intro}</p>
                <Stagger as="ol" className="mt-7 divide-y divide-white/10 border-y border-white/10" gap={0.12}>
                  {SHOWROOM.steps.map((s, i) => (
                    <StaggerItem key={s.title} className="group relative flex gap-3 py-3.5">
                      <span aria-hidden="true" className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-ember/60 text-[11px] font-bold text-ember tabular-nums transition-colors duration-300 group-hover:bg-ember group-hover:text-white">
                        {i + 1}
                      </span>
                      <span>
                        <span className="block text-[14px] font-semibold text-white">{s.title}</span>
                        <span className="mt-0.5 block text-[13px] leading-relaxed text-white/65">{s.text}</span>
                      </span>
                      <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-ember transition-transform duration-700 ease-(--ease-premium) group-hover:scale-x-100" />
                    </StaggerItem>
                  ))}
                </Stagger>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <ArrowFillButton href="/fabrika-showroom" tone="ember">
                    Showroom ziyaretini planlayın
                  </ArrowFillButton>
                  <span className="inline-flex items-center gap-2 text-[13px] text-white/60 sm:hidden">
                    <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-ember" /> Tuzla · İstanbul
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
