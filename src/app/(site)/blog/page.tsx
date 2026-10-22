import type { Metadata } from "next";
import { ArrowDown, ArrowUpRight, Search } from "lucide-react";
import { Reveal } from "@/components/motion/Motion";
import { PostCard } from "@/components/site/Cards";
import { EmptyState } from "@/components/site/EmptyState";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { ShowroomBlock } from "@/components/site/ShowroomBlock";
import { Button3D } from "@/components/ui/button-3d";
import { categoryStats, GuideCategoryGrid } from "@/components/guide/GuideCategoryGrid";
import { GuideLibrary } from "@/components/guide/GuideLibrary";
import { routes } from "@/lib/catalog";
import { getGuidePosts } from "@/lib/queries";
import { breadcrumbNode, graph, itemListNode, webPageNode } from "@/lib/seo/json-ld";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { STATIC_PAGES } from "@/lib/seo/static-pages";
import { GUIDE_CATEGORIES } from "@/content/guide";

export const revalidate = 300;

type Props = { searchParams: Promise<{ ara?: string }> };

/** Arama sonucu (?ara=) ayrı bir sayfa değildir: canonical rehber ana sayfası, arama URL'leri noindex. */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = (await searchParams).ara;
  return buildStaticPageMetadata("blog", q ? { index: false } : undefined);
}

const CRUMBS = [
  { name: "Ana Sayfa", path: "/" },
  { name: "Şömine Rehberi", path: routes.blog },
];

/**
 * Şömine Rehberi ana sayfası: konu kategorileri → kategori sayfası (yazılar); öne çıkan yazılar; ihtiyaç/konu/arama
 * filtreli rehber kütüphanesi. Kategoriler src/content/guide.ts, yazının kategorisi admin'de seçilir.
 */
export default async function GuidePage({ searchParams }: Props) {
  const query = ((await searchParams).ara ?? "").slice(0, 80);
  const posts = await getGuidePosts();
  const { counts, covers } = categoryStats(posts);
  const featured = [...posts.filter((p) => p.featured), ...posts.filter((p) => !p.featured)].slice(0, 3);
  const library = posts.map((p) => ({ slug: p.slug, href: routes.post(p.slug), title: p.title, excerpt: p.excerpt, category: p.category }));

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path: routes.blog, name: "Şömine Rehberi", description: STATIC_PAGES.blog.defaults.description, type: "CollectionPage", hasBreadcrumb: true }),
          breadcrumbNode(routes.blog, CRUMBS),
          itemListNode(
            routes.blog,
            GUIDE_CATEGORIES.filter((c) => counts[c.slug]).map((c) => ({ name: `${c.name} rehberleri`, path: routes.blogCategory(c.slug) })),
          ),
        )}
      />
      <PageHero crumbs={CRUMBS} eyebrow="Bifire şömine" title="Şömine Rehberi" intro="Seçimden montaja, ilk kullanımdan bakıma. Evinize uygun şömineyi doğru sorularla keşfedin.">
        <form action={routes.blog} method="get" role="search" className="flex max-w-xl flex-col gap-3 sm:flex-row">
          <label className="relative block flex-1">
            <span className="sr-only">Rehberde ara</span>
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-stone" />
            <input
              type="search"
              name="ara"
              defaultValue={query}
              maxLength={80}
              placeholder="Ne öğrenmek istiyorsunuz? ör. baca, kaplama"
              className="block min-h-12 w-full rounded-full border border-sand bg-white pr-4 pl-11 text-[15px] text-ink outline-none placeholder:text-stone/70 focus:border-ink"
            />
          </label>
          <Button3D type="submit" tone="ink">
            Ara
          </Button3D>
        </form>
        <a href="#kutuphane" className="mt-4 inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold text-ink underline-offset-4 hover:underline">
          Nereden başlamalıyım? <ArrowDown aria-hidden="true" className="h-4 w-4" />
        </a>
      </PageHero>

      {posts.length ? (
        <>
          <section aria-labelledby="konular" className="bg-paper pb-16 sm:pb-24">
            <div className="shell">
              <Reveal className="mb-10 grid gap-4 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-7">
                  <p className="eyebrow text-ember-ink">Konular</p>
                  <h2 id="konular" className="display-3 mt-5">
                    Merak ettiğiniz konudan başlayın.
                  </h2>
                </div>
                <p className="text-[16px] leading-relaxed text-steel lg:col-span-5">Bir konu seçin; o başlıktaki tüm rehberleri tek sayfada inceleyin.</p>
              </Reveal>
              <GuideCategoryGrid counts={counts} covers={covers} />
            </div>
          </section>

          <section aria-labelledby="once-okuyun" className="border-y border-sand bg-white py-16 sm:py-24">
            <div className="shell">
              <Reveal>
                <p className="eyebrow text-ember-ink">Önce bunları okuyun</p>
                <h2 id="once-okuyun" className="display-3 mt-5">
                  Karar vermeden önce.
                </h2>
              </Reveal>
              <ul className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((p) => (
                  <li key={p.id}>
                    <PostCard post={p} />
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="kutuphane" aria-labelledby="kutuphane-baslik" className="scroll-mt-28 bg-paper py-16 sm:py-24">
            <div className="shell">
              <Reveal className="mb-10">
                <p className="eyebrow text-ember-ink">Rehber kütüphanesi</p>
                <h2 id="kutuphane-baslik" className="display-3 mt-5">
                  Size uygun rehberi bulun.
                </h2>
              </Reveal>
              <GuideLibrary posts={library} initialQuery={query} />
            </div>
          </section>

          <section aria-labelledby="yol-haritasi" className="relative overflow-hidden bg-ink py-16 text-white sm:py-20">
            <span aria-hidden="true" className="pointer-events-none absolute -top-32 -right-24 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.28),transparent_65%)]" />
            <Reveal className="shell relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow text-ember">Fikirden uygulamaya, adım adım</p>
                <h2 id="yol-haritasi" className="display-3 mt-5 text-white">
                  Şömine projenizin yol haritasını birlikte çıkaralım.
                </h2>
              </div>
              <Button3D href={routes.quote} tone="ember" size="lg">
                Projenizi planlayın <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Button3D>
            </Reveal>
          </section>
        </>
      ) : (
        <section className="bg-paper py-16">
          <div className="shell">
            <EmptyState title="İlk rehberler hazırlanıyor" text="Şömine seçimi, montaj ve bakım üzerine rehberler çok yakında burada." />
          </div>
        </section>
      )}

      <ShowroomBlock />
    </>
  );
}
