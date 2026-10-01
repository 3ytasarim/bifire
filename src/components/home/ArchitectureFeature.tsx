import Image from "next/image";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { HOME } from "@/content/home";

/** Büyük görsel + içerik (açık tema): solda yuvarlak geniş mimari görsel, sağda çözüm tipleri. */
export function ArchitectureFeature({ image, imageAlt }: { image: string | null; imageAlt: string | null }) {
  const a = HOME.architecture;
  return (
    <section aria-labelledby="home-architecture" className="bg-paper py-20 sm:py-28 lg:py-36">
      <div className="shell grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="reveal relative lg:col-span-7">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-bone lg:aspect-[5/4]">
            {image ? (
              <Image src={image} alt={imageAlt || ""} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
            ) : (
              <span aria-hidden="true" className="ember-placeholder absolute inset-0" />
            )}
          </div>
          <div className="absolute -bottom-6 left-6 hidden max-w-xs rounded-2xl bg-white p-6 shadow-[0_24px_48px_-24px_rgb(12_12_13/0.35)] sm:block">
            <p className="eyebrow text-ember-ink">{a.eyebrow}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-steel">{a.intro}</p>
          </div>
        </div>
        <div className="lg:col-span-5">
          <p className="eyebrow reveal text-ember-ink sm:hidden">{a.eyebrow}</p>
          <h2 id="home-architecture" className="display-2 reveal mt-5 text-ink sm:mt-0">
            {a.title}
          </h2>
          <ul className="mt-10 space-y-3">
            {a.solutions.map((s, i) => (
              <li key={s.title} className="reveal group flex gap-5 rounded-2xl border border-linen bg-white p-5 transition-colors hover:border-ember/40">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper font-display text-sm font-semibold text-ember-ink transition-colors group-hover:bg-ember group-hover:text-ink">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">{s.title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-steel">{s.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="reveal mt-10">
            <ArrowFillButton href={a.cta.href} tone="ember">
              {a.cta.label}
            </ArrowFillButton>
          </div>
        </div>
      </div>
    </section>
  );
}
