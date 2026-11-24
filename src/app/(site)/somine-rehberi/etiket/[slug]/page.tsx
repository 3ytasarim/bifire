import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/site/Cards";
import { PageHero } from "@/components/site/PageHero";
import { Pagination } from "@/components/site/Pagination";
import { routes } from "@/lib/catalog";
import { getBlogTag, getPosts } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ sayfa?: string }> };

/** Etiket arşivleri indekslenir ve site haritasına girer; 2+. sayfalar self canonical (?sayfa=N). */
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const tag = await getBlogTag((await params).slug);
  if (!tag) return {};
  const page = Math.max(1, Number((await searchParams).sayfa) || 1);
  const suffix = page > 1 ? ` – Sayfa ${page}` : "";
  return buildMetadata({
    title: `${tag.name} yazıları${suffix} | Bifire Şömine Rehberi`,
    description: `Bifire Şömine Rehberi'nde "${tag.name}" etiketli yazılar${page > 1 ? ` (Sayfa ${page})` : ""}.`,
    path: page > 1 ? `${routes.blogTag(tag.slug)}?sayfa=${page}` : routes.blogTag(tag.slug),
  });
}

export default async function TagPage({ params, searchParams }: Props) {
  const tag = await getBlogTag((await params).slug);
  if (!tag) notFound();
  const page = Math.max(1, Number((await searchParams).sayfa) || 1);
  const { posts, pages } = await getPosts({ page, tagSlug: tag.slug });
  if (!posts.length) notFound();

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Ana Sayfa", path: "/" },
          { name: "Şömine Rehberi", path: routes.blog },
          { name: tag.name, path: routes.blogTag(tag.slug) },
        ]}
        eyebrow="Etiket"
        title={tag.name}
      />
      <section aria-label={`${tag.name} yazıları`} className="bg-paper py-16 sm:py-24">
        <div className="shell">
          <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <li key={p.id}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
          <Pagination basePath={routes.blogTag(tag.slug)} page={page} pages={pages} />
        </div>
      </section>
    </>
  );
}
