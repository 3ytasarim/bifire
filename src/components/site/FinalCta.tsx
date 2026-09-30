import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { HOME } from "@/content/home";
import { getSiteSettings, telHref, whatsappHref } from "@/lib/settings";
import { WhatsappIcon } from "./Icons";

/** Sayfa sonu CTA: teklif + (varsa) WhatsApp ve telefon. Ana sayfa ve iç sayfalarda ortak. */
export async function FinalCta({ title, text, context }: { title?: string; text?: string; context?: string }) {
  const s = await getSiteSettings();
  const f = HOME.finalCta;
  const wa = whatsappHref(s, context);
  return (
    <section aria-labelledby="final-cta" className="relative isolate overflow-hidden bg-ink py-24 text-white sm:py-32 lg:py-40">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-[70%] bg-[radial-gradient(60%_80%_at_50%_100%,rgb(224_105_31/0.38),transparent_70%)]"
      />
      <div className="shell text-center">
        <p className="eyebrow reveal justify-center text-amber">{f.eyebrow}</p>
        <h2 id="final-cta" className="display-1 reveal mx-auto mt-6 max-w-4xl">
          {title ?? f.title}
        </h2>
        <p className="lead reveal mx-auto mt-7 max-w-2xl text-white/70">{text ?? f.text}</p>
        <div className="reveal mt-12 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={f.primary.href} className="btn btn-ember">
            {f.primary.label} <ArrowRight aria-hidden="true" className="btn-arrow h-4 w-4" />
          </Link>
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light">
              <WhatsappIcon className="h-4 w-4" /> WhatsApp
            </a>
          ) : (
            <Link href={f.secondary.href} className="btn btn-ghost-light">
              {f.secondary.label}
            </Link>
          )}
          {s.phone ? (
            <a href={telHref(s.phone)} className="btn btn-ghost-light">
              <Phone aria-hidden="true" className="h-4 w-4" /> {s.phone}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
