import Image from "next/image";
import type { Crumb } from "@/lib/seo/json-ld";
import { Breadcrumbs } from "./Breadcrumbs";

/**
 * İç sayfa başlığı: koyu antrasit zemin, opsiyonel büyük görsel (LCP için priority), breadcrumb, tek H1.
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
    <section className="relative isolate overflow-hidden bg-anthracite text-white">
      {image ? (
        <>
          <Image src={image} alt={imageAlt || ""} fill priority sizes="100vw" className="-z-20 object-cover" />
          <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/65 to-ink/30" />
        </>
      ) : (
        <span aria-hidden="true" className="ember-placeholder absolute inset-0 -z-10 opacity-60" />
      )}
      <div className="shell relative pt-14 pb-16 sm:pt-20 sm:pb-20 lg:pt-28 lg:pb-28">
        <Breadcrumbs items={crumbs} tone="light" />
        <div className="mt-10 max-w-4xl lg:mt-14">
          {eyebrow ? <p className="eyebrow animate-rise text-amber">{eyebrow}</p> : null}
          <h1 className="display-1 mt-5 animate-rise [animation-delay:80ms]">{title}</h1>
          {intro ? <p className="lead mt-7 max-w-2xl animate-rise text-white/75 [animation-delay:160ms]">{intro}</p> : null}
          {children ? <div className="mt-9 animate-rise [animation-delay:240ms]">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
