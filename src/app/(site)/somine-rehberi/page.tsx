import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, BookOpen, Search } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Motion";
import { GuidePaths } from "@/components/guide/GuidePaths";
import { GuideLibrary } from "@/components/guide/GuideLibrary";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { EmptyState } from "@/components/site/EmptyState";
import { JsonLd } from "@/components/site/JsonLd";
import { ShowroomBlock } from "@/components/site/ShowroomBlock";
import { GUIDE_CATEGORIES, GUIDE_ESSENTIALS, GUIDE_PATHS, GUIDE_ROADMAP, guideCategoryBySlug } from "@/content/guide";
import { routes } from "@/lib/catalog";
import { getGuidePosts, type PostCardData } from "@/lib/queries";
import { breadcrumbNode, graph, itemListNode, webPageNode } from "@/lib/seo/json-ld";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { STATIC_PAGES } from "@/lib/seo/static-pages";

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

const byNo = (posts: PostCardData[], no: number) => posts.find((p) => p.guideNo === no) ?? null;

/**
 * Şömine Rehberi ana sayfası (130 makale planı): arama, ihtiyaca göre okuma yolları, altı konu, önce okunacaklar,
 * yol haritası, kütüphane, yeni/güncellenen rehberler ve showroom daveti. Cam (glass) yüzeyler, sıcak zemin.
 */
