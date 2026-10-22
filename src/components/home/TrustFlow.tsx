"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { ArrowUpRight, Factory, MapPin, Wrench } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "motion/react";
import { TRUST_POINTS } from "@/content/company";

const ICONS = [Factory, Wrench, MapPin];
const WORDS = ["Tasarım", "Üretim", "Montaj"];
const EASE = [0.16, 1, 0.3, 1] as const;

/** Kart üzerinde imleci izleyen yumuşak ışık (CSS değişkenleri; React yeniden çizimi yok). */
function spotlight(e: MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

/**
 * Ana sayfa güven bandı: "Tasarım / Üretim / Montaj" kelimeleri sırayla gelir; üç adım kartı bir akış çizgisiyle
 * bağlanır — çizgi görünüme girince çizilir, üzerinde ışık noktası dolaşır. Kartlarda imleci izleyen ışık,
 * ikon halkası ve alt çizgi animasyonu. Azaltılmış hareket tercihinde hareketler durur.
 */
export function TrustFlow() {
  const reduced = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user">
      <section aria-label="Tasarım, üretim ve montaj" className="relative overflow-hidden border-b border-linen bg-white py-12 sm:py-16">
        <span aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/3 h-80 w-[40rem] rounded-full bg-[radial-gradient(closest-side,rgb(224_105_31/0.08),transparent)]" />
        <div className="shell relative grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-stone uppercase">Tek elden</p>
            <p className="mt-3 font-display text-[1.65rem] leading-tight font-semibold text-ink">
              {WORDS.map((w, i) => (
                <motion.span
                  key={w}
                  initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ duration: 0.7, delay: i * 0.18, ease: EASE }}
                  className="inline-block"
                >
                  {w}
                  {i < WORDS.length - 1 ? <span className="px-1.5 text-ember">/</span> : null}
                </motion.span>
              ))}
            </p>
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.6, ease: EASE }}
              className="mt-4 block h-[2px] w-24 origin-left rounded-full bg-gradient-to-r from-ember to-ember/0"
            />
            <Link href="/hizmet-bolgeleri" className="group mt-5 inline-flex min-h-10 items-center gap-1.5 text-[13px] font-semibold text-ember-ink">
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-bottom-left bg-no-repeat pb-0.5 transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">Hizmet bölgelerimiz</span>
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="relative lg:col-span-9">
            {/* Akış çizgisi: masaüstünde kartların ikon hizasında yatay, mobilde solda dikey. */}
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1.2, ease: EASE }}
              className="absolute top-[3.1rem] right-[16%] left-[16%] hidden h-px origin-left bg-gradient-to-r from-ember/50 via-sand to-ember/50 sm:block"
            />
            {!reduced ? (
              <motion.span
                aria-hidden="true"
                className="absolute top-[3.1rem] hidden h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-ember shadow-[0_0_12px_3px_rgb(224_105_31/0.55)] sm:block"
                initial={{ left: "16%", opacity: 0 }}
                whileInView={{ left: ["16%", "84%"], opacity: [0, 1, 1, 0] }}
                viewport={{ once: false, amount: 0.6 }}
                transition={{ duration: 3.2, delay: 1.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.4 }}
              />
            ) : null}
            <ol className="relative grid gap-4 sm:grid-cols-3">
              {TRUST_POINTS.map((t, i) => {
                const Icon = ICONS[i]!;
                return (
                  <motion.li
                    key={t.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.7, delay: 0.2 + i * 0.15, ease: EASE }}
                  >
                    <article
                      onMouseMove={spotlight}
                      className="group relative h-full overflow-hidden rounded-[1.4rem] border border-linen bg-paper/60 p-6 text-center transition-[border-color,box-shadow,transform] duration-500 [--mx:50%] [--my:0%] hover:-translate-y-1 hover:border-ember/40 hover:shadow-[0_26px_50px_-30px_rgb(12_12_13/0.4)]"
                    >
                      <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(260px_circle_at_var(--mx)_var(--my),rgb(224_105_31/0.14),transparent_70%)]" />
                      <span aria-hidden="true" className="absolute top-4 right-5 font-display text-sm font-semibold text-sand tabular-nums transition-colors duration-500 group-hover:text-ember/60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span aria-hidden="true" className="relative mx-auto flex h-12 w-12 items-center justify-center">
                        <span className="absolute inset-0 rounded-full border border-dashed border-ember/40 transition-transform duration-[1.6s] ease-out group-hover:rotate-180" />
                        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-ember-ink shadow-[0_6px_16px_-8px_rgb(224_105_31/0.6)] transition-colors duration-500 group-hover:bg-ember group-hover:text-ink">
                          <Icon className="h-4 w-4" strokeWidth={1.8} />
                        </span>
                      </span>
                      <h3 className="relative mt-4 font-display text-lg font-semibold text-ink">{t.title}</h3>
                      <p className="relative mt-1.5 text-[14px] leading-relaxed text-steel">{t.text}</p>
                      <span aria-hidden="true" className="absolute inset-x-6 bottom-0 h-[2px] origin-center scale-x-0 rounded-full bg-ember transition-transform duration-700 ease-(--ease-premium) group-hover:scale-x-100" />
                    </article>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
