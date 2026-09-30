import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/site/Cards";
import { EmptyState } from "@/components/site/EmptyState";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { Pagination } from "@/components/site/Pagination";
import { routes } from "@/lib/catalog";
import { getPosts } from "@/lib/queries";
import { breadcrumbNode, graph, itemListNode, webPageNode } from "@/lib/seo/json-ld";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { STATIC_PAGES } from "@/lib/seo/static-pages";

type Props = { searchParams: Promise<{ sayfa?: string }> };

function parsePage(raw?: string) {
  const n = Number(raw ?? 1);
  return Number.isInteger(n) && n > 0 ? n : NaN;
}

/** 2+. sayfalar noindex,follow: arama sonuçlarında sayfa 1 temsil eder, yazılar bağlantılarla keşfedilir. */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = parsePage((await searchParams).sayfa);
  return buildStaticPageMetadata("blog", page > 1 ? { index: false } : undefined);
}

const CRUMBS = [
  { name: "Ana Sayfa", path: "/" },
  { name: "Blog", path: routes.blog },
];

export default async function BlogPage({ searchParams }: Props) {
  const page = parsePage((await searchParams).sayfa);
  if (Number.isNaN(page)) notFound();
  const { posts, pages } = await getPosts({ page });
  if (page > pages) notFound();

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path: routes.blog, name: "Blog", description: STATIC_PAGES.blog.defaults.description, type: "CollectionPage", hasBreadcrumb: true }),
          breadcrumbNode(routes.blog, CRUMBS),
          posts.length ? itemListNode(routes.blog, posts.map((p) => ({ name: p.title, path: routes.post(p.slug) }))) : null,
        )}
      />
      <PageHero
        crumbs={CRUMBS}
        eyebrow="Blog & ilham"
        title="Şömine Rehberi"
        intro="Yakıt türlerinin karşılaştırmasından bakım ipuçlarına, doğru şömineyi seçmek ve uzun yıllar keyifle kullanmak için rehber yazılar."
      />
      <section aria-label="Blog yazıları" className="bg-paper py-16 sm:py-24">
        <div className="shell">
          {posts.length ? (
            <>
              <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((p) => (
                  <li key={p.id}>
                    <PostCard post={p} />
                  </li>
                ))}
              </ul>
              <Pagination basePath={routes.blog} page={page} pages={pages} />
            </>
          ) : (
            <EmptyState title="İlk yazılar hazırlanıyor" text="Şömine seçimi, yakıt türleri ve bakım üzerine rehberler çok yakında burada." />
          )}
        </div>
      </section>
    </>
  );
}
