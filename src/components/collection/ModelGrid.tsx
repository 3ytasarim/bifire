"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { ArrowUpRight, Flame, Gauge, Ruler, Search, Weight, Wind, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";

export type GridModel = { href: string; code: string; series: string | null; size: string; name: string; values: { label: string; text: string }[]; hasData: boolean };

const EASE = [0.16, 1, 0.3, 1] as const;
const ALL = "Tüm seriler";

/** "15 kW", "%83", "255 kg", "70'lik" → sayı (gösterge çubukları için); yoksa null. */
const num = (t: string) => {
  const m = t.replace(/\./g, "").replace(",", ".").match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
};
const ICONS: [RegExp, LucideIcon][] = [[/güç|kw/i, Flame], [/verim/i, Gauge], [/ağırlık|kg/i, Weight], [/baca/i, Wind]];
const iconOf = (label: string) => ICONS.find(([r]) => r.test(label))?.[1] ?? Ruler;

/**
 * Aile sayfasındaki model listesi: seri filtresi + model/ölçü/kod araması. Kart: koyu başlık paneli (seri, kod, ölçü,
 * ailedeki genişlik çubuğu) + simgeli değer kutuları (ailedeki en yüksek değere göre çubuk); karta tıklayınca modelin teknik sayfası açılır.
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

  // Aile içindeki en büyük değerler: kartlardaki çubuklar modelleri birbirine göre gösterir.
  const maxSize = Math.max(0, ...models.map((m) => num(m.size) ?? 0));
  const maxOf: Record<string, number> = {};
  for (const m of models) for (const v of m.values) maxOf[v.label] = Math.max(maxOf[v.label] ?? 0, num(v.text) ?? 0);

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
          {shown.map((m) => {
            const sizeN = num(m.size);
            return (
              <motion.li key={m.href} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.4, ease: EASE }}>
                <Link
                  href={m.href}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-linen bg-gradient-to-b from-white to-paper p-2 transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-1 hover:border-ember/50 hover:shadow-[0_30px_60px_-34px_rgb(224_105_31/0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                >
                  {/* Başlık paneli: seri, kod, ölçü ve aile içindeki genişlik göstergesi */}
                  <span className="relative overflow-hidden rounded-[1.2rem] bg-ink px-5 pt-5 pb-6 text-white">
                    <span aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.45),transparent_65%)] opacity-60 transition-opacity duration-700 group-hover:opacity-100" />
                    <span className="relative flex items-center justify-between gap-3">
                      {m.series ? <span className="rounded-full bg-ember px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-ink">{m.series}</span> : <span />}
                      <span className="font-mono text-[11px] tracking-[0.08em] text-white/55">{m.code}</span>
                    </span>
                    <span className="relative mt-6 flex items-end justify-between gap-3">
                      <span className="font-display text-[2.6rem] leading-none font-semibold tracking-[-0.03em]">{m.size}</span>
                      <Ruler aria-hidden="true" className="mb-1 h-5 w-5 text-white/40 transition-transform duration-500 group-hover:-rotate-12 group-hover:text-ember" />
                    </span>
                    {sizeN && maxSize ? (
                      <span aria-hidden="true" className="relative mt-4 block h-1 overflow-hidden rounded-full bg-white/10">
                        <motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: sizeN / maxSize }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE }} className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-ember/60 to-ember" />
                      </span>
                    ) : null}
                  </span>

                  <span className="flex flex-1 flex-col px-3 pt-4 pb-3">
                    <span className="text-[13px] font-semibold text-steel">{m.name}</span>
                    {m.values.length ? (
                      <dl className="mt-4 grid grid-cols-2 gap-2">
                        {m.values.map((v) => {
                          const Icon = iconOf(v.label);
                          const n = num(v.text);
                          const max = maxOf[v.label];
                          return (
                            <div key={v.label} className="rounded-xl border border-linen bg-white px-3 py-2.5 transition-colors duration-300 group-hover:border-ember/25">
                              <dt className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] text-stone uppercase">
                                <Icon aria-hidden="true" className="h-3.5 w-3.5 text-ember-ink" />
                                {v.label}
                              </dt>
                              <dd className="mt-1 text-[15px] font-semibold text-ink tabular-nums">{v.text}</dd>
                              {n && max ? (
                                <span aria-hidden="true" className="mt-2 block h-[3px] overflow-hidden rounded-full bg-linen">
                                  <motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: n / max }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE, delay: 0.1 }} className="block h-full origin-left rounded-full bg-ember/70" />
                                </span>
                              ) : null}
                            </div>
                          );
                        })}
                      </dl>
                    ) : (
                      <p className="mt-4 rounded-xl border border-dashed border-sand px-3 py-3 text-[13px] leading-relaxed text-stone">Teknik bilgiler tamamlanacak.</p>
                    )}
                    <span className="mt-auto flex items-center justify-between pt-5">
                      <span className="text-[13px] font-semibold text-ink">Modeli incele</span>
                      <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white transition-colors duration-500 group-hover:bg-ember group-hover:text-ink">
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </span>
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      {!shown.length ? <p className="mt-8 text-[15px] text-steel">Aramanızla eşleşen model yok. Farklı bir ölçü veya seri deneyin.</p> : null}
      {note ? <p className="mt-6 max-w-3xl text-[13px] leading-relaxed text-stone">{note}</p> : null}
    </MotionConfig>
  );
}
