import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { ParallaxFrame, Reveal } from "@/components/motion/Motion";
import { PageHero } from "@/components/site/PageHero";
import { ShowroomBlock } from "@/components/site/ShowroomBlock";
import { TrustPoints } from "@/components/site/TrustPoints";
import { Button3D } from "@/components/ui/button-3d";
import { familyOf } from "@/lib/collection";
import { routes } from "@/lib/catalog";
import type { ProductCardData } from "@/lib/queries";
import type { Crumb } from "@/lib/seo/json-ld";

export type CollectionCopy = {
  eyebrow: string;
  title: string;
  intro: string | null;
  pickTitle: string;
  pickText: string;
  /** Koyu "Bifire yaklaşımı" bandı (opsiyonel). */
  approachTitle?: string;
  approach?: string[];
};

/**
 * Koleksiyon kategori sayfası (Odunlu Şömineler, Bahçe ve Tamamlayıcı Ürünler…): ürün aileleri büyük, dönüşümlü
 * kartlarla; her kart ürün/aile sayfasına gider. Görseller ürünlerin mevcut kapak görselleridir.
 */
export function CollectionView({
  category,
  products,
  modelCounts,
  crumbs,
  copy,
  article,
}: {
  category: { name: string; image: string | null; imageAlt: string | null };
  products: ProductCardData[];
  modelCounts: Record<string, number>;
  crumbs: Crumb[];
  copy: CollectionCopy;
  /** Kategorinin uzun SEO metni (SeoArticle); koleksiyon ve yaklaşım bandından sonra gösterilir. */
  article?: React.ReactNode;
}) {
  return (
    <>
      <PageHero crumbs={crumbs} eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} image={category.image} imageAlt={category.imageAlt || category.name}>
        <a href="#koleksiyon" className="inline-flex min-h-12 items-center gap-2 text-[14px] font-semibold text-ink underline-offset-4 hover:underline">
          Koleksiyonu keşfedin <ArrowDown aria-hidden="true" className="h-4 w-4" />
        </a>
      </PageHero>

      <section aria-label="Tasarım, üretim ve montaj" className="bg-paper pb-10">
        <div className="shell">
          <TrustPoints />
        </div>
      </section>

      <section id="koleksiyon" aria-labelledby="koleksiyon-baslik" className="scroll-mt-28 bg-white py-16 sm:py-24">
        <div className="shell">
          <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="eyebrow text-ember-ink">{products.length} ürün ailesi · tek koleksiyon</p>
              <h2 id="koleksiyon-baslik" className="display-3 mt-5 text-balance">
                {copy.pickTitle}
              </h2>
            </div>
            <p className="text-[16px] leading-relaxed text-steel lg:col-span-5">{copy.pickText}</p>
          </Reveal>

          <ol className="mt-14 space-y-6 sm:space-y-8">
            {products.map((p, i) => {
              const f = familyOf(p);
              const count = modelCounts[p.id] ?? 0;
              return (
                <li key={p.id}>
                  <Reveal>
                    <article className="group relative grid overflow-hidden rounded-[1.75rem] border border-linen bg-paper transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgb(12_12_13/0.35)] md:grid-cols-12">
                      <div className={`relative aspect-[4/3] md:col-span-6 md:aspect-auto md:min-h-[22rem] ${i % 2 ? "md:order-2" : ""}`}>
                        {p.coverImage || p.conceptImage ? (
                          <ParallaxFrame className="absolute inset-0 overflow-hidden">
                            <Image src={(p.coverImage || p.conceptImage)!} alt={(p.coverImage ? p.coverImageAlt : p.conceptImageAlt) || p.name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                            {p.coverImage ? null : <span className="absolute right-4 bottom-4 rounded-full bg-ink/70 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">Temsili tasarım</span>}
                          </ParallaxFrame>
                        ) : (
                          <span aria-hidden="true" className="ember-placeholder absolute inset-0" />
                        )}
                      </div>
                      <div className="flex flex-col justify-center p-7 sm:p-10 md:col-span-6 lg:p-14">
                        <p className="text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">
                          {String(i + 1).padStart(2, "0")} · {f?.tag ?? p.category.name}
                        </p>
                        <h3 className="mt-4 font-display text-3xl leading-tight font-semibold text-ink sm:text-4xl">
                          <Link href={routes.product(p.slug)} className="after:absolute after:inset-0">
                            {f ? `${f.title}ler` : p.name}
                          </Link>
                        </h3>
                        {f ? <p className="mt-3 font-display text-lg font-semibold text-steel">{f.line}</p> : null}
                        <p className="mt-4 text-[15px] leading-relaxed text-steel">{f?.desc ?? p.shortDescription}</p>
                        <p className="mt-8 inline-flex items-center gap-2 text-[14px] font-semibold text-ink">
                          {count ? `${count} model · ` : ""}Koleksiyonu incele
                          <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white transition-colors duration-500 group-hover:bg-ember group-hover:text-ink">
                            <ArrowUpRight className="h-4 w-4" />
                          </span>
                        </p>
                      </div>
                    </article>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {copy.approach?.length ? (
      <section aria-labelledby="yaklasim" className="relative overflow-hidden bg-ink py-16 text-white sm:py-24">
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.25),transparent_65%)]" />
        <div className="shell relative grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow text-ember">Bifire yaklaşımı</p>
            <h2 id="yaklasim" className="display-3 mt-5 text-balance text-white">
              {copy.approachTitle}
            </h2>
          </Reveal>
          <Reveal className="space-y-5 text-[17px] leading-relaxed text-white/70 lg:col-span-7" delay={0.1}>
            {copy.approach.map((t) => (
              <p key={t.slice(0, 30)}>{t}</p>
            ))}
            <div className="pt-4">
              <Button3D href={routes.design} tone="ember" size="lg">
                Mekânınız için birlikte tasarlayalım <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Button3D>
            </div>
          </Reveal>
        </div>
      </section>
      ) : null}

      {article}

      <ShowroomBlock />
    </>
  );
}
