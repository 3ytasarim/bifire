import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * Dikkat çeken ana eylem düğmesi (header CTA): dönen ışıklı kenar halkası, nabız atan işaret noktası,
 * aralıklarla dürten ok ve hover'da dolan bronz. Animasyonlar CSS'tedir (globals.css › .beacon-cta);
 * azaltılmış hareket tercihinde durur. `href` yoksa seçim rehberini açan düğme olur ([data-guide-open]).
 */
export function BeaconCta({ href, children, tone = "ink", className = "" }: { href?: string; children: React.ReactNode; tone?: "ink" | "light"; className?: string }) {
  const inner = (
    <span
      className={`relative inline-flex min-h-11 items-center gap-2.5 overflow-hidden rounded-full py-2 pr-5 pl-3.5 text-[13px] font-medium tracking-[0.01em] whitespace-nowrap ${
        tone === "ink" ? "bg-ink text-white" : "bg-ink/70 text-white backdrop-blur-md"
      }`}
    >
      <span aria-hidden="true" className="absolute inset-0 -z-0 origin-left scale-x-0 rounded-full bg-ember transition-transform duration-500 ease-(--ease-premium) group-hover:scale-x-100" />
      <span aria-hidden="true" className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-amber opacity-75 motion-safe:animate-ping group-hover:bg-white" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber transition-colors duration-500 group-hover:bg-white" />
      </span>
      <span className="relative">{children}</span>
      <ArrowUpRight aria-hidden="true" className="beacon-cta-arrow relative h-4 w-4" />
    </span>
  );
  if (!href) {
    return (
      <button type="button" data-guide-open="" aria-haspopup="dialog" className={`beacon-cta group shrink-0 cursor-pointer outline-offset-4 ${className}`}>
        {inner}
      </button>
    );
  }
  return (
    <Link href={href} className={`beacon-cta group shrink-0 outline-offset-4 ${className}`}>
      {inner}
    </Link>
  );
}
