import Image from "next/image";
import { guideCategoryBySlug } from "@/content/guide";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { formatDate, keyFacts, routes } from "@/lib/catalog";
import type { PostCardData, ProductCardData, ProjectCardData } from "@/lib/queries";

/**
 * Kart ailesi — 21st.dev "Project Card" (ravikatiyar162, Mezbaha uyarlaması) deseni: yuvarlak köşeli beyaz kart,
 * hover'da yukarı kalkma + gölge, görsel yakınlaşması, başlık rengi değişimi ve ok animasyonlu "devamı" bağlantısı.
 * Tüm kart tıklanabilir (başlık bağlantısı ::after ile kartı kaplar), tek bir erişilebilir bağlantı.
 */

function Placeholder({ label }: { label?: string }) {
  return (
    <span className="ember-placeholder absolute inset-0 flex items-end p-5">
      {label ? <span className="text-[11px] font-semibold tracking-[0.22em] text-stone uppercase">{label}</span> : null}
    </span>
  );
}

function MoreLink({ label }: { label: string }) {
  return (
    <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-ember-ink">
      {label}
      <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </span>
  );
}

export function ProductCard({ product, sizes = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw", priority }: { product: ProductCardData; sizes?: string; priority?: boolean }) {
  const facts = keyFacts(product).slice(0, 3);
  return (
    <article className="lift-card group relative flex h-full flex-col">
      <div className="zoom-media relative aspect-[4/5] bg-bone">
        {product.coverImage ? (
          <Image src={product.coverImage} alt={product.coverImageAlt || product.name} fill sizes={sizes} className="object-cover" {...(priority ? { priority: true } : {})} />
        ) : product.conceptImage ? (
          <>
            <Image src={product.conceptImage} alt={product.conceptImageAlt || product.name} fill sizes={sizes} className="object-cover" {...(priority ? { priority: true } : {})} />
            <span className="absolute right-4 bottom-4 rounded-full bg-ink/70 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">Temsili tasarım</span>
          </>
        ) : (
          <Placeholder label={product.category.name} />
        )}
        <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-ink backdrop-blur">
          {product.category.name}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl leading-snug font-semibold tracking-[-0.01em] text-ink transition-colors duration-300 group-hover:text-ember-ink">
          <Link href={routes.product(product.slug, product.category.slug)} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        {facts.length ? (
          <dl className="mt-4 flex flex-wrap gap-2">
            {facts.map((f) => (
              <div key={f.label} className="rounded-full bg-paper px-3 py-1.5 text-[12px]">
                <dt className="sr-only">{f.label}</dt>
                <dd className="font-medium text-graphite">{f.value}</dd>
              </div>
            ))}
          </dl>
        ) : product.shortDescription ? (
          <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-steel">{product.shortDescription}</p>
        ) : null}
        <MoreLink label="Detayları incele" />
      </div>
    </article>
  );
}

export function ProjectCard({ project, sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw", tall }: { project: ProjectCardData; sizes?: string; tall?: boolean }) {
  const meta = [project.location, project.projectType].filter(Boolean).join(" · ");
  return (
    <article className="lift-card group relative flex h-full flex-col">
      <div className={`zoom-media relative bg-bone ${tall ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
        {project.coverImage ? <Image src={project.coverImage} alt={project.coverImageAlt || project.title} fill sizes={sizes} className="object-cover" /> : <Placeholder label="Proje" />}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {meta ? (
          <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-stone">
            <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-ember" />
            {meta}
          </p>
        ) : null}
        <h3 className="mt-2 font-display text-xl leading-snug font-semibold text-ink transition-colors duration-300 group-hover:text-ember-ink">
          <Link href={routes.project(project.slug)} className="after:absolute after:inset-0">
            {project.title}
          </Link>
        </h3>
        {project.shortDescription ? <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-steel">{project.shortDescription}</p> : null}
        <MoreLink label="Projeyi incele" />
      </div>
    </article>
  );
}

export function PostCard({ post, sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" }: { post: PostCardData; sizes?: string }) {
  return (
    <article className="lift-card group relative flex h-full flex-col">
      <div className="zoom-media relative aspect-[16/10] bg-bone">
        {post.coverImage ? <Image src={post.coverImage} alt={post.coverImageAlt || post.title} fill sizes={sizes} className="object-cover" /> : <Placeholder label="Rehber" />}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-stone">
          {post.publishedAt ? <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time> : null}
          {guideCategoryBySlug(post.category)?.name ?? post.tags[0]?.name ? <span className="rounded-full bg-paper px-2.5 py-0.5 font-medium text-ember-ink">{guideCategoryBySlug(post.category)?.name ?? post.tags[0]?.name}</span> : null}
        </p>
        <h3 className="mt-3 font-display text-xl leading-snug font-semibold text-ink transition-colors duration-300 group-hover:text-ember-ink">
          <Link href={routes.post(post.slug)} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-steel">{post.excerpt}</p> : null}
        <MoreLink label="Yazıyı oku" />
      </div>
    </article>
  );
}

/** Kategori kartı: görsel üzerinde başlık (fotoğraf odaklı), yuvarlak köşe; hover'da ok rozeti turuncuya döner. */
export function CategoryCard({
  category,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  aspect = "aspect-[4/5]",
  priority,
}: {
  category: { name: string; slug: string; href?: string; image: string | null; imageAlt: string | null; description?: string | null; count?: number };
  sizes?: string;
  aspect?: string;
  priority?: boolean;
}) {
  return (
    <article className="group relative h-full">
      <div className={`zoom-media relative h-full rounded-2xl bg-bone ${aspect}`}>
        {category.image ? (
          <Image src={category.image} alt={category.imageAlt || category.name} fill sizes={sizes} className="object-cover" {...(priority ? { priority: true } : {})} />
        ) : (
          <Placeholder />
        )}
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white sm:p-7">
          <div>
            {typeof category.count === "number" && category.count > 0 ? (
              <p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] backdrop-blur">{category.count} model</p>
            ) : null}
            <h3 className="mt-3 font-display text-2xl leading-tight font-semibold sm:text-[1.7rem]">
              <Link href={category.href ?? routes.category(category.slug)} className="after:absolute after:inset-0">
                {category.name}
              </Link>
            </h3>
            {category.description ? <p className="mt-2 line-clamp-2 max-w-sm text-sm text-white/80">{category.description}</p> : null}
          </div>
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-ink transition-colors duration-500 group-hover:bg-ember"
          >
            <ArrowUpRight className="h-5 w-5 transition-transform duration-500 group-hover:rotate-45" />
          </span>
        </div>
      </div>
    </article>
  );
}
