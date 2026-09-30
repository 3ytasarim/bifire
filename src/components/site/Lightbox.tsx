"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type GalleryImage = { url: string; alt: string; width: number | null; height: number | null };

/**
 * Tam ekran görsel görüntüleyici. Native <dialog>: odak hapsi, Esc ile kapanma ve arka plan
 * erişilebilirlik izolasyonu tarayıcıdan gelir. ← → tuşları ve kaydırma (swipe) ile gezinme.
 */
export function Lightbox({ images, index, onIndex, onClose }: { images: GalleryImage[]; index: number | null; onIndex: (i: number) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const count = images.length;
  const go = useCallback((d: number) => index !== null && onIndex((index + d + count) % count), [index, count, onIndex]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (index !== null && !dialog.open) dialog.showModal();
    if (index === null && dialog.open) dialog.close();
  }, [index]);

  const img = index !== null ? images[index] : null;

  return (
    <dialog
      ref={ref}
      aria-label="Görsel görüntüleyici"
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const s = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        touchX.current = null;
        if (s !== null && end !== undefined && Math.abs(end - s) > 50) go(end < s ? 1 : -1);
      }}
      className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-ink/97 p-0 text-white backdrop:bg-black/80"
    >
      {img ? (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <p className="text-sm text-white/60 tabular-nums">
              {(index ?? 0) + 1} / {count}
            </p>
            <button type="button" onClick={onClose} aria-label="Kapat" className="flex h-12 w-12 items-center justify-center hover:text-ember">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="relative flex-1">
            <Image src={img.url} alt={img.alt} fill sizes="100vw" className="object-contain" />
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <button type="button" onClick={() => go(-1)} aria-label="Önceki görsel" disabled={count < 2} className="flex h-12 w-12 items-center justify-center border border-white/20 hover:border-ember disabled:opacity-30">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <p className="line-clamp-2 text-center text-sm text-white/70">{img.alt}</p>
            <button type="button" onClick={() => go(1)} aria-label="Sonraki görsel" disabled={count < 2} className="flex h-12 w-12 items-center justify-center border border-white/20 hover:border-ember disabled:opacity-30">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
