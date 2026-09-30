"use client";

import { getImageProps } from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export type HeroSlideData = {
  id: string;
  desktopImage: string;
  mobileImage: string | null;
  imageAlt: string | null;
  eyebrow: string | null;
  title: string;
  description: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  secondaryCtaText: string | null;
  secondaryCtaUrl: string | null;
  textPosition: "LEFT" | "CENTER" | "RIGHT" | "BOTTOM_LEFT";
  overlay: number;
};

const AUTOPLAY_MS = 6500;
const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

const POSITION: Record<HeroSlideData["textPosition"], { wrap: string; text: string; gradient: string }> = {
  LEFT: { wrap: "items-center justify-start", text: "text-left", gradient: "bg-gradient-to-r from-black/70 via-black/25 to-transparent" },
  CENTER: { wrap: "items-center justify-center", text: "text-center items-center", gradient: "bg-radial from-black/45 to-transparent" },
  RIGHT: { wrap: "items-center justify-end", text: "text-right items-end", gradient: "bg-gradient-to-l from-black/70 via-black/25 to-transparent" },
  BOTTOM_LEFT: { wrap: "items-end justify-start pb-36 sm:pb-40", text: "text-left", gradient: "bg-gradient-to-t from-black/80 via-black/20 to-transparent" },
};

/** Masaüstü + mobil görsel (art direction) — <picture>, Next görsel optimizasyonu korunur. */
function SlidePicture({ slide, first }: { slide: HeroSlideData; first: boolean }) {
  const common = { alt: first ? (slide.imageAlt ?? "") : "", sizes: "100vw", fill: true as const, ...(first ? { priority: true } : { loading: "lazy" as const }) };
  const desktop = getImageProps({ ...common, src: slide.desktopImage }).props;
  const mobile = slide.mobileImage ? getImageProps({ ...common, src: slide.mobileImage }).props : null;
  const { style, ...img } = desktop;
  return (
    <picture>
      {mobile ? <source media="(max-width: 767px)" srcSet={mobile.srcSet} sizes="100vw" /> : null}
      <source media="(min-width: 768px)" srcSet={desktop.srcSet} sizes="100vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt getImageProps'tan geliyor */}
      <img {...img} style={style} className="object-cover" />
    </picture>
  );
}

/**
 * Ana sayfa hero slider'ı — Norm Yacht HeroSlider mantığı (otomatik geçiş, önceki/sonraki, çizgi göstergeler,
 * metin blokları sırayla giriş). SYMC/Mezbaha Next.js uyarlamalarındaki iyileştirmeler:
 * ilk slayt SSR + priority görsel (LCP), crossfade, durdur/oynat, reduced-motion, aria etiketleri.
 * Bifire: tam viewport, mobil görsel, metin konumu, overlay yoğunluğu, 2 CTA, kaydırma (swipe).
 * H1 sabittir (`heading`): slayt başlıkları döndüğü için sayfanın ana başlığı bunlara bağlanmaz.
 */
