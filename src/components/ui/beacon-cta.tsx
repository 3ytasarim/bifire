import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Dikkat çeken ana eylem düğmesi (header "Teklif Al"): dönen ışıklı kenar halkası, nabız atan işaret noktası,
 * aralıklarla dürten ok ve hover'da dolan turuncu. Animasyonlar CSS'tedir (globals.css › .beacon-cta);
 * azaltılmış hareket tercihinde durur. `tone="light"`: koyu/şeffaf header üzerinde.
 */
export function BeaconCta({ href, children, tone = "ink", className = "" }: { href: string; children: React.ReactNode; tone?: "ink" | "light"; className?: string }) {
  return (
    <Link href={href} className={`beacon-cta group shrink-0 outline-offset-4 ${className}`}>
      <span
        className={`relative inline-flex min-h-11 items-center gap-2.5 overflow-hidden rounded-full py-2 pr-5 pl-3.5 text-[13px] font-semibold tracking-[0.02em] whitespace-nowrap transition-colors duration-500 ${
          tone === "ink" ? "bg-ink text-white group-hover:text-ink" : "bg-ink/70 text-white backdrop-blur-md group-hover:text-ink"
        }`}
      >
        <span aria-hidden="true" className="absolute inset-0 -z-0 origin-left scale-x-0 rounded-full bg-ember transition-transform duration-500 ease-(--ease-premium) group-hover:scale-x-100" />
        <span aria-hidden="true" className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-ember opacity-75 motion-safe:animate-ping group-hover:bg-ink" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ember transition-colors duration-500 group-hover:bg-ink" />
        </span>
        <span className="relative">{children}</span>
        <ArrowRight aria-hidden="true" className="beacon-cta-arrow relative h-4 w-4" />
      </span>
    </Link>
  );
}
