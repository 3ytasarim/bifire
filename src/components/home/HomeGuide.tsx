import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Motion";
import { guideCategoryBySlug } from "@/content/guide";
import { routes } from "@/lib/catalog";
import type { PostCardData } from "@/lib/queries";
import { StudioEyebrow, StudioLink } from "./studio";

/** Şömine Rehberi: üç öne çıkan rehber — görsel, kategori, başlık, "Rehberi okuyun". */
export function HomeGuide({ posts }: { posts: PostCardData[] }) {
  if (!posts.length) return null;
  return (
    <section aria-labelledby="home-guide" className="section-pad bg-white">
      <div className="shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div>
            <StudioEyebrow no="06">Şömine rehberi</StudioEyebrow>
            <h2 id="home-guide" className="studio-h2 mt-4 text-ink">
              Şöminenizi Seçerken, Her Ayrıntıyı Bilerek İlerleyin.
            </h2>
            <p className="mt-4 text-[16px] text-steel">Seçim, tasarım, montaj ve kullanıma dair rehberler.</p>
          </div>
          <StudioLink href={routes.blog}>Tüm rehberleri inceleyin</StudioLink>
        </Reveal>
        <Stagger className="mt-8 grid gap-10 sm:grid-cols-2 sm:gap-6 lg:mt-10 lg:grid-cols-3" gap={0.08}>
          {posts.map((p) => {
            const cat = guideCategoryBySlug(p.category)?.name ?? p.tags[0]?.name;
            return (
              <StaggerItem key={p.id}>
                <article className="group relative flex h-full flex-col">
                  <div className="zoom-media relative aspect-[406/225] overflow-hidden rounded-2xl bg-bone">
                    {p.coverImage ? <Image src={p.coverImage} alt={p.coverImageAlt || p.title} fill sizes="(min-width: 1024px) 410px, (min-width: 640px) 50vw, 100vw" className="object-cover" /> : <span className="ember-placeholder absolute inset-0" />}
                  </div>
                  {cat ? <p className="studio-eyebrow mt-5 text-ember-ink">{cat}</p> : null}
                  <h3 className="mt-2.5 font-display text-[19px] leading-snug font-normal tracking-[-0.015em] text-ink">
                    <Link href={routes.post(p.slug)} className="after:absolute after:inset-0">
                      {p.title}
                    </Link>
                  </h3>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[14px] font-medium text-ember-ink">
                    <span className="link-underline group-hover:bg-[length:100%_1px]">Rehberi okuyun</span>
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
