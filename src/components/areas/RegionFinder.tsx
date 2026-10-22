"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import { ArrowUpRight, MapPin, Search } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import type { ProvinceName } from "@/content/service-areas/names";
import { routes } from "@/lib/catalog";

const EASE = [0.16, 1, 0.3, 1] as const;
const norm = (s: string) => s.toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i");

type Hit = { name: string; province: string; href: string; focus: string; kind: "il" | "ilçe" };

/**
 * Bölge bulucu: üstte 175 ilçe + 11 il içinde anlık arama (klavye ile ↑ ↓ Enter), altta il sekmeleri.
 * Sekme değişince il paneli ve ilçe çipleri animasyonla gelir. Veri: names.json (yalnız ad/slug/odak).
 */
export function RegionFinder({ provinces, priority = [] }: { provinces: ProvinceName[]; priority?: string[] }) {
  const [active, setActive] = useState(provinces[0]?.slug ?? "");
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const id = useId();
  const listRef = useRef<HTMLUListElement>(null);

  const index = useMemo<Hit[]>(
    () =>
      provinces.flatMap((p) => [
        { name: p.name, province: "İl sayfası", href: `/hizmet-bolgeleri/${p.slug}`, focus: p.focus, kind: "il" as const },
        ...p.districts.map((d) => ({ name: d.name, province: p.name, href: routes.region(p.slug, d.slug), focus: d.focus, kind: "ilçe" as const })),
      ]),
    [provinces],
  );
  const needle = norm(q.trim());
  const hits = needle ? index.filter((h) => norm(h.name).startsWith(needle) || norm(h.name).includes(needle)).sort((a, b) => Number(!norm(a.name).startsWith(needle)) - Number(!norm(b.name).startsWith(needle))).slice(0, 8) : [];
  const province = provinces.find((p) => p.slug === active) ?? provinces[0]!;
  const districts = [...province.districts].sort((a, b) => Number(priority.includes(b.slug)) - Number(priority.includes(a.slug)) || a.name.localeCompare(b.name, "tr"));

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative">
        <label htmlFor={`${id}-q`} className="sr-only">
          İl veya ilçe ara
        </label>
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-stone" />
          <input
            id={`${id}-q`}
            type="search"
            role="combobox"
            aria-expanded={hits.length > 0}
            aria-controls={`${id}-list`}
            aria-activedescendant={hits.length ? `${id}-hit-${cursor}` : undefined}
            autoComplete="off"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setCursor(0);
            }}
            onKeyDown={(e) => {
              if (!hits.length) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setCursor((c) => (c + 1) % hits.length);
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setCursor((c) => (c - 1 + hits.length) % hits.length);
              }
              if (e.key === "Enter") {
                e.preventDefault();
                listRef.current?.querySelectorAll("a")[cursor]?.click();
              }
              if (e.key === "Escape") setQ("");
            }}
            placeholder="İlçenizi yazın: Çankaya, Nilüfer, Sarıyer…"
            className="block min-h-16 w-full rounded-full border border-sand bg-white pr-6 pl-14 text-[17px] text-ink shadow-[0_20px_40px_-30px_rgb(12_12_13/0.4)] outline-none placeholder:text-stone/70 focus:border-ink"
          />
        </div>
        <AnimatePresence>
          {needle ? (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-3xl border border-sand bg-white shadow-[0_30px_60px_-30px_rgb(12_12_13/0.45)]"
            >
              {hits.length ? (
                <ul ref={listRef} id={`${id}-list`} role="listbox" aria-label="Bölge sonuçları" className="max-h-96 overflow-y-auto py-2">
                  {hits.map((h, i) => (
                    <li key={h.href} id={`${id}-hit-${i}`} role="option" aria-selected={i === cursor}>
                      <Link href={h.href} onMouseEnter={() => setCursor(i)} className={`flex items-center gap-4 px-5 py-3 transition-colors ${i === cursor ? "bg-bone" : ""}`}>
                        <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${h.kind === "il" ? "bg-ink text-ember" : "bg-ember/10 text-ember-ink"}`}>
                          <MapPin className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-ink">
                            {h.name} <span className="font-normal text-stone">· {h.province}</span>
                          </span>
                          <span className="block truncate text-[13px] text-steel">{h.focus}</span>
                        </span>
                        <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-ember-ink" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-4 text-[15px] text-steel">Eşleşen bölge yok. Konumunuzu formda “Diğer” seçerek paylaşabilirsiniz.</p>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div role="tablist" aria-label="İller" className="mt-10 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {provinces.map((p) => {
          const on = p.slug === active;
          return (
            <button
              key={p.slug}
              type="button"
              role="tab"
              id={`${id}-tab-${p.slug}`}
              aria-selected={on}
              aria-controls={`${id}-panel`}
              onClick={() => setActive(p.slug)}
              className={`relative isolate inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full border px-5 text-[15px] font-semibold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${on ? "border-ink text-white" : "border-sand bg-white text-ink hover:border-ink"}`}
            >
              {on ? <motion.span layoutId={`${id}-tab`} transition={{ type: "spring", stiffness: 420, damping: 34 }} aria-hidden="true" className="absolute inset-0 -z-10 rounded-full bg-ink" /> : null}
              {p.name}
              <span className={`text-[12px] tabular-nums ${on ? "text-ember" : "text-stone"}`}>{p.districts.length}</span>
            </button>
          );
        })}
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${province.slug}`} className="mt-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={province.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="relative overflow-hidden rounded-[1.75rem] border border-linen bg-white p-6 sm:p-10"
          >
            <span aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.16),transparent_65%)]" />
            <div className="relative grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">{province.districts.length} ilçe</p>
                <h3 className="mt-3 font-display text-4xl leading-none font-semibold tracking-[-0.03em] text-ink">{province.name}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-steel">{province.focus}</p>
                <Link href={`/hizmet-bolgeleri/${province.slug}`} className="group mt-6 inline-flex min-h-12 items-center gap-3 rounded-full bg-ink pr-2 pl-6 text-[14px] font-semibold text-white transition-colors hover:bg-ember hover:text-ink">
                  {province.name} sayfasını inceleyin
                  <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:rotate-45">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>
              <ul className="flex flex-wrap content-start gap-2 lg:col-span-8">
                {districts.map((d, i) => {
                  const pri = priority.includes(d.slug) && province.slug === "istanbul";
                  return (
                    <motion.li key={d.slug} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: Math.min(i * 0.015, 0.4), ease: EASE }}>
                      <Link
                        href={routes.region(province.slug, d.slug)}
                        title={d.focus}
                        className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-[14px] font-semibold transition-colors duration-300 ${pri ? "border-ember/40 bg-ember/[0.06] text-ink hover:border-ember" : "border-linen bg-paper text-ink hover:border-ink"}`}
                      >
                        {pri ? <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ember" /> : null}
                        {d.name}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
