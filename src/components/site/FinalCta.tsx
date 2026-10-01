import { Phone } from "lucide-react";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Velaris } from "@/components/ui/velaris";
import { HOME } from "@/content/home";
import { getSiteSettings, telHref, whatsappHref } from "@/lib/settings";

/** Közün ateş tonları (koyudan açığa) — Velaris arka planı. */
const FIRE: [string, string, string, string] = ["#1c0d06", "#5a2410", "#c2541a", "#f2a35c"];

/**
 * Sayfa sonu CTA: SYMC "Velaris" animasyonlu arka planı (WebGL, ekranda değilken durur, reduced-motion'da tek kare)
 * ateş paletinde; yuvarlak kenarlı kart olarak açık zemin içinde durur. Ana eylem Shiny Button (tek yerde).
 */
export async function FinalCta({ title, text, context }: { title?: string; text?: string; context?: string }) {
  const s = await getSiteSettings();
  const f = HOME.finalCta;
  const wa = whatsappHref(s, context);
  return (
    <section aria-labelledby="final-cta" className="bg-white px-3 py-12 sm:px-6 sm:py-16">
      <Velaris colors={FIRE} className="mx-auto max-w-[1480px] rounded-[2rem] text-white">
        <span aria-hidden="true" className="absolute inset-0 -z-[5] bg-black/25" />
        <div className="relative px-6 py-20 text-center sm:px-12 sm:py-24 lg:py-28">
          <span className="reveal inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.24em] text-glow uppercase backdrop-blur">
            {f.eyebrow}
          </span>
          <h2 id="final-cta" className="display-1 reveal mx-auto mt-6 max-w-4xl">
            {title ?? f.title}
          </h2>
          <p className="lead reveal mx-auto mt-7 max-w-2xl text-white/85">{text ?? f.text}</p>
          <div className="reveal mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ShinyButton href={f.primary.href}>{f.primary.label}</ShinyButton>
            {wa ? (
              <ArrowFillButton href={wa} tone="glass" external>
                WhatsApp ile yazın
              </ArrowFillButton>
            ) : (
              <ArrowFillButton href={f.secondary.href} tone="glass">
                {f.secondary.label}
              </ArrowFillButton>
            )}
          </div>
          {s.phone ? (
            <a href={telHref(s.phone)} className="mt-8 inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white">
              <Phone aria-hidden="true" className="h-4 w-4" /> {s.phone}
            </a>
          ) : null}
        </div>
      </Velaris>
    </section>
  );
}
