"use client";

import Image from "next/image";
import { useRef } from "react";
import { Award, CheckCircle, Flame } from "lucide-react";
import { MotionConfig, motion, useScroll, useTransform } from "motion/react";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { LoopVideo } from "@/components/ui/loop-video";
import { HOME } from "@/content/home";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" as const } },
};

/**
 * Greek Harmony "AboutUsSection" deseninin birebir Bifire uyarlaması: ortalı başlık + ayraç, ortada
 * dikey çerçeveli video/görsel, iki yanında çözüm maddeleri, altta CTA kartı. Parallax arka plan
 * lekeleri ve yüzen rozetler; `MotionConfig reducedMotion="user"` ile hareket azaltma tercihine uyar.
 * (İstatistik sayaçları gerçek veri olmadan uydurulmaması için alınmadı.)
 */
export function ArchitectureFeature({ image, imageAlt, video }: { image: string | null; imageAlt: string | null; video: string | null }) {
  const a = HOME.architecture;
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 12]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -12]);

  const half = Math.ceil(a.solutions.length / 2);
  const left = a.solutions.slice(0, half);
  const right = a.solutions.slice(half);

  return (
    <MotionConfig reducedMotion="user">
      <section ref={sectionRef} aria-labelledby="home-architecture" className="relative w-full overflow-hidden bg-paper py-20 lg:py-28">
        {/* Dekoratif arka plan lekeleri */}
        <motion.div aria-hidden="true" style={{ y: y1, rotate: rotate1 }} className="pointer-events-none absolute -top-10 -left-16 h-64 w-64 rounded-full bg-ember/10 blur-3xl" />
        <motion.div aria-hidden="true" style={{ y: y2, rotate: rotate2 }} className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-ember/15 blur-3xl" />

        <div className="shell relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.span
              variants={itemVariants}
              className="inline-flex items-center gap-2 rounded-full border border-ember/30 bg-ember/5 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-ember-ink uppercase"
            >
              <Flame aria-hidden="true" className="h-3.5 w-3.5" />
              {a.eyebrow}
            </motion.span>

            <motion.h2 id="home-architecture" variants={itemVariants} className="display-2 mt-6 text-balance text-ink">
              {a.title}
            </motion.h2>

            <motion.div aria-hidden="true" variants={itemVariants} className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-ember to-transparent" />

            <motion.p variants={itemVariants} className="mt-6 text-base leading-relaxed text-steel">
              {a.intro}
            </motion.p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-3 lg:gap-8">
            {/* Sol sütun */}
            <div className="order-2 space-y-10 lg:order-1">
              {left.map((s, i) => (
                <ServiceItem key={s.title} title={s.title} description={s.text} delay={i * 0.1} direction="left" />
              ))}
            </div>

            {/* Orta: video / görsel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative order-1 mx-auto w-[calc(100%-2.5rem)] max-w-sm lg:order-2 lg:w-full lg:max-w-none"
            >
              <div className="relative">
                <div aria-hidden="true" className="absolute -inset-3 -z-10 rounded-[2rem] border border-ember/25" />
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-bone shadow-[0_30px_60px_-30px_rgb(12_12_13/0.35)]">
                  {image ? (
                    <Image src={image} alt={imageAlt || ""} fill sizes="(min-width: 1024px) 30vw, 90vw" className="object-cover" />
                  ) : (
                    <span aria-hidden="true" className="ember-placeholder absolute inset-0" />
                  )}
                  {video ? <LoopVideo src={video} /> : null}
                </div>
                <motion.div
                  aria-hidden="true"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-5 -right-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-ember/30 bg-white/90 text-ember-ink shadow-[0_18px_36px_-18px_rgb(255_106_26/0.55)] backdrop-blur"
                >
                  <Flame className="h-7 w-7" strokeWidth={1.6} />
                </motion.div>
                <motion.div
                  aria-hidden="true"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-5 -left-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-ink/15 bg-white/90 text-ink shadow-[0_18px_36px_-18px_rgb(12_12_13/0.4)] backdrop-blur"
                >
                  <Award className="h-7 w-7" strokeWidth={1.6} />
                </motion.div>
              </div>
            </motion.div>

            {/* Sağ sütun */}
            <div className="order-3 space-y-10">
              {right.map((s, i) => (
                <ServiceItem key={s.title} title={s.title} description={s.text} delay={i * 0.1} direction="right" />
              ))}
            </div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="mt-20 flex flex-col items-center justify-between gap-6 rounded-3xl border border-linen bg-white/70 p-8 backdrop-blur md:flex-row md:p-10"
          >
            <div className="text-center md:text-left">
              <h3 className="font-display text-2xl font-semibold text-ink">{a.ctaTitle}</h3>
              <p className="mt-2 text-sm text-steel">{a.ctaText}</p>
            </div>
            <ArrowFillButton href={a.cta.href} tone="ember">
              {a.cta.label}
            </ArrowFillButton>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}

function ServiceItem({ title, description, delay, direction }: { title: string; description: string; delay: number; direction: "left" | "right" }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: direction === "left" ? -24 : 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={`group ${direction === "right" ? "lg:text-left" : "lg:text-right"}`}
    >
      <div className={`flex items-center gap-3 ${direction === "right" ? "" : "lg:flex-row-reverse"}`}>
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ember/25 bg-ember/5 text-ember-ink transition-colors duration-300 group-hover:bg-ember group-hover:text-ink"
        >
          <CheckCircle className="h-5 w-5" />
        </span>
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-steel">{description}</p>
    </motion.div>
  );
}
