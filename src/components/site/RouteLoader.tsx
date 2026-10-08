"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SAFETY_MS = 12_000;

/**
 * Sayfalar arası geçiş göstergesi: site içi bir bağlantıya tıklanınca hareketli Bifire şömine ikonu.
 * 150 ms gecikmeyle belirir — hızlı geçişlerde hiç görünmez, yanıp sönme olmaz. Hedef sayfa (pathname)
 * render edilince kendiliğinden kapanır. Yalnızca sorgu/hash değişen bağlantılarda (filtreler, çapalar) gösterilmez.
 * Hareket SVG içindeki `prefers-reduced-motion` kuralıyla durur.
 */
export function RouteLoader() {
  const pathname = usePathname();
  const [from, setFrom] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  // Yeni sayfa geldi: göstergeyi kapat (render sırasında, koşullu güncelleme).
  if (from !== null && from !== pathname) setFrom(null);
  const loading = from !== null;

  useEffect(() => {
    // Yakalama aşamasında dinlenir: next/link kendi işleyicisinde preventDefault çağırdığı için
    // kabarcık aşamasında her tıklama "engellenmiş" görünür.
    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.hasAttribute("download") || (a.target && a.target !== "_self")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (url.pathname.startsWith("/uploads/") || url.pathname.startsWith("/admin")) return;
      setFrom(location.pathname);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setFrom(null), SAFETY_MS);
    }
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <div
      aria-hidden={!loading}
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-paper/80 backdrop-blur-md transition-[opacity,visibility] duration-300 ${
        loading ? "visible opacity-100 delay-150" : "invisible opacity-0"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- animasyonlu SVG: next/image animasyonu dondurur */}
      <img src="/brand/bifire-flame.svg" alt="" width={112} height={112} className="h-24 w-24 drop-shadow-[0_18px_30px_rgb(255_106_26/0.35)] sm:h-28 sm:w-28" />
      <span className="mt-5 font-display text-sm font-semibold tracking-[0.5em] text-ink">BİFİRE</span>
      <span aria-hidden="true" className="relative mt-4 block h-px w-28 overflow-hidden bg-linen">
        <span className="route-loader-bar absolute inset-y-0 left-0 w-1/2 bg-ember" />
      </span>
      <span className="sr-only">{loading ? "Sayfa yükleniyor" : ""}</span>
    </div>
  );
}
