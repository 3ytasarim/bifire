import Image from "next/image";
import type { Crumb } from "@/lib/seo/json-ld";
import { Breadcrumbs } from "./Breadcrumbs";

/**
 * İç sayfa başlığı (açık tema): sıcak kırık beyaz zemin, breadcrumb, tek H1. Görsel varsa sağda yuvarlak çerçeveli
 * fotoğraf (SYMC DecoratedImage deseni: ofset turuncu çizgi + yumuşak gölge); LCP için priority.
 */
export function PageHero({
  title,
  eyebrow,
  intro,
  crumbs,
  image,
  imageAlt,
  children,
}: {
  title: string;
  eyebrow?: string;
  intro?: string | null;
  crumbs: Crumb[];
  image?: string | null;
  imageAlt?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-paper">
      <span
        aria-hidden="true"
        className="absolute -top-40 -right-40 -z-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.14),transparent_65%)]"
      />
      <div className="shell relative pt-10 pb-14 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24">
        <Breadcrumbs items={crumbs} />
        <div className={`mt-10 grid items-center gap-12 lg:mt-14 ${image ? "lg:grid-cols-12" : ""}`}>
          <div className={image ? "lg:col-span-6" : "max-w-4xl"}>
            {eyebrow ? <p className="eyebrow animate-rise text-ember-ink">{eyebrow}</p> : null}
            <h1 className="display-1 mt-5 animate-rise text-ink [animation-delay:80ms]">{title}</h1>
            {intro ? <p className="lead mt-7 max-w-2xl animate-rise text-steel [animation-delay:160ms]">{intro}</p> : null}
            {children ? <div className="mt-9 animate-rise [animation-delay:240ms]">{children}</div> : null}
          </div>
          {image ? (
            <figure className="relative mx-3 animate-rise [animation-delay:120ms] lg:col-span-6 lg:mx-0 lg:ml-6">
              <span aria-hidden="true" className="absolute -inset-3 rounded-[2rem] border border-ember/40" />
              <span aria-hidden="true" className="absolute -inset-3 -z-10 translate-x-3 translate-y-3 rounded-[2rem] bg-gradient-to-br from-ember/15 to-transparent" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-bone shadow-[0_30px_60px_-30px_rgb(12_12_13/0.35)]">
                <Image src={image} alt={imageAlt || ""} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              </div>
            </figure>
          ) : null}
        </div>
      </div>
    </section>
  );
}
