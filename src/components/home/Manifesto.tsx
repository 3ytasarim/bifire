import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HOME } from "@/content/home";

export function Manifesto({ image, imageAlt }: { image: string | null; imageAlt: string | null }) {
  const m = HOME.manifesto;
  return (
    <section aria-labelledby="home-manifesto" className="overflow-hidden bg-bone py-20 sm:py-28 lg:py-36">
      <div className="shell grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
        <div className="reveal relative lg:col-span-5">
          <div className="relative aspect-[4/5] bg-smoke">
            {image ? (
              <Image src={image} alt={imageAlt || "Bifire şömine uygulaması"} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            ) : (
              <span aria-hidden="true" className="ember-placeholder absolute inset-0" />
            )}
          </div>
          <span aria-hidden="true" className="absolute -right-4 -bottom-4 -z-0 hidden h-40 w-40 border border-ember/60 lg:block" />
        </div>
        <div className="lg:col-span-7">
          <p className="eyebrow reveal text-ember-ink">{m.eyebrow}</p>
          <h2 id="home-manifesto" className="display-2 reveal mt-5 text-ink">
            {m.title}
          </h2>
          <div className="reveal mt-8 max-w-2xl space-y-5 text-[17px] leading-relaxed text-steel">
            {m.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <dl className="mt-12 grid gap-8 border-t border-sand pt-10 sm:grid-cols-3">
            {m.pillars.map((p, i) => (
              <div key={p.title} className="reveal">
                <dt className="flex items-baseline gap-3 font-display text-lg font-semibold text-ink">
                  <span className="text-[12px] font-semibold text-ember-ink tabular-nums">0{i + 1}</span>
                  {p.title}
                </dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-steel">{p.text}</dd>
              </div>
            ))}
          </dl>
          <Link href={m.cta.href} className="btn btn-dark reveal mt-12">
            {m.cta.label} <ArrowRight aria-hidden="true" className="btn-arrow h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
