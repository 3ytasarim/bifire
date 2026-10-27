"use client";

import { getImageProps } from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";

export type HeroSlideData = {
  id: string;
  desktopImage: string | null;
  mobileImage: string | null;
  imageAlt: string | null;
  desktopVideo: string | null;
  mobileVideo: string | null;
  /** Mobilde yatay kırpma odağı (%). */
  focalX: number;
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

/** Slayt süresi: 7 sn sonra bir sonraki slayta geçilir (hover/odakta duraklar). */
const AUTOPLAY_MS = 7000;
const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

const POSITION: Record<HeroSlideData["textPosition"], { wrap: string; text: string; gradient: string }> = {
  LEFT: { wrap: "items-center justify-start", text: "text-left", gradient: "bg-gradient-to-r from-black/55 via-black/15 to-transparent" },
  CENTER: { wrap: "items-center justify-center", text: "text-center items-center", gradient: "bg-radial from-black/45 to-transparent" },
  RIGHT: { wrap: "items-center justify-end", text: "text-right items-end", gradient: "bg-gradient-to-l from-black/55 via-black/15 to-transparent" },
  BOTTOM_LEFT: { wrap: "items-end justify-start pb-28 sm:pb-32", text: "text-left", gradient: "bg-gradient-to-t from-black/65 via-black/10 to-transparent" },
};

/** Mobilde yatay görsel/video bu odakla kırpılır; masaüstünde ortalanır. */
const FOCAL_CLS = "object-cover [object-position:var(--fx)_50%] md:[object-position:50%_50%]";

/** Masaüstü + mobil görsel (art direction) — <picture>, Next görsel optimizasyonu korunur. */
function SlidePicture({ slide, first }: { slide: HeroSlideData & { desktopImage: string }; first: boolean }) {
  const common = { alt: first ? (slide.imageAlt ?? "") : "", sizes: "100vw", fill: true as const, ...(first ? { priority: true } : { loading: "lazy" as const }) };
  const desktop = getImageProps({ ...common, src: slide.desktopImage }).props;
  const mobile = slide.mobileImage ? getImageProps({ ...common, src: slide.mobileImage }).props : null;
  const { style, ...img } = desktop;
  return (
    <picture>
      {mobile ? <source media="(max-width: 767px)" srcSet={mobile.srcSet} sizes="100vw" /> : null}
      <source media="(min-width: 768px)" srcSet={desktop.srcSet} sizes="100vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt getImageProps'tan geliyor */}
      <img {...img} style={style} className={FOCAL_CLS} {...(first ? { fetchPriority: "high" as const } : {})} />
    </picture>
  );
}

const MOBILE = "(max-width: 767px)";

/**
 * Arka plan videosu. Kaynak yalnızca slayt ilk kez aktif olduğunda atanır (görünmeyen slaytın videosu indirilmez);
 * mobilde mobil video, yoksa masaüstü videosu. Görsel (kapak) altta durur, video oynamaya başlayınca yumuşakça
 * üstüne gelir. Hareketi azalt veya veri tasarrufu açıksa video hiç yüklenmez — yalnızca görsel kalır.
 * Slayt her aktif olduğunda video baştan başlar; pasifken durdurulur.
 */
function SlideVideo({ slide, active }: { slide: HeroSlideData; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);

  // Kaynak React state yerine doğrudan video elemanına atanır (harici sistem senkronizasyonu); ilk aktif olunca bir kez.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (!active) {
      v.pause();
      return;
    }
    if (!v.getAttribute("src")) {
      const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
      if (saveData || window.matchMedia(REDUCED).matches) return;
      const mobile = window.matchMedia(MOBILE).matches;
      const src = (mobile && slide.mobileVideo) || slide.desktopVideo || slide.mobileVideo;
      if (!src) return;
      v.src = src;
    }
    v.currentTime = 0;
    v.play().catch(() => {});
  }, [active, slide.desktopVideo, slide.mobileVideo]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setVisible(true)}
      className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${FOCAL_CLS} ${visible ? "opacity-100" : "opacity-0"}`}
    />
  );
}

/**
 * Ana sayfa hero slider'ı — Norm Yacht HeroSlider mantığı (otomatik geçiş, önceki/sonraki, çizgi göstergeler,
 * metin blokları sırayla giriş). SYMC/Mezbaha Next.js uyarlamalarındaki iyileştirmeler:
 * ilk slayt SSR + priority görsel (LCP), crossfade, durdur/oynat, reduced-motion, aria etiketleri.
 * Bifire: header altında ekranı dolduran (en fazla ~800px) banner, mobil görsel, metin konumu, overlay yoğunluğu,
 * açık birincil düğme + metin bağlantısı, numaralı slayt seçici + sayaç, kaydırma (swipe).
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
      className="relative isolate h-[calc(100svh-108px)] max-h-[800px] min-h-[540px] overflow-hidden bg-anthracite text-white lg:h-[calc(100svh-124px)]"
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
          {/* Ölçek/zoom yok: videolu slaytta dönüşüm, kareyi yeniden örnekleyip titreşime yol açıyordu. */}
          <div
            className="absolute inset-0 [filter:saturate(1.18)_contrast(1.06)_brightness(1.04)]"
            style={{ ["--fx" as string]: `${Math.min(100, Math.max(0, s.focalX))}%` }}
          >
            {s.desktopImage ? <SlidePicture slide={{ ...s, desktopImage: s.desktopImage }} first={i === 0} /> : null}
            {s.desktopVideo || s.mobileVideo ? <SlideVideo slide={s} active={i === current} /> : null}
          </div>
        </div>
      ))}
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-black transition-opacity duration-700" style={{ opacity: Math.min(90, Math.max(0, slide.overlay)) / 100 }} />
      <span aria-hidden="true" className={`absolute inset-0 -z-10 ${pos.gradient}`} />

      <div className={`shell flex h-full pt-10 ${pos.wrap}`}>
        <div className={`flex max-w-[780px] flex-col ${pos.text}`} aria-live={autoplay ? "off" : "polite"}>
          <h1 className="text-[11px] font-medium tracking-[0.18em] text-[#e6d8bf] uppercase">{heading}</h1>
          {slide.eyebrow ? (
            <p key={`e-${current}`} className={`eyebrow mt-4 text-white/70 ${animate}`}>
              {slide.eyebrow}
            </p>
          ) : null}
          <p
            key={`t-${current}`}
            className={`mt-5 font-display text-[2.4rem] leading-[1.04] font-normal tracking-[-0.038em] text-balance sm:text-[3.2rem] lg:text-[4.05rem] ${animate} [animation-delay:60ms]`}
          >
            {slide.title}
          </p>
          {slide.description ? (
            <p key={`d-${current}`} className={`mt-6 max-w-[510px] text-[15px] leading-relaxed text-white/80 ${animate} [animation-delay:140ms] ${slide.textPosition === "CENTER" ? "mx-auto" : ""} ${slide.textPosition === "RIGHT" ? "ml-auto" : ""}`}>
              {slide.description}
            </p>
          ) : null}
          {slide.ctaUrl || slide.secondaryCtaUrl ? (
            <div
              key={`c-${current}`}
              className={`mt-10 flex flex-col gap-3 sm:flex-row ${animate} [animation-delay:220ms] ${slide.textPosition === "CENTER" ? "items-center sm:justify-center" : slide.textPosition === "RIGHT" ? "items-end sm:justify-end" : "items-start"}`}
            >
              {slide.ctaUrl ? (
                <ArrowFillButton href={slide.ctaUrl} tone="ember" size="lg">
                  {slide.ctaText || "Ürünleri keşfet"}
                </ArrowFillButton>
              ) : null}
              {slide.secondaryCtaUrl ? (
                <ArrowFillButton href={slide.secondaryCtaUrl} tone="glass" size="lg">
                  {slide.secondaryCtaText || "Projenizi konuşalım"}
                </ArrowFillButton>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {count > 1 ? (
        <div className="absolute inset-x-0 bottom-0 z-10 pb-6 sm:pb-8">
          <div className="shell flex items-end gap-6">
            <ol className="flex flex-1 gap-4 sm:max-w-xs" aria-label="Slaytlar">
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
                    className="group flex h-11 w-full cursor-pointer flex-col justify-center gap-2 text-left"
                  >
                    <span className="text-[11px] font-medium tracking-[0.2em] text-white/55 tabular-nums transition-colors group-hover:text-white group-aria-[current=true]:text-white">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="relative block h-[2px] w-full overflow-hidden bg-white/25">
                      {i === current ? (
                        <span
                          key={`p-${current}`}
                          className="absolute inset-0 origin-left bg-amber"
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
            <div className="flex items-center gap-2">
              <p className="mr-3 hidden text-[12px] tracking-[0.16em] text-white/70 tabular-nums sm:block" aria-hidden="true">
                <span className="text-white">{String(current + 1).padStart(2, "0")}</span> / {String(count).padStart(2, "0")}
              </p>
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  go(current - 1);
                }}
                aria-label="Önceki slayt"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/35 bg-white/10 backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-ink"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={autoplay ? "Otomatik geçişi durdur" : "Otomatik geçişi başlat"}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/35 bg-white/10 backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-ink"
              >
                {autoplay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  go(current + 1);
                }}
                aria-label="Sonraki slayt"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/35 bg-white/10 backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-ink"
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
