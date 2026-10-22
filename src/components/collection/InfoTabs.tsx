"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Erişilebilir sekmeler (WAI-ARIA tabs): ← → / Home / End ile gezinme. Tüm panel içerikleri SSR HTML'inde
 * vardır (gizli paneller `hidden`), arama motorları hepsini okur.
 */
export function InfoTabs({ tabs }: { tabs: { label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (i: number) => {
    const n = (i + tabs.length) % tabs.length;
    setActive(n);
    refs.current[n]?.focus();
  };
  return (
    <MotionConfig reducedMotion="user">
      <div role="tablist" aria-label="Model bilgileri" className="flex gap-1 overflow-x-auto rounded-full border border-sand bg-white p-1.5 [scrollbar-width:none]">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") move(i + 1);
              if (e.key === "ArrowLeft") move(i - 1);
              if (e.key === "Home") move(0);
              if (e.key === "End") move(tabs.length - 1);
            }}
            className={`relative isolate min-h-11 shrink-0 rounded-full px-5 text-[14px] font-semibold whitespace-nowrap transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${i === active ? "text-white" : "text-steel hover:text-ink"}`}
          >
            {i === active ? <motion.span layoutId={`${id}-pill`} transition={{ type: "spring", stiffness: 420, damping: 34 }} aria-hidden="true" className="absolute inset-0 -z-10 rounded-full bg-ink" /> : null}
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.label} role="tabpanel" id={`${id}-panel-${i}`} aria-labelledby={`${id}-tab-${i}`} hidden={i !== active} tabIndex={0} className="mt-8 outline-none">
          <AnimatePresence mode="wait" initial={false}>
            {i === active ? (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }}>
                {t.content}
              </motion.div>
            ) : (
              <div>{t.content}</div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </MotionConfig>
  );
}
