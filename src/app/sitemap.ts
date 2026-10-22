import type { MetadataRoute } from "next";
import { GUIDE_CATEGORIES } from "@/content/guide";
import { prisma } from "@/lib/db";
import { routes } from "@/lib/catalog";
import { publishedWhere } from "@/lib/queries";
import { absoluteUrl, canonicalUrl } from "@/lib/seo/site";
import { FEATURES } from "@/lib/features";
import { DISTRICTS } from "@/content/regions";

export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

/**
 * Dinamik site haritası. Yalnızca aktif / yayında / indexlenebilir (noIndex=false) URL'ler girer.
 * lastModified her zaman gerçek DB updatedAt'ten gelir; statik sayfalarda ilgili içeriğin en son
 * güncellemesi kullanılır, bilinmiyorsa alan hiç yazılmaz (sahte tarih yok).
 * Ürün/proje/blog görselleri <image:image> olarak eklenir (Google Görseller keşfi).
 */
export default async function sitemap(): Promise<Entry[]> {
  const [categories, products, projects, posts, seoPages] = await Promise.all([
    prisma.productCategory.findMany({
      where: { active: true, noIndex: false, OR: [{ parentId: null }, { parent: { active: true } }] },
      select: { slug: true, updatedAt: true, image: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { active: true, noIndex: false, category: { active: true } },
      select: { slug: true, updatedAt: true, coverImage: true, images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 6 } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.project.findMany({
      where: FEATURES.projects ? { active: true, noIndex: false } : { id: { in: [] } },
      select: { slug: true, updatedAt: true, coverImage: true, images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 6 } },
    }),
    prisma.blogPost.findMany({ where: { ...publishedWhere(), noIndex: false }, select: { slug: true, updatedAt: true, coverImage: true } }),
    prisma.seoPage.findMany({ select: { key: true, robotsIndex: true } }),
  ]);

  const noindexStatic = new Set(seoPages.filter((p) => !p.robotsIndex).map((p) => p.key));
  const latest = (...groups: { updatedAt: Date }[][]) => {
    const t = groups.flat().map((x) => x.updatedAt.getTime());
    return t.length ? new Date(Math.max(...t)) : undefined;
  };
  const images = (...urls: (string | null | undefined)[]) => {
    const list = [...new Set(urls.filter((u): u is string => Boolean(u)))].map(absoluteUrl);
    return list.length ? { images: list } : {};
  };
  const page = (key: string, path: string, rest: Omit<Entry, "url">): Entry[] =>
    noindexStatic.has(key) ? [] : [{ url: canonicalUrl(path) || absoluteUrl("/"), ...rest }];

  return [
    ...page("home", "/", { lastModified: latest(products, projects, posts), changeFrequency: "weekly", priority: 1 }),
    ...page("urunler", routes.products, { lastModified: latest(products, categories), changeFrequency: "weekly", priority: 0.9 }),
    ...(FEATURES.projects ? page("projeler", routes.projects, { lastModified: latest(projects), changeFrequency: "weekly", priority: 0.8 }) : []),
    ...page("blog", routes.blog, { lastModified: latest(posts), changeFrequency: "weekly", priority: 0.7 }),
    ...GUIDE_CATEGORIES.map((c) => ({ url: canonicalUrl(routes.blogCategory(c.slug)), lastModified: latest(posts), changeFrequency: "weekly" as const, priority: 0.6 })),
    ...page("kurumsal", routes.about, { changeFrequency: "yearly", priority: 0.5 }),
    ...page("iletisim", routes.contact, { changeFrequency: "yearly", priority: 0.5 }),
    ...page("teklif-al", routes.quote, { changeFrequency: "yearly", priority: 0.6 }),
    ...page("hizmetler", routes.services, { changeFrequency: "monthly", priority: 0.8 }),
    ...page("hizmet-ozel-olcu", routes.service("ozel-olcu-somine-tasarimi"), { changeFrequency: "monthly", priority: 0.7 }),
    ...page("hizmet-montaj", routes.service("somine-montaji"), { changeFrequency: "monthly", priority: 0.7 }),
    ...page("showroom", routes.showroom, { changeFrequency: "monthly", priority: 0.7 }),
    ...page("mekan-tasarim", routes.design, { changeFrequency: "monthly", priority: 0.7 }),
    ...page("hizmet-bolgeleri", routes.regions, { changeFrequency: "monthly", priority: 0.7 }),
    ...DISTRICTS.flatMap((d) => page(`bolge-${d.slug}`, routes.region(d.slug), { changeFrequency: "monthly", priority: 0.6 })),
    ...categories.map((c) => ({ url: canonicalUrl(routes.category(c.slug)), lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.8, ...images(c.image) })),
    ...products.map((p) => ({
      url: canonicalUrl(routes.product(p.slug)),
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      ...images(p.coverImage, ...p.images.map((i) => i.url)),
    })),
    ...projects.map((p) => ({
      url: canonicalUrl(routes.project(p.slug)),
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      ...images(p.coverImage, ...p.images.map((i) => i.url)),
    })),
    ...posts.map((p) => ({ url: canonicalUrl(routes.post(p.slug)), lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6, ...images(p.coverImage) })),
  ];
}
