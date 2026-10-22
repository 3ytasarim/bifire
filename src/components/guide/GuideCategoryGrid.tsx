import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/Motion";
import { GUIDE_CATEGORIES } from "@/content/guide";
import { routes } from "@/lib/catalog";

type Cover = { coverImage: string | null; coverImageAlt: string | null; title: string };

/**
 * Rehber konu kartları. Görsel: kategorideki en güncel yazının kapağı (ayrı kategori görseli gerekmez).
 * `current` verilirse o kategori vurgulanır (kategori sayfasındaki "diğer konular" kullanımı için `compact`).
 */
export function GuideCategoryGrid({ counts, covers, current, compact }: { counts: Record<string, number>; covers: Record<string, Cover | undefined>; current?: string; compact?: boolean }) {
  const cats = GUIDE_CATEGORIES.filter((c) => (counts[c.slug] ?? 0) > 0);
  if (compact) {
    return (
      <ul className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <li key={c.slug}>
            <Link
              href={routes.blogCategory(c.slug)}
              aria-current={c.slug === current ? "page" : undefined}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[14px] font-semibold transition-colors ${c.slug === current ? "border-ink bg-ink text-white" : "border-sand bg-white text-ink hover:border-ink"}`}
            >
              {c.name}
              <span className={`text-[12px] tabular-nums ${c.slug === current ? "text-white/60" : "text-stone"}`}>{counts[c.slug]}</span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" gap={0.08}>
      {cats.map((c, i) => {
        const cover = covers[c.slug];
        return (
          <StaggerItem key={c.slug} className="h-full">
            <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-linen bg-white transition-shadow duration-500 hover:shadow-[0_24px_48px_-28px_rgb(12_12_13/0.35)]">
              <div className="relative aspect-[16/9] overflow-hidden bg-bone">
                {cover?.coverImage ? (
                  <Image src={cover.coverImage} alt="" fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover transition-transform duration-700 ease-(--ease-premium) group-hover:scale-[1.03]" />
                ) : null}
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
                <span className="absolute bottom-4 left-5 font-display text-5xl leading-none font-semibold text-white/90 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span aria-hidden="true" className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink transition-colors duration-500 group-hover:bg-ember">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-xl font-semibold text-ink">
                  <Link href={routes.blogCategory(c.slug)} className="after:absolute after:inset-0">
                    {c.name}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-steel">{c.intro}</p>
                <p className="mt-auto pt-5 text-[12px] font-semibold tracking-[0.16em] text-ember-ink uppercase tabular-nums">{counts[c.slug]} rehber</p>
              </div>
            </article>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}

/** Yazı listesinden kategori sayıları ve kapakları (en güncel yazı). Liste en günceli önce gelmeli değil; tarih karşılaştırılır. */
export function categoryStats(posts: (Cover & { category: string | null; publishedAt: Date | null })[]) {
  const counts: Record<string, number> = {};
  const covers: Record<string, Cover & { publishedAt: Date | null }> = {};
  for (const p of posts) {
    if (!p.category) continue;
    counts[p.category] = (counts[p.category] ?? 0) + 1;
    const cur = covers[p.category];
    if (p.coverImage && (!cur || (p.publishedAt?.getTime() ?? 0) > (cur.publishedAt?.getTime() ?? 0))) covers[p.category] = p;
  }
  return { counts, covers };
}
