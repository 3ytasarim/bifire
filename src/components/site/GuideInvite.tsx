import Link from "next/link";
import { ArrowUpRight, Compass, MapPin } from "lucide-react";
import { Reveal } from "@/components/motion/Motion";
import { routes } from "@/lib/catalog";

/**
 * Kategori, hizmet ve ürün metinlerinin sonunda iki yönlendirme: adım adım seçim rehberi ("Size Uygun Şömineyi
 * Birlikte Bulalım" — site genelindeki [data-guide-open] penceresini açar) ve Tuzla fabrika showroom daveti.
 */
export function GuideInvite({ context }: { context?: string }) {
  return (
    <section aria-label="Seçim rehberi ve showroom daveti" className="bg-paper py-14 sm:py-20">
      <div className="shell grid gap-4 md:grid-cols-2">
        <Reveal>
          <button
            type="button"
            data-guide-open=""
            aria-haspopup="dialog"
            className="group relative flex h-full w-full flex-col justify-between gap-8 overflow-hidden rounded-[1.75rem] bg-ink p-7 text-left text-white transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgb(224_105_31/0.6)] sm:p-9"
          >
            <span aria-hidden="true" className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.45),transparent_65%)] transition-transform duration-700 group-hover:scale-110" />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-ember text-ink">
              <Compass aria-hidden="true" className="h-5 w-5 transition-transform duration-700 group-hover:rotate-45" />
            </span>
            <span className="relative">
              <span className="block font-display text-2xl leading-snug font-semibold text-balance sm:text-3xl">Size uygun şömineyi birlikte bulalım</span>
              <span className="mt-2 block text-[15px] leading-relaxed text-white/70">
                Birkaç kısa soruyla mekânınıza ve kullanımınıza uygun yönü belirleyelim{context ? ` — ${context}` : ""}.
              </span>
              <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-ember">
                Rehberi başlat <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </span>
          </button>
        </Reveal>
        <Reveal delay={0.08}>
          <Link
            href={routes.showroom}
            className="group relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-[1.75rem] border border-linen bg-white p-7 transition-[border-color,box-shadow] duration-500 hover:border-ember/50 hover:shadow-[0_30px_60px_-34px_rgb(12_12_13/0.35)] sm:p-9"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ember/10 text-ember-ink">
              <MapPin aria-hidden="true" className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-display text-2xl leading-snug font-semibold text-balance text-ink sm:text-3xl">Tuzla fabrika showroomunda görüşelim</span>
              <span className="mt-2 block text-[15px] leading-relaxed text-steel">Malzemeleri ve örnekleri yerinde inceleyin; görmek istediğiniz modeli randevu öncesinde teyit edelim.</span>
              <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-ember-ink">
                Showroom ziyaretinizi planlayın <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
