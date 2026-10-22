import type { Metadata } from "next";
import { guideCategoryBySlug } from "@/content/guide";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PostCard, ProductCard } from "@/components/site/Cards";
import { FinalCta } from "@/components/site/FinalCta";
import { JsonLd } from "@/components/site/JsonLd";
import { RichText } from "@/components/site/RichText";
import { formatDate, readingMinutes, routes } from "@/lib/catalog";
import { getPostBySlug, getRelatedPosts } from "@/lib/queries";
import { htmlToText } from "@/lib/sanitize";
import { getImageMeta } from "@/lib/seo/image-meta";
import { articleNode, breadcrumbNode, faqNode, graph, ids, imageNode, webPageNode, type Crumb } from "@/lib/seo/json-ld";
import { extractFaq } from "@/lib/html-sections";
import { buildEntityMetadata, deriveDescription } from "@/lib/seo/metadata";

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPostBySlug(slug);
  if (!p) return {};
  return buildEntityMetadata({
    name: p.title,
    path: routes.post(p.slug),
    seo: p,
    fallbackDescription: [p.excerpt, p.content],
    image: p.coverImage,
    imageAlt: p.coverImageAlt || p.title,
    type: "article",
    publishedTime: p.publishedAt,
    modifiedTime: p.updatedAt,
  });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts({ id: post.id, tagSlugs: post.tags.map((t) => t.slug) });
  const path = routes.post(post.slug);
  const crumbs: Crumb[] = [
    { name: "Ana Sayfa", path: "/" },
    { name: "Şömine Rehberi", path: routes.blog },
    ...(guideCategoryBySlug(post.category) ? [{ name: guideCategoryBySlug(post.category)!.name, path: routes.blogCategory(post.category!) }] : []),
    { name: post.title, path },
  ];
  const text = htmlToText(post.content);
  const description = post.metaDescription || deriveDescription(post.excerpt, post.content);
  const coverMeta = post.coverImage ? await getImageMeta(post.coverImage) : null;

  return (
    <>
      <JsonLd
        data={graph(
          post.coverImage ? imageNode(path, { url: post.coverImage, alt: post.coverImageAlt || post.title, meta: coverMeta }) : null,
          webPageNode({
            path,
            name: post.title,
            description,
            hasBreadcrumb: true,
            hasPrimaryImage: Boolean(post.coverImage),
            mainEntityId: ids.article(path),
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
          }),
          breadcrumbNode(path, crumbs),
          articleNode({
            path,
            headline: post.title,
            description,
            image: post.coverImage,
            authorName: post.author,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            keywords: post.tags.map((t) => t.name),
            wordCount: text ? text.split(/\s+/).length : undefined,
          }),
          faqNode(path, extractFaq(post.content)),
        )}
      />

      <article className="bg-paper">
        <header className="shell max-w-5xl pt-8 pb-12 sm:pt-10 sm:pb-16">
          <Breadcrumbs items={crumbs} />
          <div className="mt-12 sm:mt-16">
            {post.tags.length ? (
              <ul className="flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <li key={t.slug}>
                    <Link href={routes.blogTag(t.slug)} className="eyebrow text-ember-ink hover:text-ink">
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            <h1 className="display-1 mt-6">{post.title}</h1>
            {post.excerpt ? <p className="lead mt-8 max-w-3xl text-steel">{post.excerpt}</p> : null}
            <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px] tracking-[0.1em] text-stone uppercase">
              {post.author ? <span>{post.author}</span> : null}
              {post.publishedAt ? <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time> : null}
              {text ? <span>{readingMinutes(text)} dk okuma</span> : null}
            </p>
          </div>
        </header>

        {post.coverImage ? (
          <div className="shell max-w-6xl">
            <div className="relative aspect-[16/9] bg-linen">
              <Image src={post.coverImage} alt={post.coverImageAlt || post.title} fill priority sizes="(min-width: 1152px) 1100px, 100vw" className="object-cover" />
            </div>
          </div>
        ) : null}

        <div className="shell max-w-3xl py-14 sm:py-20">
          <RichText html={post.content} />
        </div>
      </article>

      {post.products.length ? (
        <section aria-labelledby="ilgili-urunler" className="border-t border-sand bg-bone py-16 sm:py-24">
          <div className="shell">
            <h2 id="ilgili-urunler" className="display-3">
              Yazıda bahsi geçen ürünler
            </h2>
            <ul className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
              {post.products.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section aria-labelledby="ilgili-yazilar" className="bg-paper py-16 sm:py-24">
          <div className="shell">
            <h2 id="ilgili-yazilar" className="display-3">
              İlginizi çekebilir
            </h2>
            <ul className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.id}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
      <FinalCta />
    </>
  );
}
