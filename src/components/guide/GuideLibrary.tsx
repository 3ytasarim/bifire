"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { GUIDE_CATEGORIES, GUIDE_PERSONAS } from "@/content/guide";

export type LibraryPost = { slug: string; href: string; title: string; excerpt: string | null; category: string | null };

const EASE = [0.16, 1, 0.3, 1] as const;
const norm = (s: string) => s.toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Rehber kütüphanesi: "Size nasıl yardımcı olabiliriz?" ihtiyaç seçimi, konu filtresi ve başlık/özet araması.
 * Tüm yazılar SSR HTML'inde listelenir; filtreler yalnızca istemcide daraltır.
 */
export function GuideLibrary({ posts, initialQuery = "" }: { posts: LibraryPost[]; initialQuery?: string }) {
  const [persona, setPersona] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [q, setQ] = useState(initialQuery);
  const id = useId();
  const personaCats = GUIDE_PERSONAS.find((p) => p.label === persona)?.categories ?? null;
  const needle = norm(q.trim());
  const shown = posts.filter(
    (p) =>
      (!category || p.category === category) &&
      (!personaCats || (p.category && personaCats.includes(p.category))) &&
      (!needle || norm(`${p.title} ${p.excerpt ?? ""}`).includes(needle)),
  );
  const active = persona || category || needle;
  const catName = (slug: string | null) => GUIDE_CATEGORIES.find((c) => c.slug === slug)?.name ?? null;

  const chip = (on: boolean) =>
    `relative isolate inline-flex min-h-11 items-center rounded-full border px-4 text-[14px] font-semibold whitespace-nowrap transition-colors duration-300 ${on ? "border-ink text-white" : "border-sand bg-white text-ink hover:border-ink"}`;

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-7 lg:col-span-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">Size nasıl yardımcı olabiliriz?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {GUIDE_PERSONAS.map((p) => {
                const on = persona === p.label;
                return (
                  <button key={p.label} type="button" aria-pressed={on} onClick={() => (setPersona(on ? null : p.label), setCategory(null))} className={chip(on)}>
                    {on ? <motion.span layoutId={`${id}-persona`} transition={{ type: "spring", stiffness: 420, damping: 34 }} aria-hidden="true" className="absolute inset-0 -z-10 rounded-full bg-ink" /> : null}
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">Konular</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[{ slug: null as string | null, name: "Tüm konular" }, ...GUIDE_CATEGORIES].map((c) => {
                const on = category === c.slug && !persona;
                return (
                  <button key={c.slug ?? "all"} type="button" aria-pressed={on} onClick={() => (setCategory(c.slug), setPersona(null))} className={chip(on)}>
                    {on ? <motion.span layoutId={`${id}-cat`} transition={{ type: "spring", stiffness: 420, damping: 34 }} aria-hidden="true" className="absolute inset-0 -z-10 rounded-full bg-ink" /> : null}
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="relative block">
            <span className="sr-only">Rehberde ara</span>
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-stone" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rehberde ara: baca, kaplama, bakım…"
              className="block min-h-12 w-full rounded-full border border-sand bg-white pr-4 pl-11 text-[15px] text-ink outline-none placeholder:text-stone/70 focus:border-ink"
            />
          </label>
          <div className="flex items-center justify-between gap-3">
            <p aria-live="polite" className="text-[13px] font-semibold text-stone tabular-nums">
              {shown.length} rehber gösteriliyor
            </p>
            {active ? (
              <button type="button" onClick={() => (setPersona(null), setCategory(null), setQ(""))} className="inline-flex min-h-10 items-center gap-1.5 text-[13px] font-semibold text-ember-ink underline-offset-4 hover:underline">
                <X aria-hidden="true" className="h-3.5 w-3.5" /> Seçimi temizle
              </button>
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-8">
          <ul className="grid gap-3 sm:grid-cols-2">
            <AnimatePresence mode="popLayout" initial={false}>
              {shown.map((p) => (
                <motion.li key={p.slug} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3, ease: EASE }}>
                  <Link
                    href={p.href}
                    className="group flex h-full flex-col rounded-2xl border border-linen bg-white p-5 transition-[border-color,box-shadow] duration-500 hover:border-ember/40 hover:shadow-[0_20px_40px_-28px_rgb(12_12_13/0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                  >
                    {catName(p.category) ? <span className="text-[11px] font-semibold tracking-[0.16em] text-ember-ink uppercase">{catName(p.category)}</span> : null}
                    <span className="mt-2 font-display text-[17px] leading-snug font-semibold text-ink transition-colors duration-300 group-hover:text-ember-ink">{p.title}</span>
                    {p.excerpt ? <span className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-steel">{p.excerpt}</span> : null}
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-semibold text-ink">
                      Rehberi okuyun <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </Link>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {!shown.length ? <p className="mt-6 text-[15px] text-steel">Bu seçimle eşleşen rehber yok. Farklı bir konu veya kelime deneyin.</p> : null}
        </div>
      </div>
    </MotionConfig>
  );
}
