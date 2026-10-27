"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { routes } from "@/lib/catalog";

const EASE = [0.16, 1, 0.3, 1] as const;
const norm = (s: string) => s.toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i");

/**
 * İl sayfasındaki ilçe kartları: anlık filtre + kart başına içerik odağı. Kartlar SSR'da tam listelenir.
 * `highlight`: vurgulanan ilçeler (ör. İstanbul öncelikli görüşme bölgeleri).
 */
export function DistrictGrid({ provinceSlug, districts, highlight = [], imageNote }: { provinceSlug: string; districts: { name: string; slug: string; focus: string; image?: string | null }[]; highlight?: string[]; imageNote?: string | null }) {
  const [q, setQ] = useState("");
  const needle = norm(q.trim());
  const shown = districts.filter((d) => !needle || norm(d.name).includes(needle));
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="relative block w-full sm:w-80">
          <span className="sr-only">İlçe ara</span>
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-stone" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="İlçe ara"
            className="block min-h-12 w-full rounded-full border border-sand bg-white pr-4 pl-11 text-[15px] text-ink outline-none placeholder:text-stone/70 focus:border-ink"
          />
        </label>
        <p aria-live="polite" className="text-[13px] font-semibold text-stone tabular-nums">
          {shown.length} ilçe
        </p>
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((d) => {
            const hi = highlight.includes(d.slug);
            return (
              <motion.li key={d.slug} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3, ease: EASE }}>
                <Link
                  href={routes.region(provinceSlug, d.slug)}
                  className={`group relative flex h-full items-start justify-between gap-4 overflow-hidden rounded-2xl border p-5 transition-[border-color,box-shadow] duration-500 hover:shadow-[0_20px_40px_-28px_rgb(40_42_40/0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${hi ? "border-ember/40 bg-ember/[0.04] hover:border-ember" : "border-linen bg-white hover:border-ember/40"}`}
                >
                  {d.image ? (
                    <span className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-bone">
                      <Image src={d.image} alt="" fill sizes="64px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    </span>
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-semibold text-ink">{d.name}</span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-steel">{d.focus}</span>
                  </span>
                  <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bone text-ink transition-colors duration-500 group-hover:bg-ember group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      {!shown.length ? <p className="mt-6 text-[15px] text-steel">Bu adla bir ilçe yok. Konumunuzu başvuru formunda paylaşabilirsiniz.</p> : null}
      {imageNote && shown.some((d) => d.image) ? <p className="mt-4 text-[12.5px] leading-relaxed text-stone">Kart görselleri: {imageNote.charAt(0).toLocaleLowerCase("tr") + imageNote.slice(1)}</p> : null}
    </MotionConfig>
  );
}
