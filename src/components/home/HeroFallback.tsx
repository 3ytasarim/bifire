import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { HOME } from "@/content/home";

/** Admin'de henüz aktif slayt yokken gösterilen açık renkli hero (görselsiz; sıcak ışık dokusu). */
export function HeroFallback() {
  const f = HOME.fallbackHero;
  return (
    <section className="relative isolate flex min-h-[86svh] items-center overflow-hidden bg-paper">
      <span
        aria-hidden="true"
        className="absolute -right-48 -bottom-64 -z-10 h-[760px] w-[760px] rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.22),rgb(246_194_139/0.12)_40%,transparent_70%)]"
      />
      <div className="shell pt-32 pb-20">
        <div className="max-w-3xl">
          <h1 className="eyebrow animate-rise text-ember-ink">{HOME.heading}</h1>
          <p className="mt-6 animate-rise text-[13px] font-medium tracking-[0.18em] text-steel uppercase [animation-delay:60ms]">{f.eyebrow}</p>
          <p className="display-1 mt-5 animate-rise text-ink [animation-delay:120ms]">{f.title}</p>
          <p className="lead mt-6 max-w-xl animate-rise text-steel [animation-delay:180ms]">{f.description}</p>
          <div className="mt-10 flex animate-rise flex-col items-start gap-3 [animation-delay:240ms] sm:flex-row">
            <ArrowFillButton href={f.cta.href} tone="ember" size="lg">
              {f.cta.label}
            </ArrowFillButton>
            <ArrowFillButton href={f.secondary.href} tone="light" size="lg">
              {f.secondary.label}
            </ArrowFillButton>
          </div>
        </div>
      </div>
    </section>
  );
}
