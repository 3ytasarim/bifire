import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HOME } from "@/content/home";

/** Admin'de henüz aktif slayt yokken gösterilen statik hero (görselsiz, sıcak ışık dokusu). */
export function HeroFallback() {
  const f = HOME.fallbackHero;
  return (
    <section className="relative isolate flex h-[100svh] min-h-[600px] items-center overflow-hidden bg-ink text-white">
      <span aria-hidden="true" className="ember-placeholder absolute inset-0 -z-10" />
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(255_255_255/0.04)_1px,transparent_1px)] bg-[size:120px_100%]" />
      <div className="shell pt-28">
        <div className="max-w-3xl">
          <h1 className="eyebrow animate-rise text-amber">{HOME.heading}</h1>
          <p className="mt-6 animate-rise text-[13px] font-medium tracking-[0.18em] text-white/75 uppercase [animation-delay:60ms]">{f.eyebrow}</p>
          <p className="display-1 mt-5 animate-rise [animation-delay:120ms]">{f.title}</p>
          <p className="lead mt-6 max-w-xl animate-rise text-white/80 [animation-delay:180ms]">{f.description}</p>
          <div className="mt-10 flex animate-rise flex-col gap-3 [animation-delay:240ms] sm:flex-row">
            <Link href={f.cta.href} className="btn btn-ember">
              {f.cta.label} <ArrowRight aria-hidden="true" className="btn-arrow h-4 w-4" />
            </Link>
            <Link href={f.secondary.href} className="btn btn-ghost-light">
              {f.secondary.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
