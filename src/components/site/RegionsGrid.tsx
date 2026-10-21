"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

type Item = { name: string; slug: string; side: "Anadolu Yakası" | "Avrupa Yakası"; hint: string; href: string; priority: boolean };

const FILTERS = ["Tüm İstanbul", "Anadolu Yakası", "Avrupa Yakası"] as const;

/**
 * 39 ilçelik hizmet bölgesi listesi + yaka filtresi. Tüm ilçeler SSR HTML'inde bulunur (SEO); filtre yalnızca
 * görünürlüğü değiştirir. Öncelikli ilçeler kendi sayfasına, diğerleri ilçesi seçili başvuru formuna gider.
 */
export function RegionsGrid({ items }: { items: Item[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Tüm İstanbul");
  const visible = filter === "Tüm İstanbul" ? items : items.filter((i) => i.side === filter);

  return (
    <div>
      <div role="group" aria-label="Yakaya göre filtrele" className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`min-h-11 rounded-full border px-5 text-[14px] font-semibold transition-colors ${filter === f ? "border-ink bg-ink text-white" : "border-sand bg-white text-ink hover:border-ink"}`}
          >
            {f}
          </button>
        ))}
        <p aria-live="polite" className="ml-auto text-[14px] text-stone">
          {visible.length} ilçe gösteriliyor
        </p>
      </div>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((d) => (
          <li key={d.slug}>
            <Link
              href={d.href}
              className={`group flex h-full items-start justify-between gap-4 rounded-2xl border p-5 transition-colors ${d.priority ? "border-ember/30 bg-ember/[0.04] hover:border-ember" : "border-linen bg-white hover:border-ink/30"}`}
            >
              <span>
                <span className="block text-[11px] font-semibold tracking-[0.18em] text-stone uppercase">
                  {d.side}
                  {d.priority ? <span className="text-ember-ink"> · Öncelikli görüşme bölgesi</span> : null}
                </span>
                <span className="mt-2 block font-display text-xl font-semibold text-ink">{d.name}</span>
                <span className="mt-1 block text-[14px] leading-relaxed text-steel">{d.hint}</span>
              </span>
              <ArrowUpRight aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-ember-ink transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
