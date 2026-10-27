import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/** Ana sayfa bölümleri için ince "metin + ↗" bağlantısı: hover'da alt çizgi dolar, ok çapraz kayar. */
export function StudioLink({ href, children, tone = "dark", className = "" }: { href: string; children: React.ReactNode; tone?: "dark" | "light"; className?: string }) {
  return (
    <Link
      href={href}
      className={`group inline-flex min-h-11 items-center gap-1.5 text-[14px] font-medium transition-colors ${
        tone === "dark" ? "text-ember-ink hover:text-ink" : "text-amber hover:text-white"
      } ${className}`}
    >
      <span className="link-underline">{children}</span>
      <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 ease-(--ease-premium) group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}

/** Numaralı bölüm etiketi: "02 / Tasarımın ardındaki uzmanlık". */
export function StudioEyebrow({ no, children, tone = "dark" }: { no?: string; children: React.ReactNode; tone?: "dark" | "light" }) {
  return (
    <p className={`studio-eyebrow ${tone === "dark" ? "text-ember-ink" : "text-amber"}`}>
      {no ? <span className="tabular-nums">{no} / </span> : null}
      {children}
    </p>
  );
}
