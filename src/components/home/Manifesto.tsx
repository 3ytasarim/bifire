import { Flame, Gem, Ruler, Wrench } from "lucide-react";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { DecoratedImage } from "@/components/ui/decorated-image";
import { HOME } from "@/content/home";

export function Manifesto({ image, imageAlt }: { image: string | null; imageAlt: string | null }) {
  const m = HOME.manifesto;
  return (
    <section aria-labelledby="home-manifesto" className="overflow-hidden bg-paper py-20 sm:py-28 lg:py-36">
      <div className="shell grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
        <div className="reveal lg:col-span-5">
          <DecoratedImage src={image} alt={imageAlt || "Bifire şömine uygulaması"} icons={[Flame, Ruler, Wrench, Gem]} />
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
          <dl className="mt-12 grid gap-4 sm:grid-cols-3">
            {m.pillars.map((p, i) => (
              <div key={p.title} className="reveal rounded-2xl border border-linen bg-white p-6">
                <dt className="font-display text-lg font-semibold text-ink">
                  <span className="mb-3 block text-[12px] font-semibold text-ember tabular-nums">0{i + 1}</span>
                  {p.title}
                </dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-steel">{p.text}</dd>
              </div>
            ))}
          </dl>
          <div className="reveal mt-12">
            <ArrowFillButton href={m.cta.href} tone="ink">
              {m.cta.label}
            </ArrowFillButton>
          </div>
        </div>
      </div>
    </section>
  );
}
