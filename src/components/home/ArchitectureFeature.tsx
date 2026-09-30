import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HOME } from "@/content/home";

/** Büyük görsel + içerik: tam genişlikte mimari görsel, üzerinde çözüm tipleri paneli. */
export function ArchitectureFeature({ image, imageAlt }: { image: string | null; imageAlt: string | null }) {
  const a = HOME.architecture;
  return (
    <section aria-labelledby="home-architecture" className="relative isolate overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 -z-10">
        {image ? (
          <Image src={image} alt={imageAlt || ""} fill sizes="100vw" className="object-cover" />
        ) : (
          <span aria-hidden="true" className="ember-placeholder absolute inset-0" />
        )}
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
      </div>
      <div className="shell grid gap-14 py-24 sm:py-32 lg:grid-cols-12 lg:py-44">
        <div className="lg:col-span-6">
          <p className="eyebrow reveal text-amber">{a.eyebrow}</p>
          <h2 id="home-architecture" className="display-2 reveal mt-5">
            {a.title}
          </h2>
          <p className="lead reveal mt-7 max-w-xl text-white/75">{a.intro}</p>
          <Link href={a.cta.href} className="btn btn-ember reveal mt-10">
            {a.cta.label} <ArrowRight aria-hidden="true" className="btn-arrow h-4 w-4" />
          </Link>
        </div>
        <ul className="self-end border-t border-white/15 lg:col-span-5 lg:col-start-8">
          {a.solutions.map((s) => (
            <li key={s.title} className="reveal group border-b border-white/15 py-6">
              <h3 className="flex items-center gap-4 font-display text-xl font-semibold">
                <span aria-hidden="true" className="h-px w-6 bg-ember transition-all duration-500 group-hover:w-10" />
                {s.title}
              </h3>
              <p className="mt-2 pl-10 text-[15px] leading-relaxed text-white/65">{s.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
