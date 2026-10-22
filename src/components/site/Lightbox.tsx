"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

export type GalleryImage = { url: string; alt: string; width: number | null; height: number | null };

/**
 * Tam ekran görsel görüntüleyici. Native <dialog>: odak hapsi, Esc ile kapanma ve arka plan
 * erişilebilirlik izolasyonu tarayıcıdan gelir. ← → tuşları ve kaydırma (swipe) ile gezinme.
 * `zoomable`: ölçü çizimleri için yakınlaştırma — görsele dokununca 2 kat büyür, parmakla/kaydırarak gezilir
 * (yakınken swipe ile görsel değişmez). `light`: çizimler beyaz zemin üzerinde gösterilir.
 */
export function Lightbox({
  images,
  index,
  onIndex,
  onClose,
  zoomable,
  light,
}: {
  images: GalleryImage[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
  zoomable?: boolean;
  light?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const count = images.length;
  const [zoomed, setZoomed] = useState(false);
  const go = useCallback(
    (d: number) => {
      if (index === null) return;
      setZoomed(false);
      onIndex((index + d + count) % count);
    },
    [index, count, onIndex],
  );

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
      onClose={() => {
        setZoomed(false);
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const s = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        touchX.current = null;
        if (!zoomed && s !== null && end !== undefined && Math.abs(end - s) > 50) go(end < s ? 1 : -1);
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
          {zoomable && zoomed ? (
            <div className={`relative flex-1 touch-pan-x touch-pan-y overflow-auto overscroll-contain ${light ? "bg-white" : ""}`}>
              <button type="button" onClick={() => setZoomed(false)} aria-label="Uzaklaştır" className="block cursor-zoom-out">
                <Image src={img.url} alt={img.alt} width={img.width ?? 1600} height={img.height ?? 1000} sizes="200vw" className="h-auto w-[200vw] max-w-none sm:w-[160vw]" />
              </button>
            </div>
          ) : zoomable ? (
            <button type="button" onClick={() => setZoomed(true)} aria-label="Yakınlaştır" className={`relative flex-1 cursor-zoom-in ${light ? "mx-3 rounded-xl bg-white sm:mx-6" : ""}`}>
              <Image src={img.url} alt={img.alt} fill sizes="100vw" className={`object-contain ${light ? "p-3 sm:p-6" : ""}`} />
            </button>
          ) : (
            <div className="relative flex-1">
              <Image src={img.url} alt={img.alt} fill sizes="100vw" className="object-contain" />
            </div>
          )}
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <button type="button" onClick={() => go(-1)} aria-label="Önceki görsel" disabled={count < 2} className="flex h-12 w-12 items-center justify-center border border-white/20 hover:border-ember disabled:opacity-30">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 flex-col items-center gap-2">
              <p className="line-clamp-2 text-center text-sm text-white/70">{img.alt}</p>
              {zoomable ? (
                <button type="button" onClick={() => setZoomed((z) => !z)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 px-4 text-[13px] font-semibold hover:border-ember">
                  {zoomed ? <ZoomOut aria-hidden="true" className="h-4 w-4" /> : <ZoomIn aria-hidden="true" className="h-4 w-4" />}
                  {zoomed ? "Uzaklaştır" : "Yakınlaştır"}
                </button>
              ) : null}
            </div>
            <button type="button" onClick={() => go(1)} aria-label="Sonraki görsel" disabled={count < 2} className="flex h-12 w-12 items-center justify-center border border-white/20 hover:border-ember disabled:opacity-30">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
