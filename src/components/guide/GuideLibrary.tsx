"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { GUIDE_CATEGORIES } from "@/content/guide";

export type LibraryPost = { slug: string; href: string; title: string; excerpt: string | null; category: string | null; image: string | null };

const EASE = [0.16, 1, 0.3, 1] as const;
const STEP = 12;
const norm = (s: string) => s.toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i");

/**
 * Rehber kütüphanesi: konu filtresi + başlık/özet araması + "daha fazla göster" (12'şer). Her yazının kalıcı,
 * taranabilir bağlantısı kategori sayfalarında da bulunur; burası hızlı keşif katmanıdır.
 */
export function GuideLibrary({ posts, initialQuery = "" }: { posts: LibraryPost[]; initialQuery?: string }) {
  const [category, setCategory] = useState<string | null>(null);
  const [q, setQ] = useState(initialQuery);
  const [limit, setLimit] = useState(STEP);
  const id = useId();
  const needle = norm(q.trim());
  const filtered = posts.filter((p) => (!category || p.category === category) && (!needle || norm(`${p.title} ${p.excerpt ?? ""}`).includes(needle)));
  const shown = filtered.slice(0, limit);
  const catName = (slug: string | null) => GUIDE_CATEGORIES.find((c) => c.slug === slug)?.name ?? null;
  const counts = Object.fromEntries(GUIDE_CATEGORIES.map((c) => [c.slug, posts.filter((p) => p.category === c.slug).length]));

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-5 rounded-[1.75rem] border border-white/70 bg-white/55 p-4 backdrop-blur-xl sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:flex-wrap lg:pb-0">
          {[{ slug: null as string | null, name: "Tüm konular" }, ...GUIDE_CATEGORIES.filter((c) => counts[c.slug])].map((c) => {
            const on = category === c.slug;
            return (
              <button
                key={c.slug ?? "all"}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setCategory(c.slug);
                  setLimit(STEP);
                }}
                className={`relative isolate inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[13px] font-semibold whitespace-nowrap transition-colors duration-300 ${on ? "border-ink text-white" : "border-sand bg-white text-ink hover:border-ink"}`}
              >
                {on ? <motion.span layoutId={`${id}-cat`} transition={{ type: "spring", stiffness: 420, damping: 34 }} aria-hidden="true" className="absolute inset-0 -z-10 rounded-full bg-ink" /> : null}
                {c.name}
                {c.slug ? <span className={`text-[11px] tabular-nums ${on ? "text-ember" : "text-stone"}`}>{counts[c.slug]}</span> : null}
              </button>
            );
          })}
        </div>
        <label className="relative block lg:w-80">
          <span className="sr-only">Rehberde ara</span>
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-stone" />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setLimit(STEP);
            }}
            placeholder="Baca, kaplama, bakım…"
            className="block min-h-12 w-full rounded-full border border-sand bg-white pr-10 pl-11 text-[15px] text-ink outline-none placeholder:text-stone/70 focus:border-ink"
          />
          {q ? (
            <button type="button" onClick={() => setQ("")} aria-label="Aramayı temizle" className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-stone hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>
      </div>

      <p aria-live="polite" className="mt-5 text-[13px] font-semibold text-stone tabular-nums">
        {filtered.length} rehber{category || needle ? " bulundu" : ""}
      </p>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((p) => (
            <motion.li key={p.slug} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.35, ease: EASE }}>
              <Link href={p.href} className="group flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-linen bg-white transition-[border-color,box-shadow] duration-500 hover:border-ember/40 hover:shadow-[0_24px_48px_-28px_rgb(12_12_13/0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember">
                <span className="relative block aspect-[16/9] overflow-hidden bg-bone">
                  {p.image ? <Image src={p.image} alt="" fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover transition-transform duration-700 ease-(--ease-premium) group-hover:scale-[1.03]" /> : <span className="ember-placeholder absolute inset-0" />}
                  {catName(p.category) ? (
                    <span className="absolute top-3 left-3 rounded-full border border-white/40 bg-white/70 px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-ink uppercase backdrop-blur-md">{catName(p.category)}</span>
                  ) : null}
                </span>
                <span className="flex flex-1 flex-col p-5">
                  <span className="font-display text-[17px] leading-snug font-semibold text-ink transition-colors duration-300 group-hover:text-ember-ink">{p.title}</span>
                  {p.excerpt ? <span className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-steel">{p.excerpt}</span> : null}
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-semibold text-ink">
                    Rehberi okuyun <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </span>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {!filtered.length ? <p className="mt-6 text-[15px] text-steel">Bu seçimle eşleşen rehber yok. Farklı bir konu veya kelime deneyin.</p> : null}
      {filtered.length > limit ? (
        <div className="mt-8 flex justify-center">
          <button type="button" onClick={() => setLimit((l) => l + STEP)} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-sand bg-white px-6 text-[14px] font-semibold text-ink transition-colors hover:border-ink">
            Daha fazla göster <span className="text-stone tabular-nums">({filtered.length - limit})</span>
          </button>
        </div>
      ) : null}
    </MotionConfig>
  );
}
