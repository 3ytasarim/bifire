import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * 21st.dev "Flow Button" (xubohuah) — Mezbaha Teknolojileri uyarlamasından taşındı: hap düğme; hover'da oklar yer
 * değiştirir (soldan girer, sağdan çıkar), köşeler hap → 12px'e döner, merkezden büyüyen ateş turuncusu dolgu kaplar.
 * Kullanım: header'daki sürekli görünen "Teklif Al".
 */
const EASE_ARROW = "duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none";

export function FlowButton({ href, text, tone = "ink", className = "" }: { href: string; text: string; tone?: "ink" | "light"; className?: string }) {
  const base =
    tone === "ink"
      ? "border-ink bg-ink text-white group-hover:text-ink"
      : "border-white/70 bg-white/10 text-white backdrop-blur-sm group-hover:text-ink";
  return (
    <Link
      href={href}
      className={`group relative inline-flex min-h-11 items-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] px-7 py-2.5 text-[13px] font-semibold tracking-[0.02em] outline-offset-4 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:rounded-xl hover:border-ember focus-visible:rounded-xl focus-visible:border-ember active:scale-[0.95] motion-reduce:transition-none ${base} ${className}`}
    >
      <ArrowRight aria-hidden="true" className={`absolute start-[-25%] z-[9] size-4 transition-all ${EASE_ARROW} group-hover:start-3.5 group-focus-visible:start-3.5`} />
      <span className="relative z-[1] -translate-x-2.5 transition-all duration-[800ms] ease-out group-hover:translate-x-2.5 group-focus-visible:translate-x-2.5 motion-reduce:transition-none">
        {text}
      </span>
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-ember opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:size-[220px] group-hover:opacity-100 group-focus-visible:size-[220px] group-focus-visible:opacity-100 motion-reduce:transition-none"
      />
      <ArrowRight aria-hidden="true" className={`absolute end-3.5 z-[9] size-4 transition-all ${EASE_ARROW} group-hover:end-[-25%] group-focus-visible:end-[-25%]`} />
    </Link>
  );
}