export function HeroSlider({ slides, heading }: { slides: HeroSlideData[]; heading: string }) {
  const count = slides.length;
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [changed, setChanged] = useState(false); // ilk yüklemede metin animasyonu yok (LCP)
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (i: number) => {
      setChanged(true);
      setCurrent(((i % count) + count) % count);
    },
    [count],
  );

  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(REDUCED).matches, () => false);
  const autoplay = playing && !reducedMotion;

  // Otomatik geçiş zamanlayıcıyla değil, aktif göstergenin ilerleme animasyonunun bitişiyle tetiklenir:
  // hover/odakta animasyon duraklar → geçiş de duraklar, çizgi ile slayt her zaman senkron.
  const slide = slides[current] ?? slides[0];
  if (!slide) return null;
  const pos = POSITION[slide.textPosition];
  const animate = changed ? "animate-rise" : "";

  return (
    <section
      className="relative isolate h-[100svh] min-h-[600px] overflow-hidden bg-ink text-white"
      aria-roledescription="carousel"
      aria-label="Öne çıkan şömine çözümleri"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(current + 1);
        if (e.key === "ArrowLeft") go(current - 1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        touchX.current = null;
        if (start === null || end === undefined || Math.abs(end - start) < 50) return;
        setPlaying(false);
        go(end < start ? current + 1 : current - 1);
      }}
    >
      {slides.map((s, i) => (
        <div
          key={s.id}
          aria-hidden={i !== current}
          className={`absolute inset-0 -z-20 transition-opacity duration-[1400ms] ease-(--ease-soft) ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <div className={`absolute inset-0 transition-transform duration-[9000ms] ease-out ${i === current ? "scale-100" : "scale-[1.06]"}`}>
            <SlidePicture slide={s} first={i === 0} />
          </div>
        </div>
      ))}
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-black transition-opacity duration-700" style={{ opacity: Math.min(90, Math.max(0, slide.overlay)) / 100 }} />
      <span aria-hidden="true" className={`absolute inset-0 -z-10 ${pos.gradient}`} />
      <span aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b from-black/60 to-transparent" />

      <div className={`shell flex h-full pt-28 lg:pt-32 ${pos.wrap}`}>
        <div className={`flex max-w-3xl flex-col ${pos.text}`} aria-live={autoplay ? "off" : "polite"}>
          <h1 className="eyebrow text-amber">{heading}</h1>
          {slide.eyebrow ? (
            <p key={`e-${current}`} className={`mt-6 text-[13px] font-medium tracking-[0.18em] text-white/75 uppercase ${animate}`}>
              {slide.eyebrow}
            </p>
          ) : null}
          <p key={`t-${current}`} className={`display-1 mt-5 ${animate} [animation-delay:60ms]`}>
            {slide.title}
          </p>
          {slide.description ? (
            <p key={`d-${current}`} className={`lead mt-6 max-w-xl text-white/80 ${animate} [animation-delay:140ms] ${slide.textPosition === "CENTER" ? "mx-auto" : ""} ${slide.textPosition === "RIGHT" ? "ml-auto" : ""}`}>
              {slide.description}
            </p>
          ) : null}
          {slide.ctaUrl || slide.secondaryCtaUrl ? (
            <div
              key={`c-${current}`}
              className={`mt-10 flex flex-col gap-3 sm:flex-row ${animate} [animation-delay:220ms] ${slide.textPosition === "CENTER" ? "sm:justify-center" : ""} ${slide.textPosition === "RIGHT" ? "sm:justify-end" : ""}`}
            >
              {slide.ctaUrl ? (
                <Link href={slide.ctaUrl} className="btn btn-ember">
                  {slide.ctaText || "Ürünleri keşfet"}
                  <ArrowRight aria-hidden="true" className="btn-arrow h-4 w-4" />
                </Link>
              ) : null}
              {slide.secondaryCtaUrl ? (
                <Link href={slide.secondaryCtaUrl} className="btn btn-ghost-light">
                  {slide.secondaryCtaText || "Projenizi konuşalım"}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {count > 1 ? (
        <div className="absolute inset-x-0 bottom-0 z-10 pb-6 sm:pb-8">
          <div className="shell flex items-end gap-6">
            <ol className="flex flex-1 gap-3 sm:max-w-md" aria-label="Slaytlar">
              {slides.map((s, i) => (
                <li key={s.id} className="flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPlaying(false);
                      go(i);
                    }}
                    aria-label={`${i + 1}. slayt: ${s.title}`}
                    aria-current={i === current ? "true" : undefined}
                    className="group flex h-11 w-full flex-col justify-center gap-2 text-left"
                  >
                    <span className="hidden text-[11px] font-semibold tracking-[0.2em] text-white/60 tabular-nums group-aria-[current=true]:text-white sm:block">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="relative block h-[2px] w-full overflow-hidden bg-white/25">
                      {i === current ? (
                        <span
                          key={`p-${current}`}
                          className="absolute inset-0 origin-left bg-ember"
                          onAnimationEnd={() => {
                            // Hydration anında reduced-motion henüz okunmamış olabilir (animasyon ~0 sn sürer) → geçme.
                            if (!window.matchMedia(REDUCED).matches) go(current + 1);
                          }}
                          style={
                            autoplay
                              ? { animation: `hero-progress ${AUTOPLAY_MS}ms linear both`, animationPlayState: hovered ? "paused" : "running" }
                              : undefined
                          }
                        />
                      ) : i < current ? (
                        <span className="absolute inset-0 bg-white/60" />
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={autoplay ? "Otomatik geçişi durdur" : "Otomatik geçişi başlat"}
                className="flex h-12 w-12 items-center justify-center border border-white/25 transition-colors hover:border-ember hover:bg-ember hover:text-ink"
              >
                {autoplay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  go(current - 1);
                }}
                aria-label="Önceki slayt"
                className="flex h-12 w-12 items-center justify-center border border-white/25 transition-colors hover:border-ember hover:bg-ember hover:text-ink"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  go(current + 1);
                }}
                aria-label="Sonraki slayt"
                className="flex h-12 w-12 items-center justify-center border border-white/25 transition-colors hover:border-ember hover:bg-ember hover:text-ink"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
