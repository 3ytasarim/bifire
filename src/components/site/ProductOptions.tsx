"use client";

import { useEffect, useState } from "react";
import { motion, MotionConfig } from "motion/react";
import { selectionStore } from "@/lib/selection-store";

type Group = { name: string; values: string[] };

/**
 * Ürün seçenekleri (ör. Ölçü: 70'lik…110'lik, Cam yönü: Sağ/Sol açık). Her grup bir radyo grubudur; varsayılan
 * olarak ilk değer seçilidir. Seçim aynı sayfadaki teklif formuna (selectionStore) aktarılır.
 * SSR'da da tüm seçenekler HTML'de görünür (SEO), seçim etkileşimi istemcide çalışır.
 */
export function ProductOptions({ groups }: { groups: Group[] }) {
  const [picked, setPicked] = useState<Record<string, string>>(() => Object.fromEntries(groups.map((g) => [g.name, g.values[0] ?? ""])));

  const summary = groups
    .map((g) => (picked[g.name] ? `${g.name}: ${picked[g.name]}` : ""))
    .filter(Boolean)
    .join(" · ");

  // Dış depoyu (form) senkronlamak bir yan etkidir; render sırasında yapılmaz.
  useEffect(() => {
    selectionStore.set(summary, picked);
    return () => selectionStore.set("", {});
  }, [summary, picked]);

  return (
    <MotionConfig reducedMotion="user">
    <div className="mt-8 space-y-6">
      {groups.map((g, gi) => (
        <fieldset key={g.name}>
          <legend className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">
            {String(gi + 1).padStart(2, "0")} / {g.name}
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {g.values.map((v) => {
              const on = picked[g.name] === v;
              return (
                <label
                  key={v}
                  className={`relative isolate inline-flex min-h-12 cursor-pointer items-center rounded-full border px-5 text-[15px] font-semibold transition-colors duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ember ${
                    on ? "border-ink text-white" : "border-sand bg-white text-ink hover:border-ink"
                  }`}
                >
                  <input type="radio" name={`opt-${gi}`} value={v} checked={on} onChange={() => setPicked((p) => ({ ...p, [g.name]: v }))} className="sr-only" />
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
