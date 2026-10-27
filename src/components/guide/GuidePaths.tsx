"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { ArrowRight, ArrowUpRight, Compass, Flame, Hammer, House, Layers, LifeBuoy, PenTool, Trees, Zap } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";

const ICONS: Record<string, typeof House> = { ilk: House, yenileme: Hammer, tasarim: PenTool, mimar: Compass, destek: LifeBuoy, elektrikli: Zap, bahce: Trees, belgeler: Layers };
const EASE = [0.16, 1, 0.3, 1] as const;

export type PathPost = { href: string; title: string; category: string | null; image: string | null };
export type PathView = { key: string; label: string; title: string; text: string; next: { label: string; href: string }; posts: PathPost[] };

/**
 * "Size nasıl yardımcı olabiliriz?" — ihtiyaca göre okuma yolları. Sekmeye basınca yolun rehberleri numaralı
 * zaman çizelgesi olarak sırayla belirir; sonunda sonraki adım. Katı bir form akışı değildir, her adıma
 * doğrudan gidilebilir. Tüm bağlantılar gerçek <a>.
 */
export function GuidePaths({ paths }: { paths: PathView[] }) {
  const usable = paths.filter((p) => p.posts.length);
  const [active, setActive] = useState(usable[0]?.key ?? "");
  const id = useId();
  const path = usable.find((p) => p.key === active) ?? usable[0];
  if (!path) return null;

  return (
    <MotionConfig reducedMotion="user">
      <div role="tablist" aria-label="İhtiyacınıza göre başlangıç" className="-mx-4 grid auto-cols-[minmax(8.5rem,1fr)] grid-flow-col gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid-flow-row sm:grid-cols-4 sm:px-0 lg:grid-cols-8">
        {usable.map((p) => {
          const Icon = ICONS[p.key] ?? Flame;
          const on = p.key === path.key;
          return (
            <button
              key={p.key}
              type="button"
              role="tab"
              id={`${id}-tab-${p.key}`}
              aria-selected={on}
              aria-controls={`${id}-panel`}
              onClick={() => setActive(p.key)}
              className={`group relative isolate flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-center text-[13px] font-semibold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${
                on ? "border-ink text-white" : "border-white/70 bg-white/60 text-ink backdrop-blur-xl hover:border-ember/40"
              }`}
            >
              {on ? <motion.span layoutId={`${id}-tab`} transition={{ type: "spring", stiffness: 380, damping: 32 }} aria-hidden="true" className="absolute inset-0 -z-10 rounded-2xl bg-ink shadow-[0_20px_40px_-24px_rgb(40_42_40/0.6)]" /> : null}
              <Icon aria-hidden="true" className={`h-5 w-5 transition-transform duration-500 group-hover:-translate-y-0.5 ${on ? "text-ember" : "text-ember-ink"}`} strokeWidth={1.7} />
              <span className="leading-tight">{p.label}</span>
            </button>
          );
        })}
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${path.key}`} className="mt-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={path.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="grid gap-8 rounded-[1.75rem] border border-white/70 bg-white/55 p-6 shadow-[0_30px_60px_-40px_rgb(40_42_40/0.35)] backdrop-blur-xl sm:p-9 lg:grid-cols-12"
          >
            <div className="lg:col-span-4">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">Okuma yolu · {path.posts.length} rehber</p>
              <h3 className="mt-3 font-display text-2xl leading-snug font-semibold text-balance text-ink">{path.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-steel">{path.text}</p>
              <Link href={path.next.href} className="group mt-6 inline-flex min-h-12 items-center gap-3 rounded-full bg-ink pr-2 pl-6 text-[14px] font-semibold text-white transition-colors hover:bg-ember hover:text-white">
                {path.next.label}
                <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
            <ol className="relative space-y-3 lg:col-span-8">
              <span aria-hidden="true" className="absolute top-6 bottom-6 left-[1.35rem] w-px bg-gradient-to-b from-ember/60 via-sand to-transparent" />
              {path.posts.map((p, i) => (
                <motion.li key={p.href} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.08 + i * 0.07, ease: EASE }} className="relative">
                  <Link href={p.href} className="group flex items-center gap-4 rounded-2xl border border-transparent bg-white/70 p-2.5 pr-4 transition-[border-color,box-shadow] duration-300 hover:border-ember/40 hover:shadow-[0_16px_32px_-24px_rgb(40_42_40/0.4)]">
                    <span aria-hidden="true" className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ember/40 bg-white font-display text-sm font-semibold text-ember-ink tabular-nums transition-colors duration-300 group-hover:bg-ember group-hover:text-white">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="relative hidden h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-bone sm:block">
                      {p.image ? <Image src={p.image} alt="" fill sizes="80px" className="object-cover" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      {p.category ? <span className="block text-[10px] font-semibold tracking-[0.16em] text-stone uppercase">{p.category}</span> : null}
                      <span className="mt-0.5 block text-[15px] leading-snug font-semibold text-ink transition-colors group-hover:text-ember-ink">{p.title}</span>
                    </span>
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-ember-ink transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </motion.li>
              ))}
            </ol>
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
