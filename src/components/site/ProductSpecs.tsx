"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";
import { animate, AnimatePresence, motion, MotionConfig, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { selectionStore } from "@/lib/selection-store";

export type VariantRow = { label: string; unit: string | null; values: Record<string, string> };
export type SpecRow = { label: string; value: string; unit?: string | null };

const EASE = [0.16, 1, 0.3, 1] as const;

/** "%" birimi önde ("%83"), diğerleri sonda ("15 kW"). */
function formatValue(value: string, unit: string | null | undefined) {
  if (!unit) return value;
  return unit === "%" ? `%${value}` : `${value} ${unit}`;
}

function useCurrentVariant(group: string, fallback: string) {
  const picked = useSyncExternalStore(selectionStore.subscribe, selectionStore.getPicked, selectionStore.getPickedServer);
  return { variant: picked[group] ?? fallback, picked };
}

/** Değişen sayıyı yumuşakça sayarak gösterir (MotionValue: React yeniden çizimi olmadan); sayı değilse doğrudan yazar. */
function AnimatedNumber({ value }: { value: string }) {
  const target = Number(value.replace(",", "."));
  return Number.isFinite(target) ? <NumberTween target={target} /> : <>{value}</>;
}

function NumberTween({ target }: { target: number }) {
  const reduced = useReducedMotion();
  const mv = useMotionValue(target);
  const text = useTransform(mv, (v) => (Number.isInteger(target) ? String(Math.round(v)) : v.toFixed(1)));
  useEffect(() => {
    const controls = animate(mv, target, { duration: reduced ? 0 : 0.6, ease: EASE });
    return () => controls.stop();
  }, [mv, target, reduced]);
  return <motion.span>{text}</motion.span>;
}

/** Hero'daki seçime bağlı öne çıkan değerler (ör. Güç / Verim / Ağırlık) — ölçü değişince sayılar akar. */
export function VariantHighlights({ group, fallback, rows }: { group: string; fallback: string; rows: VariantRow[] }) {
  const { variant, picked } = useCurrentVariant(group, fallback);
  const pickedText = Object.values(picked).filter(Boolean).join(" · ") || fallback;
  const items = rows.slice(0, 4);
  if (!items.length) return null;
  return (
    <div className="mt-8 border-y border-sand py-5">
      <p aria-live="polite" className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">
        <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />
        Seçilen model · {pickedText}
      </p>
      <dl className={`mt-4 grid gap-x-4 gap-y-5 ${items.length >= 4 ? "grid-cols-2 sm:grid-cols-4 sm:gap-x-3" : "grid-cols-3"}`}>
        {items.map((r) => {
          const v = r.values[variant];
          return (
            <div key={r.label} className="flex min-w-0 flex-col-reverse justify-end">
              <dt className="mt-1.5 text-[10px] leading-snug font-semibold tracking-[0.1em] text-stone uppercase">{r.label}</dt>
              <dd className="font-display text-[1.6rem] leading-none font-semibold tracking-[-0.03em] whitespace-nowrap text-ink tabular-nums xl:text-[1.75rem]">
                {v ? (
                  <>
                    {r.unit === "%" ? <span className="text-ember">%</span> : null}
                    <AnimatedNumber value={v} />
                    {r.unit && r.unit !== "%" ? <span className="ml-0.5 text-xs font-semibold tracking-normal text-ember">{r.unit}</span> : null}
                  </>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

/**
 * Teknik özellikler tablosu: seçili ölçünün değerleri + tüm ölçüler için geçerli satırlar; "Tüm ölçüleri
 * karşılaştır" ile ölçü × özellik tablosu açılır. Tüm değerler SSR HTML'inde de bulunur (karşılaştırma tablosu
 * gizli olsa bile DOM'da), arama motorları ölçülerin hepsini okuyabilir.
 */
export function ProductSpecs({
  group,
  variants,
  rows,
  common,
}: {
  group: string | null;
  variants: string[];
  rows: VariantRow[];
  common: [string, SpecRow[]][];
}) {
  const fallback = variants[0] ?? "";
  const { variant, picked } = useCurrentVariant(group ?? "", fallback);
  const [compare, setCompare] = useState(false);
  const pickedText = Object.values(picked).filter(Boolean).join(" · ") || fallback;

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-10">
        {group && rows.length ? (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">Seçilen model · {pickedText}</p>
              <button
                type="button"
                aria-expanded={compare}
                aria-controls="olcu-karsilastirma"
                onClick={() => setCompare((v) => !v)}
                className="inline-flex min-h-10 items-center gap-1.5 text-[13px] font-semibold text-ink underline-offset-4 hover:underline"
              >
                Tüm ölçüleri karşılaştır
                <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform duration-300 ${compare ? "rotate-180" : ""}`} />
              </button>
            </div>
            <table className="w-full border-collapse text-left text-[15px]">
              <caption className="sr-only">{variant} için teknik özellikler</caption>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-t border-sand">
                    <th scope="row" className="w-1/2 py-4 pr-4 font-medium text-steel">
                      {r.label}
                    </th>
                    <td className="py-4 font-semibold text-ink tabular-nums">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span key={variant} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: EASE }} className="inline-block">
                          {r.values[variant] ? formatValue(r.values[variant]!, r.unit) : "—"}
                        </motion.span>
                      </AnimatePresence>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div id="olcu-karsilastirma" hidden={!compare} className="mt-6 overflow-x-auto rounded-2xl border border-sand bg-white">
              <table className="w-full min-w-[520px] border-collapse text-left text-[14px]">
                <caption className="sr-only">Tüm ölçülerin teknik karşılaştırması</caption>
                <thead>
                  <tr className="bg-bone">
                    <th scope="col" className="px-4 py-3 text-[11px] font-semibold tracking-[0.16em] text-stone uppercase">
                      Özellik
                    </th>
                    {variants.map((v) => (
                      <th key={v} scope="col" className={`px-4 py-3 text-[13px] font-semibold ${v === variant ? "text-ember-ink" : "text-ink"}`}>
                        {v}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.label} className="border-t border-sand">
                      <th scope="row" className="px-4 py-3 font-medium text-steel">
                        {r.label}
                        {r.unit ? <span className="text-stone"> ({r.unit})</span> : null}
                      </th>
                      {variants.map((v) => (
                        <td key={v} className={`px-4 py-3 tabular-nums ${v === variant ? "bg-ember/5 font-semibold text-ink" : "text-ink"}`}>
                          {r.values[v] ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {common.map(([g, items]) => (
          <table key={g} className="w-full border-collapse text-left text-[15px]">
            <caption className="pb-3 text-left text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">{g}</caption>
            <tbody>
              {items.map((r) => (
                <tr key={`${g}-${r.label}`} className="border-t border-sand">
                  <th scope="row" className="w-1/2 py-4 pr-4 font-medium text-steel">
                    {r.label}
                  </th>
                  <td className="py-4 font-semibold text-ink">{formatValue(r.value, r.unit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </MotionConfig>
  );
}
