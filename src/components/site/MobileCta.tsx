"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";

/**
 * Mobilde alttan kayan sabit çağrı çubuğu: sayfanın üst kısmı geçilince görünür, hedef form (`targetId`)
 * ekrana girince gizlenir. Masaüstünde gösterilmez (sağ sütun zaten yapışkan).
 */
export function MobileCta({ label, targetId = "teklif", note }: { label: string; targetId?: string; note?: string }) {
  const [pastTop, setPastTop] = useState(false);
  const [atTarget, setAtTarget] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastTop(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const target = document.getElementById(targetId);
    const io = target ? new IntersectionObserver(([e]) => setAtTarget(Boolean(e?.isIntersecting)), { rootMargin: "0px 0px -20% 0px" }) : null;
    if (target && io) io.observe(target);
    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, [targetId]);

  const visible = pastTop && !atTarget;

  // Sabit WhatsApp düğmesi çubuğun üstüne kalksın (globals.css: html[data-mobile-cta] .wa-float).
  useEffect(() => {
    const root = document.documentElement;
    if (visible) root.dataset.mobileCta = "1";
    else delete root.dataset.mobileCta;
    return () => {
      delete root.dataset.mobileCta;
    };
  }, [visible]);
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {visible ? (
          <motion.div
            initial={{ y: 96, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 96, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-linen bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_30px_-18px_rgb(40_42_40/0.35)] backdrop-blur lg:hidden"
          >
            <a href={`#${targetId}`} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-ember px-6 text-[15px] font-semibold text-white">
              {label} <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
            {note ? <p className="mt-1.5 text-center text-[12px] text-stone">{note}</p> : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </MotionConfig>
  );
}
