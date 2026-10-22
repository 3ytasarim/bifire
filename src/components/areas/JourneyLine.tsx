"use client";

import { useRef } from "react";
import { motion, MotionConfig, useReducedMotion, useScroll, useSpring } from "motion/react";

/**
 * Proje yolculuğu: sayfa kaydırıldıkça adımları birleştiren çizgi turuncuyla dolar (scroll'a bağlı, zoom yok).
 * Masaüstünde yatay, mobilde dikey çizgi. Azaltılmış hareket tercihinde çizgi dolu gösterilir.
 */
export function JourneyLine({ steps }: { steps: { title: string; text: string }[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <MotionConfig reducedMotion="user">
      <ol ref={ref} className="relative grid gap-8 md:grid-cols-4 md:gap-6">
        <span aria-hidden="true" className="absolute top-0 bottom-0 left-[22px] w-px bg-sand md:top-[22px] md:right-[12%] md:bottom-auto md:left-[12%] md:h-px md:w-auto" />
        <motion.span
          aria-hidden="true"
          style={reduced ? undefined : { scaleY: progress }}
          className="absolute top-0 bottom-0 left-[22px] w-px origin-top bg-ember md:hidden"
        />
        <motion.span
          aria-hidden="true"
          style={reduced ? undefined : { scaleX: progress }}
          className="absolute top-[22px] right-[12%] left-[12%] hidden h-px origin-left bg-ember md:block"
        />
        {steps.map((s, i) => (
          <li key={s.title} className="relative flex gap-5 md:flex-col md:items-center md:text-center">
            <motion.span
              initial={{ backgroundColor: "rgb(255 255 255)" }}
              whileInView={{ backgroundColor: "rgb(224 105 31)" }}
              viewport={{ once: true, margin: "-35% 0px -35% 0px" }}
              transition={{ duration: 0.5 }}
              className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ember/40 font-display text-sm font-semibold text-ink tabular-nums"
            >
              {String(i + 1).padStart(2, "0")}
            </motion.span>
            <div>
              <h3 className="font-display text-xl font-semibold text-ink md:mt-5">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-steel">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </MotionConfig>
  );
}
