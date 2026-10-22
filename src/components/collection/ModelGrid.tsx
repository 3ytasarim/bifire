"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";

export type GridModel = { href: string; code: string; series: string | null; size: string; name: string; values: { label: string; text: string }[]; hasData: boolean };

const EASE = [0.16, 1, 0.3, 1] as const;
const ALL = "Tüm seriler";

/**
 * Aile sayfasındaki model listesi: seri filtresi + model/ölçü/kod araması. Kartlar görselsiz ve tipografik —
 * ölçü ve öne çıkan değerler doğrudan okunur; karta tıklayınca modelin teknik sayfası açılır.
 * Tüm kartlar SSR HTML'inde de vardır (filtre yalnızca istemcide gizler).
 */
export function ModelGrid({ models, note }: { models: GridModel[]; note?: string }) {
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

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((m) => (
            <motion.li key={m.href} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.35, ease: EASE }}>
              <Link
                href={m.href}
                className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-linen bg-white p-6 transition-[border-color,box-shadow] duration-500 hover:border-ember/40 hover:shadow-[0_24px_48px_-28px_rgb(12_12_13/0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
              >
                <span aria-hidden="true" className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-ember/0 blur-3xl transition-colors duration-700 group-hover:bg-ember/15" />
                <span className="relative text-[11px] font-semibold tracking-[0.16em] text-stone uppercase">
                  {m.series ? `${m.series} · ` : ""}
                  {m.code}
                </span>
                <span className="relative mt-4 font-display text-4xl leading-none font-semibold tracking-[-0.03em] text-ink">{m.size}</span>
                <span className="relative mt-2 text-[14px] font-semibold text-steel">{m.name}</span>
                {m.values.length ? (
                  <dl className="relative mt-6 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-sand pt-4">
                    {m.values.map((v) => (
                      <div key={v.label} className="flex flex-col-reverse">
                        <dt className="text-[10px] font-semibold tracking-[0.1em] text-stone uppercase">{v.label}</dt>
                        <dd className="text-[15px] font-semibold text-ink tabular-nums">{v.text}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="relative mt-6 border-t border-sand pt-4 text-[13px] leading-relaxed text-stone">Teknik bilgiler tamamlanacak.</p>
                )}
                <span className="relative mt-auto inline-flex items-center gap-1.5 pt-6 text-[13px] font-semibold text-ember-ink">
                  Modeli incele <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
