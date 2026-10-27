"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, MotionConfig, useReducedMotion } from "motion/react";

/**
 * Şematik yerleşim (viewBox koordinatı): coğrafi yönler korunur (Trakya batıda, Ankara doğuda, Bursa/Balıkesir
 * güneyde) ama Tuzla çevresindeki iller okunabilirlik için aralıklı yerleştirilir. Ölçekli harita değildir.
 * [x, y, etiket yönü]
 */
const POS: Record<string, [number, number, "r" | "l" | "t" | "b"]> = {
  edirne: [70, 78, "r"],
  kirklareli: [205, 52, "r"],
  tekirdag: [170, 160, "r"],
  istanbul: [318, 96, "r"],
  canakkale: [62, 268, "r"],
  balikesir: [178, 330, "r"],
  bursa: [330, 300, "r"],
  yalova: [262, 232, "l"],
  kocaeli: [452, 150, "r"],
  sakarya: [520, 222, "r"],
  ankara: [596, 318, "l"],
  duzce: [585, 150, "r"],
  bolu: [640, 252, "l"],
  izmir: [92, 408, "r"],
  aydin: [150, 470, "r"],
  mugla: [236, 524, "r"],
  antalya: [430, 520, "r"],
};
/** Marmara dışındaki iller kesikli rota ile gösterilir. */
const FAR = new Set(["ankara", "duzce", "bolu", "izmir", "aydin", "mugla", "antalya"]);
const HUB_POS = [372, 182] as const; // Tuzla — üretim ve fabrika showroom

const W = 700;
const H = 570;
const EASE = [0.16, 1, 0.3, 1] as const;

/** Merkezden ile hafif kavisli rota (ikinci derece Bézier). */
function route(to: readonly [number, number]) {
  const [x1, y1] = HUB_POS;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - Math.min(60, Math.hypot(x2 - x1, y2 - y1) * 0.25);
  return `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
}

/**
 * Ana sayfa bölge haritası: Tuzla'daki üretim merkezinden hizmet verilen illere rota çizgileri (görünüme girince sırayla
 * çizilir), rotalar üzerinde dolaşan ışık noktaları, nabız atan merkez. İl düğümüne gelince adı ve ilçe sayısı
 * öne çıkar; tıklayınca il sayfası açılır. Azaltılmış hareket tercihinde çizgiler sabit, ışıklar kapalıdır.
 */
export function RegionsMap({ provinces }: { provinces: { name: string; slug: string; count: number }[] }) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<string | null>(null);
  const [hx, hy] = HUB_POS;
  const nodes = provinces.filter((p) => POS[p.slug]).map((p) => ({ ...p, pos: [POS[p.slug]![0], POS[p.slug]![1]] as const, side: POS[p.slug]![2] }));

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-linen bg-[radial-gradient(120%_90%_at_30%_20%,#fff_0%,var(--color-paper)_60%,var(--color-bone)_100%)] p-3 sm:p-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-labelledby="regions-map-title">
          <title id="regions-map-title">{`Tuzla üretim merkezinden hizmet verilen ${nodes.length} il`}</title>
          <defs>
            <pattern id="rm-dots" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="rgb(40 42 40 / 0.07)" />
            </pattern>
            <radialGradient id="rm-hub">
              <stop offset="0%" stopColor="rgb(146 113 78 / 0.35)" />
              <stop offset="100%" stopColor="rgb(146 113 78 / 0)" />
            </radialGradient>
          </defs>
          <rect width={W} height={H} fill="url(#rm-dots)" />

          {nodes.map((n, i) => {
            const d = route(n.pos);
            const on = hover === n.slug;
            return (
              <g key={n.slug}>
                <motion.path
                  d={d}
                  fill="none"
                  stroke={on ? "rgb(146 113 78)" : "rgb(146 113 78 / 0.45)"}
                  strokeWidth={on ? 2 : 1.2}
                  strokeDasharray={FAR.has(n.slug) ? "4 5" : undefined}
                  initial={{ pathLength: reduced ? 1 : 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 1.1, delay: 0.25 + i * 0.09, ease: EASE }}
                />
                {!reduced ? (
                  <circle r="2.6" fill="rgb(146 113 78)" opacity="0.9">
                    <animateMotion dur={`${3 + (i % 4) * 0.6}s`} begin={`${1.4 + i * 0.25}s`} repeatCount="indefinite" path={d} />
                  </circle>
                ) : null}
              </g>
            );
          })}

          {nodes.map((n, i) => {
            const [x, y] = n.pos;
            const on = hover === n.slug;
            const labelLeft = n.side === "l";
            return (
              <Link key={n.slug} href={`/hizmet-bolgeleri/${n.slug}`} aria-label={`${n.name} — ${n.count} ilçe`} onMouseEnter={() => setHover(n.slug)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(n.slug)} onBlur={() => setHover(null)}>
                <motion.g initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.6 + i * 0.09, ease: EASE }} style={{ transformOrigin: `${x}px ${y}px` }}>
                  <circle cx={x} cy={y} r={on ? 11 : 8} fill="rgb(255 255 255)" stroke="rgb(146 113 78)" strokeWidth={on ? 2.5 : 1.5} className="transition-all duration-300" />
                  <circle cx={x} cy={y} r={3} fill={on ? "rgb(146 113 78)" : "rgb(40 42 40)"} />
                  <text x={labelLeft ? x - 14 : x + 14} y={y + 4} textAnchor={labelLeft ? "end" : "start"} className={`font-display text-[13px] font-semibold transition-colors ${on ? "fill-ember-ink" : "fill-ink"}`}>
                    {n.name}
                    {on ? <tspan className="fill-steel text-[11px] font-medium">{`  ${n.count} ilçe`}</tspan> : null}
                  </text>
                </motion.g>
              </Link>
            );
          })}

          <circle cx={hx} cy={hy} r="38" fill="url(#rm-hub)" />
          {!reduced ? (
            <circle cx={hx} cy={hy} r="10" fill="none" stroke="rgb(146 113 78)" strokeWidth="1.5">
              <animate attributeName="r" from="10" to="30" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.8" to="0" dur="2.4s" repeatCount="indefinite" />
            </circle>
          ) : null}
          <circle cx={hx} cy={hy} r="9" fill="rgb(40 42 40)" stroke="rgb(146 113 78)" strokeWidth="3" />
          <text x={hx} y={hy + 30} textAnchor="middle" className="fill-ember-ink text-[11px] font-semibold tracking-[0.14em] uppercase">
            Tuzla · üretim
          </text>
        </svg>
        <p className="px-2 pb-1 text-[11px] text-stone">Şematik gösterim; ölçekli harita değildir. Kesik çizgi: şehirler arası proje planlaması.</p>
      </div>
    </MotionConfig>
  );
}
