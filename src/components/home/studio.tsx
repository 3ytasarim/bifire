import { ArrowFillButton } from "@/components/ui/arrow-fill-button";

/** Ana sayfa bölüm bağlantısı: sitenin ortak ArrowFillButton bileşeni (açık zeminde light, koyu zeminde glass). */
export function StudioLink({ href, children, tone = "dark", className = "" }: { href: string; children: string; tone?: "dark" | "light"; className?: string }) {
  return (
    <ArrowFillButton href={href} tone={tone === "dark" ? "light" : "glass"} size="sm" className={className}>
      {children}
    </ArrowFillButton>
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
