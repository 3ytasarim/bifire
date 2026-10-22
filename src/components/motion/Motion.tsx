"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, MotionConfig, useInView, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Sunucu bileşenlerinden kullanılabilen hareket yardımcıları (motion/react). Hepsi `prefers-reduced-motion`
 * tercihinde hareketsiz görünür; içerik SSR HTML'inde her zaman bulunur (SEO).
 */

/** Görünür alana girince yumuşak yukarı kayarak beliren blok. */
export function Reveal({ children, delay = 0, y = 28, className, as = "div" }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" | "section" }) {
  const M = as === "li" ? motion.li : as === "section" ? motion.section : motion.div;
  return (
    <MotionConfig reducedMotion="user">
      <M initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8, delay, ease: EASE }} className={className}>
        {children}
      </M>
    </MotionConfig>
  );
}

/** Çocukları sırayla beliren liste (kart ızgaraları için). `StaggerItem` ile birlikte kullanılır. */
export function Stagger({ children, className, as = "ul", gap = 0.08 }: { children: ReactNode; className?: string; as?: "ul" | "ol" | "div"; gap?: number }) {
  const M = as === "ol" ? motion.ol : as === "div" ? motion.div : motion.ul;
  return (
    <MotionConfig reducedMotion="user">
      <M initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }} className={className}>
        {children}
      </M>
    </MotionConfig>
  );
}

export function StaggerItem({ children, className, as = "li" }: { children: ReactNode; className?: string; as?: "li" | "div" }) {
  const M = as === "div" ? motion.div : motion.li;
  return (
    <M
      variants={{ hidden: { opacity: 0, y: 32, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: EASE } } }}
      whileHover={{ y: -6, transition: { duration: 0.3, ease: EASE } }}
      className={className}
    >
      {children}
    </M>
  );
}

/** Görünür alana girince 0'dan hedefe sayan sayı (yalnızca gerçek, sayfadaki veriden türetilen değerler için). */
export function CountUp({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, { duration: reduced ? 0 : 1.4, ease: EASE, onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [inView, value, reduced]);

  return (
    <span ref={ref} className={className}>
      {/* SSR ve JS'siz ortamda gerçek değer görünür; sayaç yalnızca istemcide oynar. */}
      <span className="sr-only">
        {value}
        {suffix}
      </span>
      <span aria-hidden="true">
        {inView || shown ? shown : value}
        {suffix}
      </span>
    </span>
  );
}

/** Geniş görsel bantları için yumuşak beliriş (ölçek/zoom yok — kullanıcı tercihi: titreşim yapıyordu). */
export function ParallaxFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 1.2, ease: EASE }} className={className}>
        {children}
      </motion.div>
    </MotionConfig>
  );
}
