import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Motion";
import { PostCard } from "@/components/site/Cards";
import { EmptyState } from "@/components/site/EmptyState";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { ShowroomBlock } from "@/components/site/ShowroomBlock";
import { Button3D } from "@/components/ui/button-3d";
import { categoryStats, GuideCategoryGrid } from "@/components/guide/GuideCategoryGrid";
import { GUIDE_CATEGORIES, guideCategoryBySlug } from "@/content/guide";
import { routes } from "@/lib/catalog";
import { getGuidePosts } from "@/lib/queries";
import { breadcrumbNode, graph, itemListNode, webPageNode } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDE_CATEGORIES.map((c) => ({ slug: c.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = guideCategoryBySlug((await params).slug);
  if (!c) return {};
  return buildMetadata({ title: `${c.name} Rehberi | Şömine Rehberi | Bifire`, description: c.intro, path: routes.blogCategory(c.slug), index: true, follow: true });
}

/** Rehber kategori sayfası: kategorinin tüm yazıları + diğer konular. */
export default async function GuideCategoryPage({ params }: Props) {
  const c = guideCategoryBySlug((await params).slug);
  if (!c) notFound();
  const [posts, all] = await Promise.all([getGuidePosts(c.slug), getGuidePosts()]);
  const { counts, covers } = categoryStats(all);
  const path = routes.blogCategory(c.slug);
  const crumbs = [
    { name: "Ana Sayfa", path: "/" },
    { name: "Şömine Rehberi", path: routes.blog },
    { name: c.name, path },
  ];
  const cover = covers[c.slug];

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path, name: `${c.name} Rehberi`, description: c.intro, type: "CollectionPage", hasBreadcrumb: true }),
          breadcrumbNode(path, crumbs),
          posts.length ? itemListNode(path, posts.map((p) => ({ name: p.title, path: routes.post(p.slug) }))) : null,
        )}
      />
      <PageHero crumbs={crumbs} eyebrow={`Şömine Rehberi · ${posts.length} rehber`} title={c.name} intro={c.intro} image={cover?.coverImage} imageAlt={cover?.coverImageAlt || c.name}>
        <Link href={routes.blog} className="inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold text-ink underline-offset-4 hover:underline">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Tüm konular
        </Link>
      </PageHero>

      <nav aria-label="Rehber konuları" className="bg-paper pb-10">
        <div className="shell">
          <GuideCategoryGrid counts={counts} covers={covers} current={c.slug} compact />
        </div>
      </nav>

      <section aria-label={`${c.name} rehberleri`} className="bg-paper pb-16 sm:pb-24">
        <div className="shell">
          {posts.length ? (
            <ul className="grid gap-x-8 gap-y-14 border-t border-sand pt-12 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <li key={p.id}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Bu konudaki rehberler hazırlanıyor" text="Sorunuzu ekibimize iletin; size doğrudan yanıt verelim." action={{ label: "Bize ulaşın", href: routes.contact }} />
          )}
        </div>
      </section>

      <section aria-labelledby="rehber-cta" className="relative overflow-hidden bg-ink py-16 text-white sm:py-20">
        <span aria-hidden="true" className="pointer-events-none absolute -top-32 -right-24 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.28),transparent_65%)]" />
        <Reveal className="shell relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-ember">Aradığınız yanıt burada yok mu?</p>
            <h2 id="rehber-cta" className="display-3 mt-5 text-white">
              Projenizi birlikte değerlendirelim.
            </h2>
          </div>
          <Button3D href={routes.quote} tone="ember" size="lg">
            Projenizi planlayın <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Button3D>
        </Reveal>
      </section>

      <ShowroomBlock />
    </>
  );
}
