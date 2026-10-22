"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { ArrowUpRight, Flame, Gauge, Ruler, Search, Weight, Wind, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";

export type GridModel = { href: string; code: string; series: string | null; size: string; name: string; values: { label: string; text: string }[]; hasData: boolean };

const EASE = [0.16, 1, 0.3, 1] as const;
const ALL = "Tüm seriler";

const ICONS: [RegExp, LucideIcon][] = [[/güç|kw/i, Flame], [/verim/i, Gauge], [/ağırlık|kg/i, Weight], [/baca/i, Wind]];
const iconOf = (label: string) => ICONS.find(([r]) => r.test(label))?.[1] ?? Ruler;

/**
 * Aile sayfasındaki model listesi: seri filtresi + model/ölçü/kod araması. Kart: ürünün kapak görseli üzerinde seri,
 * kod ve ölçü; altında simgeli kısa değerler. Karta tıklayınca modelin teknik sayfası açılır.
 * Tüm kartlar SSR HTML'inde de vardır (filtre yalnızca istemcide gizler).
 */
export function ModelGrid({ models, note, image, imageAlt }: { models: GridModel[]; note?: string; image?: string | null; imageAlt?: string | null }) {
  const series = useMemo(() => [...new Set(models.map((m) => m.series).filter(Boolean))] as string[], [models]);
  const [active, setActive] = useState(ALL);
  const [q, setQ] = useState("");
  const id = useId();
  const needle = q.trim().toLocaleLowerCase("tr").replace(/\s*[x×]\s*/g, "×");
  const shown = models.filter(
    (m) =>
      (active === ALL || m.series === active) &&
      (!needle || [m.name, m.code, m.size, m.series ?? ""].some((t) => t.toLocaleLowerCase("tr").replace(/\s*[x×]\s*/g, "×").includes(needle))),
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {series.length > 1 ? (
          <div role="radiogroup" aria-label="Seri" className="flex flex-wrap gap-2">
            {[ALL, ...series].map((s) => {
              const on = s === active;
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setActive(s)}
                  className={`relative isolate inline-flex min-h-11 items-center rounded-full border px-5 text-[14px] font-semibold transition-colors duration-300 ${on ? "border-ink text-white" : "border-sand bg-white text-ink hover:border-ink"}`}
                >
                  {on ? <motion.span layoutId={`${id}-pill`} transition={{ type: "spring", stiffness: 420, damping: 34 }} aria-hidden="true" className="absolute inset-0 -z-10 rounded-full bg-ink" /> : null}
                  {s}
                </button>
              );
            })}
          </div>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-4">
          <label className="relative block">
            <span className="sr-only">Model veya ölçü ara</span>
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-stone" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Model veya ölçü ara"
              className="block min-h-11 w-56 rounded-full border border-sand bg-white pr-4 pl-10 text-[15px] text-ink outline-none placeholder:text-stone/70 focus:border-ink sm:w-64"
            />
          </label>
          <p aria-live="polite" className="text-[13px] font-semibold whitespace-nowrap text-stone tabular-nums">
            {shown.length} seçenek
          </p>
        </div>
      </div>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((m, i) => (
            <motion.li key={m.href} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.4, ease: EASE }}>
              <Link
                href={m.href}
                className="group relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-linen bg-white transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-1 hover:border-ember/40 hover:shadow-[0_30px_60px_-34px_rgb(12_12_13/0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
              >
                {/* Ürün kapak görseli: seri, kod ve ölçü görselin üzerinde */}
                <span className="relative block aspect-[4/3] overflow-hidden bg-linen">
                  {image ? (
                    <Image src={image} alt={imageAlt ? `${imageAlt} — ${m.name}` : m.name} fill sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw" priority={i < 2} className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]" />
                  ) : (
                    <span aria-hidden="true" className="ember-placeholder absolute inset-0" />
                  )}
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/10" />
                  <span className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
                    {m.series ? <span className="rounded-full bg-ember px-3 py-1 text-[11px] font-semibold tracking-[0.06em] text-ink shadow-sm">{m.series}</span> : <span />}
                    <span className="rounded-full bg-white/15 px-2.5 py-1 font-mono text-[10.5px] tracking-[0.06em] text-white backdrop-blur-md">{m.code}</span>
                  </span>
                  <span className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-white">
                    <span>
                      <span className="block text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase">Ölçü</span>
                      <span className="block font-display text-[2.4rem] leading-none font-semibold tracking-[-0.03em]">{m.size}</span>
                    </span>
                    <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-colors duration-500 group-hover:bg-ember group-hover:text-ink">
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </span>
                </span>

                <span className="flex flex-1 flex-col p-5">
                  <span className="font-display text-[17px] leading-snug font-semibold text-ink">{m.name}</span>
                  {m.values.length ? (
                    <dl className="mt-4 flex flex-wrap gap-2">
                      {m.values.map((v) => {
                        const Icon = iconOf(v.label);
                        return (
                          <div key={v.label} className="inline-flex items-center gap-1.5 rounded-full border border-linen bg-paper px-3 py-1.5 transition-colors duration-300 group-hover:border-ember/30">
                            <Icon aria-hidden="true" className="h-3.5 w-3.5 text-ember-ink" />
                            <dt className="sr-only">{v.label}</dt>
                            <dd className="text-[13px] font-semibold text-ink tabular-nums">{/^[d.,s]+$/.test(v.text) ? `${v.label} ${v.text}` : v.text}</dd>
                          </div>
                        );
                      })}
                    </dl>
                  ) : (
                    <p className="mt-4 text-[13px] leading-relaxed text-stone">Teknik bilgiler tamamlanacak.</p>
                  )}
                  <span className="mt-auto pt-5 text-[13px] font-semibold text-ember-ink underline-offset-4 group-hover:underline">Modeli incele</span>
                </span>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {!shown.length ? <p className="mt-8 text-[15px] text-steel">Aramanızla eşleşen model yok. Farklı bir ölçü veya seri deneyin.</p> : null}
      {note ? <p className="mt-6 max-w-3xl text-[13px] leading-relaxed text-stone">{note}</p> : null}
    </MotionConfig>
  );
}
