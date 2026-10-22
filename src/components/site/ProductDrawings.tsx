"use client";

import Image from "next/image";
import { useState } from "react";
import { Maximize2, Ruler } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { variantMatches } from "@/lib/variants";
import { Lightbox } from "./Lightbox";
import { useVariantKey } from "./useVariantKey";

export type Drawing = { url: string; alt: string; variant: string | null; width: number | null; height: number | null };

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Ölçü çizimleri: seçili modele uyan çizimler (variant boşsa tümü). "Büyüt" tam ekran açar; mobilde dokunarak
 * yakınlaştırılıp parmakla gezilir. Çizim yoksa ölçülü çizim talebine yönlendiren kart gösterilir.
 */
export function ProductDrawings({ drawings, groups, fallback }: { drawings: Drawing[]; groups: string[]; fallback: string }) {
  const { key, label } = useVariantKey(groups, fallback);
  const [open, setOpen] = useState<number | null>(null);
  const list = drawings.filter((d) => variantMatches(d.variant, key));

  return (
    <MotionConfig reducedMotion="user">
      <div className="mt-12">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">Ölçü çizimleri{label ? ` · ${label}` : ""}</p>
        {list.length ? (
          <>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              <AnimatePresence mode="popLayout" initial={false}>
                {list.map((d, i) => (
                  <motion.li key={d.url} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
                    <button
                      type="button"
                      onClick={() => setOpen(i)}
                      className="group block w-full overflow-hidden rounded-2xl border border-sand bg-white text-left transition-shadow duration-500 hover:shadow-[0_24px_48px_-28px_rgb(12_12_13/0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                    >
                      <span className="relative block aspect-[4/3]">
                        <Image src={d.url} alt={d.alt} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-contain p-4" />
                      </span>
                      <span className="flex min-h-12 items-center justify-between gap-3 border-t border-sand px-4">
                        <span className="line-clamp-1 text-[14px] font-semibold text-ink">{d.alt}</span>
                        <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-ember-ink">
                          Büyüt <Maximize2 aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" />
                        </span>
                      </span>
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <p className="mt-4 text-[13px] leading-relaxed text-stone">Kaplama ve yerleşim gösterimleri uygulama projesi yerine geçmez. Çizim ile tablo arasında farklılık varsa teknik ekibimiz netleştirir.</p>
            <Lightbox images={list} index={open} onIndex={setOpen} onClose={() => setOpen(null)} zoomable light />
          </>
        ) : (
          <a
            href="#teklif"
            className="group mt-4 flex items-center gap-4 rounded-2xl border border-dashed border-sand bg-white p-5 transition-colors duration-300 hover:border-ember sm:p-6"
          >
            <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bone text-ember transition-colors duration-300 group-hover:bg-ember group-hover:text-ink">
              <Ruler className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold text-ink">Ölçülü çizimi sizinle paylaşalım</span>
              <span className="mt-1 block text-[14px] leading-relaxed text-steel">Seçtiğiniz modelin ölçü çizimini, mekânınıza göre yerleşim önerisiyle birlikte iletelim.</span>
            </span>
          </a>
        )}
      </div>
    </MotionConfig>
  );
}
