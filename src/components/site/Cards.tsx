import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDate, keyFacts, routes } from "@/lib/catalog";
import type { PostCardData, ProductCardData, ProjectCardData } from "@/lib/queries";

function Placeholder({ label }: { label?: string }) {
  return (
    <span className="ember-placeholder absolute inset-0 flex items-end p-5">
      {label ? <span className="text-[11px] font-semibold tracking-[0.24em] text-white/50 uppercase">{label}</span> : null}
    </span>
  );
}

/** Ürün kartı — e-ticaret kartı değil, mimari katalog kartı: büyük görsel, ad, 2–3 teknik değer. */
export function ProductCard({ product, sizes = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw", priority }: { product: ProductCardData; sizes?: string; priority?: boolean }) {
  const facts = keyFacts(product).slice(0, 3);
  return (
    <article className="group relative flex flex-col">
      <div className="zoom-media relative aspect-[4/5] bg-linen">
        {product.coverImage ? (
          <Image
            src={product.coverImage}
            alt={product.coverImageAlt || product.name}
            fill
            sizes={sizes}
            className="object-cover"
            {...(priority ? { priority: true } : {})}
          />
        ) : (
          <Placeholder label={product.category.name} />
        )}
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-stone uppercase">{product.category.name}</p>
        <h3 className="mt-2 font-display text-xl leading-snug font-semibold tracking-[-0.01em] text-ink">
          <Link href={routes.product(product.slug)} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        {facts.length ? (
          <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-sand pt-4 text-[13px]">
            {facts.map((f) => (
              <div key={f.label} className="flex gap-1.5">
                <dt className="text-stone">{f.label}</dt>
                <dd className="font-semibold text-ink">{f.value}</dd>
              </div>
            ))}
          </dl>
        ) : product.shortDescription ? (
          <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-steel">{product.shortDescription}</p>
        ) : null}
        <span className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-[0.18em] text-ember-ink uppercase">
          Detayları incele
          <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </article>
  );
}

export function ProjectCard({ project, sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw", tall }: { project: ProjectCardData; sizes?: string; tall?: boolean }) {
  return (
    <article className="group relative">
      <div className={`zoom-media relative bg-smoke ${tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
        {project.coverImage ? (
          <Image src={project.coverImage} alt={project.coverImageAlt || project.title} fill sizes={sizes} className="object-cover" />
        ) : (
          <Placeholder label="Proje" />
        )}
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-amber uppercase">
            {[project.location, project.projectType].filter(Boolean).join(" · ") || "Uygulama"}
          </p>
          <h3 className="mt-2 font-display text-2xl leading-tight font-semibold">
            <Link href={routes.project(project.slug)} className="after:absolute after:inset-0">
              {project.title}
            </Link>
          </h3>
        </div>
        <span
          aria-hidden="true"
          className="absolute top-5 right-5 flex h-11 w-11 items-center justify-center bg-bone text-ink opacity-0 transition-all duration-500 group-hover:opacity-100"
        >
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
}

export function PostCard({ post, sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" }: { post: PostCardData; sizes?: string }) {
  return (
    <article className="group relative flex flex-col">
      <div className="zoom-media relative aspect-[3/2] bg-linen">
        {post.coverImage ? (
          <Image src={post.coverImage} alt={post.coverImageAlt || post.title} fill sizes={sizes} className="object-cover" />
        ) : (
          <Placeholder label="Blog" />
        )}
      </div>
      <div className="pt-5">
        <p className="flex flex-wrap items-center gap-x-3 text-[12px] font-medium tracking-[0.12em] text-stone uppercase">
          {post.publishedAt ? <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time> : null}
          {post.tags[0] ? <span className="text-ember-ink">{post.tags[0].name}</span> : null}
        </p>
        <h3 className="mt-3 font-display text-xl leading-snug font-semibold text-ink">
          <Link href={routes.post(post.slug)} className="link-underline after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-steel">{post.excerpt}</p> : null}
      </div>
    </article>
  );
}

export function CategoryCard({
  category,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  aspect = "aspect-[4/5]",
  priority,
}: {
  category: { name: string; slug: string; image: string | null; imageAlt: string | null; description?: string | null; count?: number };
  sizes?: string;
  aspect?: string;
  priority?: boolean;
}) {
  return (
    <article className="group relative h-full">
      <div className={`zoom-media relative h-full bg-smoke ${aspect}`}>
        {category.image ? (
          <Image src={category.image} alt={category.imageAlt || category.name} fill sizes={sizes} className="object-cover" {...(priority ? { priority: true } : {})} />
        ) : (
          <Placeholder />
        )}
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent transition-opacity duration-700 group-hover:opacity-90" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white sm:p-8">
          <div>
            {typeof category.count === "number" && category.count > 0 ? (
              <p className="text-[11px] font-semibold tracking-[0.22em] text-amber uppercase">{category.count} model</p>
            ) : null}
            <h3 className="mt-2 font-display text-2xl leading-tight font-semibold sm:text-[1.7rem]">
              <Link href={routes.category(category.slug)} className="after:absolute after:inset-0">
                {category.name}
              </Link>
            </h3>
            {category.description ? <p className="mt-2 line-clamp-2 max-w-sm text-sm text-white/70">{category.description}</p> : null}
          </div>
          <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center border border-white/30 transition-colors duration-500 group-hover:border-ember group-hover:bg-ember group-hover:text-ink">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    </article>
  );
}
