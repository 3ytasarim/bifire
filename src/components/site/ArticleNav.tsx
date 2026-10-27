"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, MotionConfig, useMotionValue, useSpring, useTransform } from "motion/react";

type Item = { id: string; title: string };

/** Okunan bölüm: görünür alanın üst üçte birine giren son başlık (IntersectionObserver). */
function useActive(items: Item[]) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-25% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);
  return active;
}

/**
 * Uzun metin gezinmesi. Masaüstü: cam kart, okuma ilerleme halkası (yüzde) ve kayan gösterge çubuklu içindekiler.
 * Mobil: üstte yapışkan, yatay kayan bölüm çipleri + ince ilerleme çizgisi. Bağlantılar normal #anchor'dır.
 */
export function ArticleNav({ items, target }: { items: Item[]; target: string }) {
  const active = useActive(items);
  const layout = useId();
  const chips = useRef<HTMLUListElement>(null);
  const [pct, setPct] = useState(0);

  // Okuma ilerlemesi: hedef metnin başı ekranın %30'una geldiğinde 0, sonu %70'e geldiğinde 1.
  const progress = useMotionValue(0);
  useEffect(() => {
    const el = document.getElementById(target);
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const start = innerHeight * 0.3;
      const span = r.height - innerHeight * 0.4;
      progress.set(Math.min(1, Math.max(0, (start - r.top) / Math.max(1, span))));
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, [target, progress]);
  const smooth = useSpring(progress, { stiffness: 140, damping: 30, mass: 0.4 });
  const dash = useTransform(smooth, [0, 1], [126, 0]);
  useEffect(() => smooth.on("change", (v) => setPct(Math.round(Math.min(1, Math.max(0, v)) * 100))), [smooth]);

  // Mobil çip çubuğunda etkin çipi görünür tut.
  useEffect(() => {
    const el = chips.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [active]);

  const index = Math.max(0, items.findIndex((i) => i.id === active));

  return (
    <MotionConfig reducedMotion="user">
      {/* Mobil / tablet */}
      <nav aria-label="Sayfa içeriği" className="sticky top-[72px] z-20 -mx-4 border-y border-white/70 bg-white/75 backdrop-blur-xl sm:-mx-6 lg:hidden">
        <ul ref={chips} className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
          {items.map((it, i) => {
            const on = it.id === active;
            return (
              <li key={it.id} data-id={it.id} className="shrink-0">
                <a href={`#${it.id}`} aria-current={on ? "location" : undefined} className={`relative inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition-colors duration-300 ${on ? "text-white" : "text-steel"}`}>
                  {on ? <motion.span layoutId={`${layout}-m`} transition={{ type: "spring", stiffness: 380, damping: 32 }} aria-hidden="true" className="absolute inset-0 rounded-full bg-ink" /> : null}
                  <span className={`relative tabular-nums ${on ? "text-ember" : "text-stone"}`}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="relative max-w-[14rem] truncate">{it.title}</span>
                </a>
              </li>
            );
          })}
        </ul>
        <motion.span aria-hidden="true" style={{ scaleX: smooth }} className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-gradient-to-r from-ember to-ember/40" />
      </nav>

      {/* Masaüstü */}
      <nav aria-label="Sayfa içeriği" className="hidden overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/65 p-6 shadow-[0_30px_60px_-40px_rgb(40_42_40/0.45)] backdrop-blur-xl lg:block">
        <div className="flex items-center gap-4 border-b border-sand/70 pb-5">
          <span className="relative flex h-14 w-14 shrink-0 items-center justify-center">
            <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90" aria-hidden="true">
              <circle cx="24" cy="24" r="20" fill="none" stroke="rgb(216 209 198 / 0.6)" strokeWidth="3" />
              <motion.circle cx="24" cy="24" r="20" fill="none" stroke="var(--color-ember)" strokeWidth="3" strokeLinecap="round" strokeDasharray="126" style={{ strokeDashoffset: dash }} />
            </svg>
            <span className="font-display text-[13px] font-semibold text-ink tabular-nums">%{pct}</span>
          </span>
          <span>
            <span className="block text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">Bu sayfada</span>
            <span className="mt-1 block text-[14px] font-semibold text-ink">
              Bölüm {index + 1} / {items.length}
            </span>
          </span>
        </div>
        <ol className="mt-4 space-y-0.5">
          {items.map((it, i) => {
            const on = it.id === active;
            const done = i < index;
            return (
              <li key={it.id} className="relative">
                {on ? <motion.span layoutId={layout} transition={{ type: "spring", stiffness: 380, damping: 34 }} aria-hidden="true" className="absolute inset-0 rounded-xl bg-gradient-to-r from-ember/[0.12] to-transparent" /> : null}
                <a
                  href={`#${it.id}`}
                  aria-current={on ? "location" : undefined}
                  className={`relative flex min-h-10 items-baseline gap-3 rounded-xl px-3 py-2 text-[14px] leading-snug transition-colors duration-300 ${on ? "font-semibold text-ink" : "text-steel hover:text-ink"}`}
                >
                  <span className={`font-display text-[12px] tabular-nums transition-colors ${on ? "text-ember-ink" : done ? "text-ember/70" : "text-stone"}`}>{done ? "✓" : String(i + 1).padStart(2, "0")}</span>
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
