import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * 21st.dev "Button" (avanishverma4) — 3B "basılabilir" düğme; Mezbaha uyarlamasından taşındı. Alt kenarda kalın koyu
 * şerit (border-b-4 + 0 6px 0 gölge); hover'da hafif yükselir, basınca 4px aşağı çöker.
 * Bifire uyarlaması: framer-motion yerine saf CSS geçişleri (aynı görünüm, istemciye ek JS yok), sunucu bileşeni.
 * Kullanım: dönüşüm eylemleri (Teklif iste, Gönder).
 */
type Tone = "ember" | "ink" | "light";

const TONES: Record<Tone, string> = {
  ember: "bg-ember text-white border-[#5f4730] hover:bg-[#a3825e] [--edge:#5f4730] focus-visible:ring-amber",
  ink: "bg-ink text-white border-black hover:bg-graphite [--edge:#000000] focus-visible:ring-neutral-400",
  light: "bg-white text-ink border-sand hover:bg-paper [--edge:#d8d3c9] focus-visible:ring-neutral-300",
};

const SIZES = { md: "min-h-12 px-7 text-[15px]", lg: "min-h-14 px-9 text-base" } as const;

const BASE =
  "inline-flex select-none items-center justify-center gap-2 rounded-xl border-b-4 font-bold tracking-[0.01em] outline-none transition-[transform,box-shadow,background-color] duration-150 ease-out focus-visible:ring-4 [box-shadow:0_6px_0_0_var(--edge)] hover:-translate-y-0.5 hover:[box-shadow:0_8px_0_0_var(--edge)] active:translate-y-1 active:[box-shadow:0_2px_0_0_var(--edge)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 motion-reduce:transition-none";

type Common = { children: ReactNode; tone?: Tone; size?: keyof typeof SIZES; fullWidth?: boolean; className?: string };

export function Button3D(props: (Common & { href: string }) | (Common & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">)) {
  const { children, tone = "ember", size = "md", fullWidth = false, className = "" } = props;
  const cls = `${BASE} ${TONES[tone]} ${SIZES[size]} ${fullWidth ? "w-full" : ""} ${className}`;
  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    );
  }
  const { children: _c, tone: _t, size: _s, fullWidth: _f, className: _cn, href: _h, ...rest } = props;
  void [_c, _t, _s, _f, _cn, _h];
  return (
    <button type="button" {...rest} className={cls}>
      {children}
    </button>
  );
}
