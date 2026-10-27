import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Motion";
import type { NavCategory } from "@/components/site/HeaderBar";
import { StudioEyebrow, StudioLink } from "./studio";

/** Ana sayfada gösterilen üç koleksiyon (sıra önemli: ilki büyük görsel). */
const PICKS = [
  { slug: "odunlu-somineler", title: "Odunlu Şömineler" },
  { slug: "elektrikli-somineler", title: "Elektrikli Şömineler" },
  { slug: "bahce-ve-tamamlayici-urunler", title: "Dış Mekân" },
];

function CollectionCard({ c, title, big, delay }: { c: NavCategory; title: string; big?: boolean; delay: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <Link href={c.href} className="group flex h-full flex-col">
        <span className={`zoom-media relative block overflow-hidden rounded-2xl bg-bone ${big ? "aspect-[4/3] lg:aspect-auto lg:flex-1" : "aspect-[4/3] lg:aspect-auto lg:h-[210px]"}`}>
          {c.image ? (
            <Image
              src={c.image}
              alt={c.imageAlt || title}
              fill
              sizes={big ? "(min-width: 1024px) 680px, 100vw" : "(min-width: 1024px) 570px, 100vw"}
              className="object-cover"
            />
          ) : (
            <span className="ember-placeholder absolute inset-0" />
          )}
          <span aria-hidden="true" className="absolute inset-x-5 bottom-0 h-[2px] origin-left scale-x-0 bg-ember transition-transform duration-700 ease-(--ease-premium) group-hover:scale-x-100" />
        </span>
        <span className="flex items-center justify-between gap-4 pt-4">
          <h3 className="font-display text-[19px] font-normal tracking-[-0.02em] text-ink sm:text-[21px]">{title}</h3>
          <ArrowUpRight aria-hidden="true" className="h-5 w-5 shrink-0 text-ember-ink transition-transform duration-500 ease-(--ease-premium) group-hover:rotate-45" />
        </span>
      </Link>
    </Reveal>
  );
}

/**
 * Koleksiyonlar: solda büyük odunlu şömine görseli, sağda elektrikli ve dış mekân üst üste. Yoğun metin yok —
 * görsel + başlık + bağlantı. Kategoriler header mega menüsüyle aynı veriden gelir (aktif değilse atlanır).
 */
export function HomeCollections({ categories }: { categories: NavCategory[] }) {
  const items = PICKS.map((p) => ({ ...p, c: categories.find((c) => c.slug === p.slug) })).filter((x): x is typeof x & { c: NavCategory } => Boolean(x.c));
  if (!items.length) return null;
  const [first, ...rest] = items;
  return (
    <section aria-labelledby="home-collections" className="section-pad bg-paper">
      <div className="shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div>
            <StudioEyebrow no="01">Koleksiyonlar</StudioEyebrow>
            <h2 id="home-collections" className="studio-h2 mt-4 text-ink">
              Mekânınıza uygun şömineyi keşfedin.
            </h2>
          </div>
          <StudioLink href="/urunler">Tüm koleksiyonlar</StudioLink>
        </Reveal>
        <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[678fr_565fr] lg:gap-6">
          <CollectionCard c={first.c} title={first.title} big delay={0} />
          {rest.length ? (
            <div className="grid gap-8 lg:gap-6">
              {rest.map((x, i) => (
                <CollectionCard key={x.slug} c={x.c} title={x.title} delay={0.08 * (i + 1)} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
