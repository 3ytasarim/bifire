"use client";

import { useEffect, useId, useState } from "react";
import { motion, MotionConfig } from "motion/react";

/**
 * Yapışkan içindekiler: okunan bölüm (IntersectionObserver) vurgulanır, gösterge çubuğu bölümler arasında kayar.
 * Bağlantılar normal #anchor'dır (JS yoksa da çalışır).
 */
export function AreaToc({ items }: { items: { id: string; title: string }[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const layout = useId();

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <MotionConfig reducedMotion="user">
      <nav aria-label="Sayfa içeriği">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">Bu sayfada</p>
        <ol className="mt-4 space-y-1 border-l border-sand">
          {items.map((it, i) => {
            const on = it.id === active;
            return (
              <li key={it.id} className="relative">
                {on ? <motion.span layoutId={layout} transition={{ type: "spring", stiffness: 380, damping: 34 }} aria-hidden="true" className="absolute top-0 bottom-0 -left-px w-[3px] rounded-full bg-ember" /> : null}
                <a
                  href={`#${it.id}`}
                  aria-current={on ? "location" : undefined}
                  className={`flex min-h-10 items-baseline gap-3 py-1.5 pl-5 text-[14px] leading-snug transition-colors duration-300 ${on ? "font-semibold text-ink" : "text-steel hover:text-ink"}`}
                >
                  <span className={`font-display text-[12px] tabular-nums ${on ? "text-ember-ink" : "text-stone"}`}>{String(i + 1).padStart(2, "0")}</span>
                  {it.title}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </MotionConfig>
  );
}
