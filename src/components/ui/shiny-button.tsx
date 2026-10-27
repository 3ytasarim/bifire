import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

/**
 * 21st.dev "Shiny Button" (hyperiux) — Mezbaha uyarlamasından taşındı: kenarlıkta dönen konik gradyan ışık; hover'da parlayan
 * kenar + nefes alan iç ışık + noktalı doku. Stiller globals.css `.shiny-btn`. Bifire: antrasit dolgu + ateş turuncusu ışık.
 * Kullanım: sayfa sonu ana dönüşüm eylemi (tek yerde — abartı yok).
 */
const STYLE = { "--shiny-fill": "#282a28", "--shiny-inset": "#1b1b1d", "--shiny-accent": "#92714e", "--shiny-accent-soft": "#d9b388" } as CSSProperties;

export function ShinyButton({ href, children, external }: { href: string; children: ReactNode; external?: boolean }) {
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="shiny-btn" style={STYLE}>
      <span>{children}</span>
    </a>
  ) : (
    <Link href={href} className="shiny-btn" style={STYLE}>
      <span>{children}</span>
    </Link>
  );
}
