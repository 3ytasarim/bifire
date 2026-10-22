import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Motion";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { EmptyState } from "@/components/site/EmptyState";
import { JsonLd } from "@/components/site/JsonLd";
import { Pagination } from "@/components/site/Pagination";
import { ShowroomBlock } from "@/components/site/ShowroomBlock";
import { Button3D } from "@/components/ui/button-3d";
import { GUIDE_CATEGORIES, guideCategoryBySlug } from "@/content/guide";
import { routes } from "@/lib/catalog";
import { getGuideCategoryPage, getGuidePosts, getGuidePostsByNos } from "@/lib/queries";
import { breadcrumbNode, graph, itemListNode, webPageNode } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDE_CATEGORIES.map((c) => ({ slug: c.slug }));
}

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ sayfa?: string; konu?: string }> };

/** Alt konu filtresi ve 2+. sayfalar noindex,follow (kopya liste adresleri dizine girmez); yazılar bağlantıyla keşfedilir. */
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const c = guideCategoryBySlug((await params).slug);
  if (!c) return {};
  const sp = await searchParams;
  const filtered = Boolean(sp.konu) || (Number(sp.sayfa) || 1) > 1;
  return buildMetadata({ title: `${c.name} Rehberi | Şömine Rehberi | Bifire`, description: c.intro, path: routes.blogCategory(c.slug), index: !filtered, follow: true });
}

