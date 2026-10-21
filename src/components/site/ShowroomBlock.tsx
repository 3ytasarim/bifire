import Image from "next/image";
import { MapPin } from "lucide-react";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { SHOWROOM } from "@/content/company";
import { getSiteSettings, showroomImageOf } from "@/lib/settings";

/**
 * Tuzla fabrika showroom çağrısı (ana sayfa, ürün, hizmet ve bölge sayfalarında ortak).
 * Görsel admin ayarlarından gelir (showroom görseli, yoksa manifesto görseli); hiçbiri yoksa sıcak yer tutucu.
 */
export async function ShowroomBlock({ title = SHOWROOM.title, intro = SHOWROOM.intro }: { title?: string; intro?: string }) {
  const { url: image, alt: imageAlt } = showroomImageOf(await getSiteSettings());
  return (
    <section aria-labelledby="showroom-cta" className="bg-paper py-16 sm:py-24">
      <div className="shell">
        <div className="grid overflow-hidden rounded-[1.75rem] bg-ink text-white lg:grid-cols-2">
          <div className="relative min-h-72 lg:min-h-full">
            {image ? (
              <Image src={image} alt={imageAlt || ""} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            ) : (
              <span aria-hidden="true" className="ember-placeholder-dark absolute inset-0" />
            )}
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-ink/30" />
          </div>
          <div className="p-8 sm:p-12 lg:p-14">
            <p className="eyebrow inline-flex items-center gap-2 text-ember">
              <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
              {SHOWROOM.eyebrow}
            </p>
            <h2 id="showroom-cta" className="display-3 mt-5 text-balance text-white">
              {title}
            </h2>
            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-white/75">{intro}</p>
            <ol className="mt-8 space-y-4">
              {SHOWROOM.steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span aria-hidden="true" className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/25 text-[12px] font-semibold tabular-nums text-ember">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-semibold text-white">{s.title}</span>
                    <span className="mt-0.5 block text-[14px] leading-relaxed text-white/65">{s.text}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-wrap gap-3">
              <ArrowFillButton href="/fabrika-showroom" tone="ember">
                Showroom ziyaretini planlayın
              </ArrowFillButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
