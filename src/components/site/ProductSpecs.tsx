"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { animate, AnimatePresence, motion, MotionConfig, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { CODE_LABEL, hasPrefix, splitVariant } from "@/lib/variants";
import { useVariantKey } from "./useVariantKey";

export type VariantRow = { label: string; unit: string | null; values: Record<string, string> };
export type SpecRow = { label: string; value: string; unit?: string | null };
/** Ana tablo satırı: modele göre değişen (v) veya tüm modeller için sabit (c); veri sırasıyla karışık listelenir. */
export type SpecItem = ({ kind: "v" } & VariantRow) | ({ kind: "c" } & SpecRow);


const EASE = [0.16, 1, 0.3, 1] as const;
const MISSING = "Bu modelin sayısal teknik tablosu tamamlanacak. Başka bir ölçünün değerleri kullanılmamıştır.";

/** "%" birimi önde ("%83"), diğerleri sonda ("15 kW"). */
function formatValue(value: string, unit: string | null | undefined) {
  if (!unit) return value;
  return unit === "%" ? `%${value}` : `${value} ${unit}`;
}

const hasData = (rows: VariantRow[], key: string) => rows.some((r) => r.label !== CODE_LABEL && r.values[key]);

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

/** Hero'daki seçime bağlı öne çıkan değerler (Güç / Verim / Ağırlık / Baca) ve model kodu — seçim değişince sayılar akar. */
export function VariantHighlights({ groups, fallback, rows, code }: { groups: string[]; fallback: string; rows: VariantRow[]; code?: VariantRow | null }) {
  const { key, label } = useVariantKey(groups, fallback);
  const items = rows.slice(0, 4);
  if (!items.length && !code) return null;
  const complete = hasData(rows, key);
  const codeValue = code?.values[key];
  return (
    <div className="mt-8 border-y border-sand py-5">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p aria-live="polite" className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">
          <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />
          Seçilen model · {label}
        </p>
        {codeValue ? (
          <p className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-stone uppercase">
            Katalog kodu
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={codeValue} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2, ease: EASE }} className="text-ink tabular-nums">
                {codeValue}
              </motion.span>
            </AnimatePresence>
          </p>
        ) : null}
      </div>
      {complete ? (
        <dl className={`mt-4 grid gap-x-4 gap-y-5 ${items.length >= 4 ? "grid-cols-2 sm:grid-cols-4 sm:gap-x-3" : "grid-cols-3"}`}>
          {items.map((r) => {
            const v = r.values[key];
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
      ) : (
        <p className="mt-4 flex gap-2 text-[14px] leading-relaxed text-steel">
          <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ember" /> Modele ait teknik bilgiler tamamlanacak. Değerlendirme için ekibimizle görüşebilirsiniz.
        </p>
      )}
    </div>
  );
}

/**
 * Teknik özellikler tablosu: seçili modelin değerleri + tüm modeller için geçerli satırlar. "Tüm ölçüleri
 * karşılaştır" seçili serinin ölçülerini yan yana açar (mobilde yatay kaydırma, özellik sütunu sabit).
 * Tüm değerler SSR HTML'inde de bulunur (karşılaştırma tablosu gizli olsa bile DOM'da), arama motorları okuyabilir.
 */
export function ProductSpecs({
  groups,
  variants,
  rows,
  items,
  common,
  note,
}: {
  groups: string[];
  variants: string[];
  rows: VariantRow[];
  items: SpecItem[];
  common: [string, SpecRow[]][];
  note?: string;
}) {
  const fallback = variants[0] ?? "";
  const { key, label } = useVariantKey(groups, fallback);
  const [compare, setCompare] = useState(false);
  const complete = hasData(rows, key);
  // Karşılaştırma: son grup (ölçü) dışındaki seçimler aynı olan modeller — ör. Seri 01'in tüm ölçüleri.
  const prefix = splitVariant(key).slice(0, -1);
  const columns = variants.filter((v) => hasPrefix(v, prefix));
  const colLabel = (v: string) => splitVariant(v).at(-1) ?? v;
  const compareRows = rows.filter((r) => columns.some((c) => r.values[c]));

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-10">
        {groups.length && rows.length ? (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
              <p aria-live="polite" className="text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">
                Seçili model · {label}
              </p>
              {columns.length > 1 ? (
                <button
                  type="button"
                  aria-expanded={compare}
                  aria-controls="olcu-karsilastirma"
                  onClick={() => setCompare((v) => !v)}
                  className="inline-flex min-h-10 items-center gap-1.5 text-[13px] font-semibold text-ink underline-offset-4 hover:underline"
                >
                  {prefix.length ? `${prefix.join(" · ")} ölçülerini karşılaştır` : "Tüm ölçüleri karşılaştır"}
                  <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform duration-300 ${compare ? "rotate-180" : ""}`} />
                </button>
              ) : null}
            </div>

            {!complete ? (
              <p role="note" className="mb-4 flex gap-2.5 rounded-2xl border border-ember/30 bg-ember/5 px-4 py-3 text-[14px] leading-relaxed text-ink">
                <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ember" /> {MISSING}
              </p>
            ) : null}

            <table className="w-full border-collapse text-left text-[15px]">
              <caption className="sr-only">{label} için teknik özellikler</caption>
              <tbody>
                {items.map((r) => (
                  <tr key={r.label} className="border-t border-sand">
                    <th scope="row" className="w-1/2 py-4 pr-4 font-medium text-steel">
                      {r.label}
                    </th>
                    <td className="py-4 font-semibold text-ink tabular-nums">
                      {r.kind === "v" ? (
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span key={key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: EASE }} className="inline-block">
                            {r.values[key] ? formatValue(r.values[key]!, r.unit) : <span className="font-medium text-stone">Modele ait bilgi tamamlanacak</span>}
                          </motion.span>
                        </AnimatePresence>
                      ) : (
                        formatValue(r.value, r.unit)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {note ? <p className="mt-4 border-t border-sand pt-4 text-[13px] leading-relaxed text-stone">{note}</p> : null}

            {columns.length > 1 ? (
              <div id="olcu-karsilastirma" hidden={!compare} className="mt-6 overflow-x-auto overscroll-x-contain rounded-2xl border border-sand bg-white">
                <table className="w-full min-w-[520px] border-collapse text-left text-[14px]">
                  <caption className="sr-only">{prefix.length ? `${prefix.join(" · ")} ölçülerinin` : "Tüm ölçülerin"} teknik karşılaştırması</caption>
                  <thead>
                    <tr className="bg-bone">
                      <th scope="col" className="sticky left-0 z-10 bg-bone px-4 py-3 text-[11px] font-semibold tracking-[0.16em] text-stone uppercase">
                        Özellik
                      </th>
                      {columns.map((v) => (
                        <th key={v} scope="col" className={`px-4 py-3 text-[13px] font-semibold whitespace-nowrap ${v === key ? "text-ember-ink" : "text-ink"}`}>
                          {colLabel(v)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compareRows.map((r) => (
                      <tr key={r.label} className="border-t border-sand">
                        <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-3 font-medium whitespace-nowrap text-steel">
                          {r.label}
                          {r.unit ? <span className="text-stone"> ({r.unit})</span> : null}
                        </th>
                        {columns.map((v) => (
                          <td key={v} className={`px-4 py-3 whitespace-nowrap tabular-nums ${v === key ? "bg-ember/5 font-semibold text-ink" : "text-ink"}`}>
                            {r.values[v] ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ) : null}

        {common.map(([g, list]) => (
          <table key={g} className="w-full border-collapse text-left text-[15px]">
            <caption className="pb-3 text-left text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">{g}</caption>
            <tbody>
              {list.map((r) => (
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