/** Rehber kategori sayfası: merkez rehber, alt konu filtresi, 12'şerli sayfalanmış yazılar, diğer konular. */
export default async function GuideCategoryPage({ params, searchParams }: Props) {
  const c = guideCategoryBySlug((await params).slug);
  if (!c) notFound();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.sayfa) || 1);
  const subtopic = sp.konu ? String(sp.konu).slice(0, 80) : null;
  const [{ posts, total, pages, subtopics }, [hub], all] = await Promise.all([getGuideCategoryPage(c.slug, { page, subtopic }), getGuidePostsByNos([c.hub]), getGuidePosts()]);
  if (page > pages) notFound();
  const path = routes.blogCategory(c.slug);
  const crumbs = [
    { name: "Ana Sayfa", path: "/" },
    { name: "Şömine Rehberi", path: routes.blog },
    { name: c.name, path },
  ];
  const counts = Object.fromEntries(GUIDE_CATEGORIES.map((x) => [x.slug, all.filter((p) => p.category === x.slug).length]));
  const cover = hub?.coverImage ? hub : (posts.find((p) => p.coverImage) ?? null);
  const list = hub && !subtopic && page === 1 ? posts.filter((p) => p.id !== hub.id) : posts;
  const qs = (konu: string | null) => (konu ? `${path}?konu=${encodeURIComponent(konu)}` : path);

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path, name: `${c.name} Rehberi`, description: c.intro, type: "CollectionPage", hasBreadcrumb: true }),
          breadcrumbNode(path, crumbs),
          posts.length ? itemListNode(path, posts.map((p) => ({ name: p.title, path: routes.post(p.slug) }))) : null,
        )}
      />

      <section className="relative isolate overflow-hidden bg-ink text-white">
        {cover?.coverImage ? <Image src={cover.coverImage} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-55" /> : null}
        <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/75 to-ink/20" />
        <div className="shell pt-8 pb-14 sm:pt-10 sm:pb-20">
          <div className="[&_a]:text-white/70 [&_a:hover]:text-white [&_li]:text-white/90">
            <Breadcrumbs items={crumbs} />
          </div>
          <Reveal className="mt-12 max-w-2xl rounded-[1.75rem] border border-white/15 bg-white/[0.08] p-7 backdrop-blur-xl sm:mt-16 sm:p-10" y={20}>
            <p className="eyebrow text-ember">Şömine Rehberi · {total} rehber</p>
            <h1 className="display-2 mt-5 text-white">{c.name}</h1>
            <p className="mt-5 text-[17px] leading-relaxed text-white/75">{c.intro}</p>
            <Link href={routes.blog} className="mt-7 inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline">
              <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Tüm konular
            </Link>
          </Reveal>
        </div>
      </section>

      <nav aria-label="Rehber konuları" className="border-b border-sand bg-paper">
        <ul className="shell flex gap-2 overflow-x-auto py-4 [scrollbar-width:none]">
          {GUIDE_CATEGORIES.filter((x) => counts[x.slug]).map((x) => (
            <li key={x.slug} className="shrink-0">
              <Link
                href={routes.blogCategory(x.slug)}
                aria-current={x.slug === c.slug ? "page" : undefined}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[13px] font-semibold whitespace-nowrap transition-colors ${x.slug === c.slug ? "border-ink bg-ink text-white" : "border-sand bg-white text-ink hover:border-ink"}`}
              >
                {x.name}
                <span className={`text-[11px] tabular-nums ${x.slug === c.slug ? "text-ember" : "text-stone"}`}>{counts[x.slug]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {hub && !subtopic && page === 1 ? (
        <section aria-labelledby="merkez-rehber" className="bg-paper pt-12 sm:pt-16">
          <div className="shell">
            <Reveal>
              <Link href={routes.post(hub.slug)} className="group grid overflow-hidden rounded-[1.75rem] border border-linen bg-white transition-shadow duration-500 hover:shadow-[0_30px_60px_-34px_rgb(12_12_13/0.4)] md:grid-cols-12">
                <span className="relative block aspect-[16/10] bg-bone md:col-span-7 md:aspect-auto md:min-h-[20rem]">
                  {hub.coverImage ? <Image src={hub.coverImage} alt="" fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" /> : <span className="ember-placeholder absolute inset-0" />}
                </span>
                <span className="flex flex-col justify-center p-7 sm:p-10 md:col-span-5">
                  <span className="text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">Önce bunu okuyun</span>
                  <span id="merkez-rehber" className="mt-4 font-display text-2xl leading-snug font-semibold text-balance text-ink transition-colors group-hover:text-ember-ink sm:text-3xl">
                    {hub.title}
                  </span>
                  {hub.excerpt ? <span className="mt-4 line-clamp-3 text-[15px] leading-relaxed text-steel">{hub.excerpt}</span> : null}
                  <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-ink">
                    Rehberi okuyun <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </span>
              </Link>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section aria-label={`${c.name} rehberleri`} className="bg-paper py-12 sm:py-16">
        <div className="shell">
          {subtopics.length > 1 ? (
            <ul aria-label="Alt konular" className="mb-8 flex flex-wrap gap-2">
              <li>
                <Link href={qs(null)} aria-current={!subtopic ? "page" : undefined} className={`inline-flex min-h-10 items-center rounded-full border px-4 text-[13px] font-semibold ${!subtopic ? "border-ember bg-ember/10 text-ink" : "border-sand bg-white text-steel hover:border-ink hover:text-ink"}`}>
                  Tümü
                </Link>
              </li>
              {subtopics.map((s) => (
                <li key={s.name}>
                  <Link href={qs(s.name)} aria-current={subtopic === s.name ? "page" : undefined} className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-[13px] font-semibold ${subtopic === s.name ? "border-ember bg-ember/10 text-ink" : "border-sand bg-white text-steel hover:border-ink hover:text-ink"}`}>
                    {s.name} <span className="text-[11px] text-stone tabular-nums">{s.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          {list.length ? (
            <Stagger as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" gap={0.06}>
              {list.map((p) => (
                <StaggerItem key={p.id} className="h-full">
                  <Link href={routes.post(p.slug)} className="group flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-linen bg-white transition-[border-color,box-shadow] duration-500 hover:border-ember/40 hover:shadow-[0_24px_48px_-28px_rgb(12_12_13/0.35)]">
                    <span className="relative block aspect-[16/9] overflow-hidden bg-bone">
                      {p.coverImage ? <Image src={p.coverImage} alt="" fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover transition-transform duration-700 ease-(--ease-premium) group-hover:scale-[1.03]" /> : <span className="ember-placeholder absolute inset-0" />}
                      {p.subtopic ? <span className="absolute top-3 left-3 rounded-full border border-white/40 bg-white/70 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-ink uppercase backdrop-blur-md">{p.subtopic}</span> : null}
                    </span>
                    <span className="flex flex-1 flex-col p-5">
                      <span className="font-display text-[17px] leading-snug font-semibold text-ink transition-colors group-hover:text-ember-ink">{p.title}</span>
                      {p.excerpt ? <span className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-steel">{p.excerpt}</span> : null}
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-semibold text-ink">
                        Rehberi okuyun <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                      </span>
                    </span>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <EmptyState title="Bu konudaki rehberler hazırlanıyor" text="Sorunuzu ekibimize iletin; size doğrudan yanıt verelim." action={{ label: "Bize ulaşın", href: routes.contact }} />
          )}
          <Pagination basePath={subtopic ? qs(subtopic) : path} page={page} pages={pages} />
        </div>
      </section>

      <section aria-labelledby="rehber-cta" className="relative overflow-hidden bg-ink py-14 text-white sm:py-16">
        <span aria-hidden="true" className="pointer-events-none absolute -top-32 -right-24 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.28),transparent_65%)]" />
        <Reveal className="shell relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
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
