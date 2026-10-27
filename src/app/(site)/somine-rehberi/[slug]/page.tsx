import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { AreaToc } from "@/components/areas/AreaToc";
import { NEXT_STEPS, guideCategoryBySlug } from "@/content/guide";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PostCard, ProductCard } from "@/components/site/Cards";
import { FinalCta } from "@/components/site/FinalCta";
import { JsonLd } from "@/components/site/JsonLd";
import { RichText } from "@/components/site/RichText";
import { formatDate, readingMinutes, routes } from "@/lib/catalog";
import { getGuidePostsByNos, getPostBySlug, getRelatedPosts } from "@/lib/queries";
import { htmlToText } from "@/lib/sanitize";
import { getImageMeta } from "@/lib/seo/image-meta";
import { articleNode, breadcrumbNode, faqNode, graph, ids, imageNode, webPageNode, type Crumb } from "@/lib/seo/json-ld";
import { extractFaq, withHeadingIds } from "@/lib/html-sections";
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

  // İlgili rehberler: içerik haritasındaki üç öneri (yayındakiler); yoksa etiket benzerliği.
  const planned = await getGuidePostsByNos((post.relatedNos ?? "").split(",").map((x) => Number(x.trim())).filter(Boolean));
  const related = planned.length ? planned : await getRelatedPosts({ id: post.id, tagSlugs: post.tags.map((t) => t.slug) });
  const category = guideCategoryBySlug(post.category);
  const next = post.nextStep ? NEXT_STEPS[post.nextStep] : null;
  const body = withHeadingIds(post.content);
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
            <p className="flex flex-wrap items-center gap-2">
              {category ? (
                <Link href={routes.blogCategory(category.slug)} className="eyebrow text-ember-ink hover:text-ink">
                  {category.name}
                </Link>
              ) : null}
              {post.subtopic ? <span className="rounded-full border border-sand bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-stone uppercase">{post.subtopic}</span> : null}
            </p>
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
            <figure>
              <div className="relative aspect-[16/9] overflow-hidden rounded-[1.75rem] bg-linen">
                <Image src={post.coverImage} alt={post.coverImageAlt || post.title} fill priority sizes="(min-width: 1152px) 1100px, 100vw" className="object-cover" />
              </div>
            </figure>
          </div>
        ) : null}

        <div className="shell grid max-w-6xl gap-12 py-14 sm:py-20 lg:grid-cols-12">
          {body.toc.length > 2 ? (
            <aside className="hidden lg:col-span-4 lg:block">
              <div className="sticky top-32 rounded-2xl border border-white/70 bg-white/60 p-6 backdrop-blur-xl">
                <AreaToc items={body.toc} />
              </div>
            </aside>
          ) : null}
          <div className={body.toc.length > 2 ? "min-w-0 lg:col-span-8 [&_h2]:scroll-mt-32" : "min-w-0 lg:col-span-8 lg:col-start-3"}>
            <RichText html={body.html} />
            {next ? (
              <div className="mt-14 overflow-hidden rounded-[1.75rem] bg-ink p-7 text-white sm:p-9">
                <p className="eyebrow text-ember">Sonraki adım</p>
                <p className="mt-4 font-display text-2xl leading-snug font-semibold text-balance">{next.title}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-white/70">{next.text}</p>
                <Link href={next.cta.href} className="group mt-6 inline-flex min-h-12 items-center gap-3 rounded-full bg-ember pr-2 pl-6 text-[14px] font-semibold text-white transition-colors hover:bg-white">
                  {next.cta.label}
                  <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/10 transition-transform duration-300 group-hover:translate-x-0.5">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>
            ) : null}
          </div>
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
              İlgili rehberler
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
      {next ? null : <FinalCta />}
    </>
  );
}
