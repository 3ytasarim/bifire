"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Görselin üzerine oturan sessiz, sürekli döngüdeki dekoratif video.
 * Kaynak yalnızca bölüm görünür alana yaklaşınca atanır (sayfa yükünü artırmaz); görünmezken durur.
 * `prefers-reduced-motion` ve Veri Tasarrufu'nda hiç yüklenmez — alttaki görsel kalır.
 * Oynamaya başlayınca yumuşakça belirir; ölçek/zoom yok (videoyu titretir). fit="contain": kırpılmadan sığdırılır.
 */
export function LoopVideo({ src, position, fit = "cover" }: { src: string; position?: string; fit?: "cover" | "contain" }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduced || saveData) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          if (v.getAttribute("src") !== src) v.src = src;
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setVisible(true)}
      className={`absolute inset-0 h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"} transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
      style={position ? { objectPosition: position } : undefined}
    />
  );
}
