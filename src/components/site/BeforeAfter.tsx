"use client";

import Image from "next/image";
import { useState } from "react";
import { MoveHorizontal } from "lucide-react";

/**
 * Önce / sonra karşılaştırma: çizgi sürüklenerek (veya klavyeyle, yerel range girdisi) iki görsel karşılaştırılır.
 * Range girdisi tüm alanı kaplar; dokunmatikte yatay sürükleme doğrudan çalışır.
 */
export function BeforeAfter({ before, after, beforeLabel, afterLabel }: { before: { url: string; alt: string }; after: { url: string; alt: string }; beforeLabel: string; afterLabel: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative aspect-[4/3] w-full touch-pan-y has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-ember overflow-hidden rounded-[1.75rem] bg-bone shadow-[0_30px_60px_-30px_rgb(40_42_40/0.35)] select-none sm:aspect-[16/9]">
      <Image src={after.url} alt={after.alt} fill sizes="(min-width: 1024px) 80vw, 100vw" className="object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src={before.url} alt={before.alt} fill sizes="(min-width: 1024px) 80vw, 100vw" className="object-cover" />
      </div>
      <span className="pointer-events-none absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-ink uppercase backdrop-blur">{beforeLabel}</span>
      <span className="pointer-events-none absolute top-4 right-4 rounded-full bg-ink/80 px-3 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-white uppercase backdrop-blur">{afterLabel}</span>
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_12px_rgb(0_0_0/0.35)]" style={{ left: `${pos}%` }}>
        <span className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-lg">
          <MoveHorizontal className="h-5 w-5" />
        </span>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`${beforeLabel} ve ${afterLabel} karşılaştırması`}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0 focus-visible:opacity-0"
      />
    </div>
  );
}
