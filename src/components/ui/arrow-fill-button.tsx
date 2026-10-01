import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ButtonHTMLAttributes, CSSProperties } from "react";

/**
 * 21st.dev "Arrow Fill Button" (hyperiux) — Mezbaha Teknolojileri uyarlamasından Bifire'a taşındı: sağda yuvarlak ok;
 * hover/odakta yuvarlak tüm düğmeyi doldurur, yazı clip-path ile ters renge döner, ok soldan kayarak girer.
 * Bifire tonları: ember (ateş turuncusu), ink (antrasit), light (beyaz, ince çerçeveli — açık zeminde ikincil eylem),
 * glass (görsel üzerinde yarı saydam).
 * Kullanım: yönlendiren eylemler (Ürünleri keşfet, Tüm ürünler, Detayları incele...).
 */
type Tone = "ember" | "ink" | "light" | "glass";
type Size = "sm" | "md" | "lg";

const TONES: Record<Tone, Record<string, string>> = {
  ember: { "--btn-bg": "#e0691f", "--btn-border": "#e0691f", "--btn-text": "#0c0c0d", "--btn-fill-bg": "#0c0c0d", "--btn-fill-text": "#ffffff" },
  ink: { "--btn-bg": "#0c0c0d", "--btn-border": "#0c0c0d", "--btn-text": "#ffffff", "--btn-fill-bg": "#e0691f", "--btn-fill-text": "#0c0c0d" },
  light: { "--btn-bg": "#ffffff", "--btn-border": "#d8d1c6", "--btn-text": "#0c0c0d", "--btn-fill-bg": "#0c0c0d", "--btn-fill-text": "#ffffff" },
  glass: { "--btn-bg": "rgb(255 255 255 / 0.12)", "--btn-border": "rgb(255 255 255 / 0.45)", "--btn-text": "#ffffff", "--btn-fill-bg": "#ffffff", "--btn-fill-text": "#0c0c0d" },
};

const SIZES: Record<Size, string> = {
  sm: "h-11 ps-5 text-[13px] [--icon-circle:2.125rem] [--icon-right:0.3125rem]",
  md: "h-12 ps-6 text-sm [--icon-circle:2.375rem] [--icon-right:0.3125rem]",
  lg: "h-14 ps-7 text-[15px] [--icon-circle:2.75rem] [--icon-right:0.375rem]",
};

type CommonProps = { children: string; tone?: Tone; size?: Size; fullWidth?: boolean; className?: string; srHint?: string };
type LinkProps = CommonProps & { href: string; external?: boolean };
type ButtonProps = CommonProps & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

const EASE = "duration-[450ms] ease-[cubic-bezier(0.785,0.135,0.15,0.86)] motion-reduce:transition-none";

export function ArrowFillButton(props: LinkProps | ButtonProps) {
  const { children, tone = "ember", size = "md", fullWidth = false, className = "", srHint } = props;

  const classes = [
    "group relative inline-flex cursor-pointer items-center overflow-hidden rounded-full border border-(--btn-border)",
    "bg-(--btn-bg) font-semibold leading-none tracking-[0.01em] whitespace-nowrap text-(--btn-text) outline-offset-4 backdrop-blur-sm",
    "pe-[calc(var(--icon-circle)+var(--icon-right)+1.125rem)]",
    "[--circle-inset-y:calc((100%-var(--icon-circle))/2)]",
    fullWidth ? "w-full justify-center" : "w-fit",
    SIZES[size],
    className,
  ].join(" ");

  const inner = (
    <>
      <span className="relative z-1 pb-px">{children}</span>
      {srHint ? <span className="sr-only"> {srHint}</span> : null}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute z-2 rounded-full bg-(--btn-fill-bg) inset-[var(--circle-inset-y)_var(--icon-right)_var(--circle-inset-y)_calc(100%-var(--icon-right)-var(--icon-circle))] transition-all ${EASE} group-hover:inset-0 group-focus-visible:inset-0`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-2 flex items-center ${fullWidth ? "justify-center" : ""} ps-[inherit] pe-[calc(var(--icon-circle)+var(--icon-right)+1.125rem)] font-semibold text-(--btn-fill-text) [clip-path:inset(var(--circle-inset-y)_var(--icon-right)_var(--circle-inset-y)_calc(100%-var(--icon-right)-var(--icon-circle)))] transition-all ${EASE} group-hover:[clip-path:inset(0_0_0_0)] group-focus-visible:[clip-path:inset(0_0_0_0)]`}
      >
        <span className="relative z-1 pb-px whitespace-nowrap">{children}</span>
      </span>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute end-[var(--icon-right)] top-1/2 z-3 inline-flex h-[var(--icon-circle)] w-[var(--icon-circle)] shrink-0 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-(--btn-fill-bg) text-(--btn-fill-text) transition-colors ${EASE}`}
        style={{ WebkitMaskImage: "-webkit-radial-gradient(white, black)", maskImage: "radial-gradient(white, black)" }}
      >
        <ArrowRight
          className={`absolute left-1/2 top-1/2 size-[1.05rem] -translate-x-[170%] -translate-y-1/2 scale-0 transition-transform ${EASE} group-hover:-translate-x-1/2 group-hover:scale-100 group-focus-visible:-translate-x-1/2 group-focus-visible:scale-100`}
          strokeWidth={1.8}
        />
        <ArrowRight
          className={`absolute left-1/2 top-1/2 size-[1.05rem] -translate-x-1/2 -translate-y-1/2 transition-transform ${EASE} group-hover:translate-x-[70%] group-hover:scale-0 group-focus-visible:translate-x-[70%] group-focus-visible:scale-0`}
          strokeWidth={1.8}
        />
      </span>
    </>
  );

  const style = TONES[tone] as CSSProperties;

  if ("href" in props && props.href !== undefined) {
    const external = props.external || /^https?:\/\//.test(props.href);
    return external ? (
      <a href={props.href} target="_blank" rel="noopener noreferrer" className={classes} style={style}>
        {inner}
      </a>
    ) : (
      <Link href={props.href} className={classes} style={style}>
        {inner}
      </Link>
    );
  }

  const { children: _c, tone: _t, size: _s, fullWidth: _f, className: _cn, srHint: _h, ...rest } = props as ButtonProps;
  void [_c, _t, _s, _f, _cn, _h];
  return (
    <button type="button" {...rest} className={classes} style={style}>
      {inner}
    </button>
  );
}