export default async function GuidePage({ searchParams }: Props) {
  const query = ((await searchParams).ara ?? "").slice(0, 80);
  const posts = await getGuidePosts();
  const counts = Object.fromEntries(GUIDE_CATEGORIES.map((c) => [c.slug, posts.filter((p) => p.category === c.slug).length]));
  const coverOf = (slug: string) => {
    const hub = byNo(posts, GUIDE_CATEGORIES.find((c) => c.slug === slug)!.hub);
    return (hub?.coverImage ? hub : posts.find((p) => p.category === slug && p.coverImage)) ?? null;
  };
  const hero = byNo(posts, 1)?.coverImage ? byNo(posts, 1)! : (posts.find((p) => p.coverImage) ?? null);
  const essentials = GUIDE_ESSENTIALS.map((n) => byNo(posts, n)).filter((p): p is PostCardData => Boolean(p));
  const featured = essentials.length >= 3 ? essentials : [...essentials, ...posts.filter((p) => !essentials.includes(p))].slice(0, 6);
  const roadmap = byNo(posts, GUIDE_ROADMAP.roadmap);
  const prep = byNo(posts, GUIDE_ROADMAP.showroomPrep);
  const latest = [...posts].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 3);
  const paths = GUIDE_PATHS.map((p) => ({
    key: p.key,
    label: p.label,
    title: p.title,
    text: p.text,
    next: p.next,
    posts: p.nos
      .map((n) => byNo(posts, n))
      .filter((x): x is PostCardData => Boolean(x))
      .map((x) => ({ href: routes.post(x.slug), title: x.title, category: guideCategoryBySlug(x.category)?.name ?? null, image: x.coverImage })),
  }));
  const library = posts.map((p) => ({ slug: p.slug, href: routes.post(p.slug), title: p.title, excerpt: p.excerpt, category: p.category, image: p.coverImage }));

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

      {/* Açılış: solda başlık + cam arama kutusu, sağda büyük görsel ve yüzen cam kartlar */}
      <section className="relative isolate overflow-hidden bg-paper">
        <span aria-hidden="true" className="pointer-events-none absolute -top-40 -left-40 -z-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.12),transparent_65%)]" />
        <div className="shell grid gap-10 pt-8 pb-14 sm:pt-10 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-20">
          <div className="lg:col-span-5">
            <Breadcrumbs items={CRUMBS} />
            <Reveal className="mt-10 lg:mt-14" y={18}>
              <p className="eyebrow text-ember-ink">Bifire şömine</p>
              <h1 className="display-1 mt-5 leading-[0.95]">Şömine Rehberi</h1>
              <p className="mt-6 font-display text-xl font-semibold text-ink">Seçimden montaja, ilk kullanımdan bakıma.</p>
              <p className="mt-3 max-w-md text-[16px] leading-relaxed text-steel">
                Şömine seçimi, tasarım, montaj ve kullanım hakkında ihtiyaç duyduğunuz bilgileri bir arada keşfedin; projenizi doğru sorularla planlayın.
              </p>
              <form action={routes.blog} method="get" role="search" className="mt-8 flex max-w-md items-center gap-2 rounded-full border border-white/80 bg-white/60 p-1.5 pl-5 shadow-[0_20px_40px_-28px_rgb(12_12_13/0.45)] backdrop-blur-xl focus-within:border-ink">
                <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-stone" />
                <label className="flex-1">
                  <span className="sr-only">Rehberde ara</span>
                  <input type="search" name="ara" defaultValue={query} maxLength={80} placeholder="Rehberde ne arıyorsunuz?" className="block min-h-11 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-stone/70" />
                </label>
                <button type="submit" className="min-h-11 shrink-0 rounded-full bg-ink px-5 text-[13px] font-semibold text-white transition-colors hover:bg-ember hover:text-ink">
                  Ara
                </button>
              </form>
              <a href="#yollar" className="mt-5 inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold text-ember-ink underline-offset-4 hover:underline">
                Nereden başlamalıyım? <ArrowDown aria-hidden="true" className="h-4 w-4" />
              </a>
            </Reveal>
          </div>
          <Reveal className="relative lg:col-span-7" delay={0.12} y={24}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-bone shadow-[0_40px_80px_-40px_rgb(12_12_13/0.45)] sm:aspect-[16/11]">
              {hero?.coverImage ? <Image src={hero.coverImage} alt={hero.coverImageAlt || ""} fill priority sizes="(min-width: 1024px) 56vw, 100vw" className="object-cover" /> : <span className="ember-placeholder absolute inset-0" />}
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 left-4 flex gap-3 sm:left-8">
              {[
                { value: posts.length, label: "rehber" },
                { value: GUIDE_CATEGORIES.filter((c) => counts[c.slug]).length, label: "konu" },
              ].map((s, i) => (
                <div key={s.label} className="rounded-2xl border border-white/70 bg-white/60 px-5 py-3.5 shadow-[0_20px_40px_-24px_rgb(12_12_13/0.5)] backdrop-blur-xl motion-safe:animate-float" style={{ animationDelay: `${i * -2.5}s` }}>
                  <p className="font-display text-3xl leading-none font-semibold text-ink tabular-nums">
                    {s.value}
                    <span className="text-ember">.</span>
                  </p>
                  <p className="mt-1 text-[11px] font-semibold tracking-[0.16em] text-stone uppercase">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="absolute top-4 right-4 rounded-full border border-white/30 bg-ink/40 px-3 py-1 text-[10px] font-medium tracking-[0.08em] text-white/85 backdrop-blur-md">Temsili görsel</p>
          </Reveal>
        </div>
      </section>

      {posts.length ? (
        <>
          <section id="yollar" aria-labelledby="yollar-baslik" className="relative scroll-mt-28 overflow-hidden bg-[linear-gradient(180deg,var(--color-paper),var(--color-bone))] py-16 sm:py-24">
            <span aria-hidden="true" className="pointer-events-none absolute top-10 right-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.12),transparent_65%)]" />
            <div className="shell relative">
              <Reveal className="mb-10">
                <p className="eyebrow text-ember-ink">İhtiyaca göre başlangıç</p>
                <h2 id="yollar-baslik" className="display-3 mt-5">
                  Size nasıl yardımcı olabiliriz?
                </h2>
              </Reveal>
              <GuidePaths paths={paths} />
            </div>
          </section>

          <section aria-labelledby="konular" className="bg-white py-16 sm:py-24">
            <div className="shell">
              <Reveal className="mb-10 grid gap-4 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-7">
                  <p className="eyebrow text-ember-ink">Altı konu</p>
                  <h2 id="konular" className="display-3 mt-5">
                    Merak ettiğiniz konudan başlayın.
                  </h2>
                </div>
              </Reveal>
              <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" gap={0.08}>
                {GUIDE_CATEGORIES.filter((c) => counts[c.slug]).map((c) => {
                  const cover = coverOf(c.slug);
                  return (
                    <StaggerItem key={c.slug} className="h-full">
                      <Link href={routes.blogCategory(c.slug)} className="group relative block aspect-[4/3] overflow-hidden rounded-[1.6rem] bg-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember">
                        {cover?.coverImage ? <Image src={cover.coverImage} alt="" fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover transition-transform duration-700 ease-(--ease-premium) group-hover:scale-[1.04]" /> : <span className="ember-placeholder absolute inset-0" />}
                        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                        <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 rounded-2xl border border-white/50 bg-white/65 p-4 backdrop-blur-xl transition-colors duration-500 group-hover:bg-white/80">
                          <span className="min-w-0">
                            <span className="block font-display text-lg font-semibold text-ink">{c.name}</span>
                            <span className="mt-0.5 block text-[12px] font-semibold text-stone tabular-nums">{counts[c.slug]} rehber</span>
                          </span>
                          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-colors duration-500 group-hover:bg-ember group-hover:text-ink">
                            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
                          </span>
                        </span>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </div>
          </section>

          <section aria-labelledby="once-okuyun" className="border-y border-sand bg-paper py-16 sm:py-24">
            <div className="shell">
              <Reveal className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="eyebrow text-ember-ink">Temel rehberler</p>
                  <h2 id="once-okuyun" className="display-3 mt-5">
                    Önce bunları okuyun.
                  </h2>
                </div>
                <a href="#kutuphane" className="inline-flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-ember-ink underline-offset-4 hover:underline">
                  Tüm rehberleri keşfedin <ArrowDown aria-hidden="true" className="h-4 w-4" />
                </a>
              </Reveal>
              <Stagger as="ul" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" gap={0.08}>
                {featured.map((p) => (
                  <StaggerItem key={p.id} className="h-full">
                    <Link href={routes.post(p.slug)} className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-linen bg-white transition-[border-color,box-shadow] duration-500 hover:border-ember/40 hover:shadow-[0_24px_48px_-28px_rgb(12_12_13/0.35)]">
                      <span className="relative block aspect-[16/9] overflow-hidden bg-bone">
                        {p.coverImage ? <Image src={p.coverImage} alt="" fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover transition-transform duration-700 ease-(--ease-premium) group-hover:scale-[1.03]" /> : <span className="ember-placeholder absolute inset-0" />}
                      </span>
                      <span className="flex flex-1 items-start justify-between gap-4 p-5">
                        <span>
                          <span className="block text-[11px] font-semibold tracking-[0.16em] text-ember-ink uppercase">{guideCategoryBySlug(p.category)?.name}</span>
                          <span className="mt-2 block font-display text-lg leading-snug font-semibold text-ink transition-colors group-hover:text-ember-ink">{p.title}</span>
                        </span>
                        <ArrowUpRight aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-ember-ink transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </section>

          <section aria-labelledby="yol-haritasi" className="relative overflow-hidden bg-ink py-14 text-white sm:py-16">
            <span aria-hidden="true" className="pointer-events-none absolute -top-32 -right-24 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.28),transparent_65%)]" />
            <Reveal className="shell relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 id="yol-haritasi" className="display-3 text-white">
                  Fikirden uygulamaya, adım adım.
                </h2>
                <p className="mt-3 text-[16px] text-white/70">Şömine projenizin yol haritasını keşfedin.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href={roadmap ? routes.post(roadmap.slug) : routes.quote} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 text-[14px] font-semibold text-white backdrop-blur-md transition-colors hover:border-ember hover:bg-ember hover:text-ink">
                  Projenizi planlayın <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                {prep ? (
                  <Link href={routes.post(prep.slug)} className="inline-flex min-h-12 items-center gap-2 px-2 text-[14px] font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline">
                    <BookOpen aria-hidden="true" className="h-4 w-4 text-ember" /> Showroom hazırlık listesi
                  </Link>
                ) : null}
              </div>
            </Reveal>
          </section>

          <section id="kutuphane" aria-labelledby="kutuphane-baslik" className="scroll-mt-28 bg-[linear-gradient(180deg,var(--color-bone),var(--color-paper))] py-16 sm:py-24">
            <div className="shell">
              <Reveal className="mb-8">
                <p className="eyebrow text-ember-ink">Rehber kütüphanesi</p>
                <h2 id="kutuphane-baslik" className="display-3 mt-5">
                  Tüm rehberler.
                </h2>
              </Reveal>
              <GuideLibrary posts={library} initialQuery={query} />
            </div>
          </section>

          <section aria-labelledby="yeni-rehberler" className="bg-white py-14 sm:py-20">
            <div className="shell">
              <h2 id="yeni-rehberler" className="font-display text-2xl font-semibold text-ink">
                Yeni ve güncellenen rehberler
              </h2>
              <ul className="mt-6 grid gap-3 md:grid-cols-3">
                {latest.map((p) => (
                  <li key={p.id}>
                    <Link href={routes.post(p.slug)} className="group flex items-center gap-4 rounded-2xl border border-linen bg-paper p-2.5 pr-4 transition-colors hover:border-ember/40">
                      <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-bone">{p.coverImage ? <Image src={p.coverImage} alt="" fill sizes="96px" className="object-cover" /> : null}</span>
                      <span className="line-clamp-2 flex-1 text-[14px] leading-snug font-semibold text-ink group-hover:text-ember-ink">{p.title}</span>
                      <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-ember-ink" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
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
