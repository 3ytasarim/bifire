"use client";

import { useEffect, useState } from "react";
import { motion, MotionConfig } from "motion/react";
import { selectionStore } from "@/lib/selection-store";
import { hasPrefix } from "@/lib/variants";

type Group = { name: string; values: string[] };

/**
 * Ürün seçenekleri (ör. Seri 01/02, Ölçü: 70'lik…130'luk, Cam yönü: Sağ/Sol açık). Her grup bir radyo grubudur.
 * `combo`: teknik değerleri birden fazla seçime bağlı modellerde (Seri + Ölçü) geçerli kombinasyonlar. Yalnız seçili
 * serinin ölçüleri listelenir; seri değişince geçersiz kalan ölçü, o serinin ilk ölçüsüne kayar.
 * Seçim aynı sayfadaki teklif formuna ve teknik tabloya (selectionStore) aktarılır. SSR'da tüm seçenekler HTML'dedir.
 */
export function ProductOptions({ groups, combo, prefix, numberFrom = 1 }: { groups: Group[]; combo?: { groups: string[]; keys: string[] }; prefix?: string; numberFrom?: number }) {
  const comboGroups = combo?.groups ?? [];
  const comboKeys = combo?.keys ?? [];

  /** `name` grubundaki `value`, önceki kombinasyon gruplarının seçimiyle geçerli bir model oluşturuyor mu? */
  const available = (p: Record<string, string>, name: string, value: string) => {
    const ci = comboGroups.indexOf(name);
    if (ci <= 0 || !comboKeys.length) return true;
    const prefix = [...comboGroups.slice(0, ci).map((g) => p[g] ?? ""), value];
    return comboKeys.some((k) => hasPrefix(k, prefix));
  };

  /** Önceki seçim değişince geçersiz kalan sonraki seçimleri ilk geçerli değere çeker. */
  const normalize = (p: Record<string, string>) => {
    const next = { ...p };
    for (const g of groups) {
      if (!available(next, g.name, next[g.name] ?? "")) next[g.name] = g.values.find((v) => available(next, g.name, v)) ?? next[g.name] ?? "";
    }
    return next;
  };

  const [picked, setPicked] = useState<Record<string, string>>(() => normalize(Object.fromEntries(groups.map((g) => [g.name, g.values[0] ?? ""]))));

  // `prefix`: sayfanın sabit seçimi (ör. model sayfasında "Model: BF-U-01-70 (Seri 01 · 70'lik)").
  const summary = [prefix ?? "", ...groups.map((g) => (picked[g.name] ? `${g.name}: ${picked[g.name]}` : ""))].filter(Boolean).join(" · ");

  // Dış depoyu (form) senkronlamak bir yan etkidir; render sırasında yapılmaz.
  useEffect(() => {
    selectionStore.set(summary, picked);
    return () => selectionStore.set("", {});
  }, [summary, picked]);

  return (
    <MotionConfig reducedMotion="user">
      <div className={groups.length ? "mt-8 space-y-6" : "hidden"}>
        {groups.map((g, gi) => (
          <fieldset key={g.name}>
            <legend className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">
              {String(gi + numberFrom).padStart(2, "0")} / {g.name}
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {g.values
                .filter((v) => available(picked, g.name, v))
                .map((v) => {
                const on = picked[g.name] === v;
                return (
                  <label
                    key={v}
                    className={`relative isolate inline-flex min-h-12 cursor-pointer items-center rounded-full border px-5 text-[15px] font-semibold transition-colors duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ember ${
                      on ? "border-ink text-white" : "border-sand bg-white text-ink hover:border-ink"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`opt-${gi}`}
                      value={v}
                      checked={on}
                      onChange={() => setPicked((p) => normalize({ ...p, [g.name]: v }))}
                      className="sr-only"
                    />
                    {on ? <motion.span layoutId={`opt-pill-${gi}`} transition={{ type: "spring", stiffness: 420, damping: 34 }} aria-hidden="true" className="absolute inset-0 -z-10 rounded-full bg-ink" /> : null}
                    <span className="relative">{v}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </MotionConfig>
  );
}
