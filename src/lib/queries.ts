import "server-only";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { categoryHref } from "@/lib/catalog";

/**
 * Public site sorguları. Hepsi yalnızca aktif / yayında içerik döner; `cache` aynı istekte
 * generateMetadata ile sayfanın aynı sorguyu iki kez çalıştırmasını engeller.
 */

const cardProductSelect = {
  id: true,
  name: true,
  slug: true,
  shortDescription: true,
  coverImage: true,
  coverImageAlt: true,
  fuelType: true,
  powerKw: true,
  heatingArea: true,
  efficiency: true,
  category: { select: { name: true, slug: true } },
  familyTitle: true,
  collectionTag: true,
  collectionLine: true,
  collectionDesc: true,
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{ select: typeof cardProductSelect }>;
/** Ürün detay sayfası verisi (getProductBySlug). */
export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

const activeProduct = { active: true, category: { active: true } } satisfies Prisma.ProductWhereInput;

const navProducts = { where: { active: true }, orderBy: [{ sortOrder: "asc" as const }], take: 2, select: { slug: true, coverImage: true, coverImageAlt: true } };

/** Menü/ana sayfa kategorileri; her kategori ve alt kategori için tıklama hedefi (`href`) hesaplanmış olarak döner. */
export const getNavCategories = cache(async () => {
  const rows = await prisma.productCategory.findMany({
    where: { active: true, parentId: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      imageAlt: true,
      description: true,
      products: navProducts,
      children: {
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { id: true, name: true, slug: true, products: navProducts },
      },
      _count: { select: { products: { where: { active: true } } } },
    },
  });
  return rows.map(({ products, children, ...c }) => ({
    ...c,
    // Kategori görseli yoksa (ör. tek ürünlü kategori) kendi veya alt kategorisinin ilk ürün kapağı kullanılır.
    image: c.image ?? [...products, ...children.flatMap((ch) => ch.products)].find((p) => p.coverImage)?.coverImage ?? null,
    href: categoryHref({ slug: c.slug, products, childCount: children.length }),
    children: children.map(({ products: chProducts, ...ch }) => ({ ...ch, href: categoryHref({ slug: ch.slug, products: chProducts }) })),
  }));
});

export const getCategoryBySlug = cache((slug: string) =>
  prisma.productCategory.findFirst({
    where: { slug, active: true, OR: [{ parentId: null }, { parent: { active: true } }] },
    include: {
      parent: { select: { name: true, slug: true } },
      children: { where: { active: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, slug: true, image: true, imageAlt: true } },
    },
  }),
);

/** Kategori sayfası: kategorinin kendi ürünleri + aktif alt kategorilerinin ürünleri. */
export function getCategoryProducts(categoryIds: string[]) {
  return prisma.product.findMany({
    where: { ...activeProduct, categoryId: { in: categoryIds } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: cardProductSelect,
  });
}

/** Koleksiyon aileleri için model sayısı ("Model kodu" satırı olan seçenek kombinasyonları). */
export async function getModelCounts(productIds: string[]): Promise<Record<string, number>> {
  const rows = await prisma.productSpecification.groupBy({ by: ["productId"], where: { productId: { in: productIds }, label: "Model kodu", variant: { not: null } }, _count: { _all: true } });
  return Object.fromEntries(rows.map((r) => [r.productId, r._count._all]));
}

/** Aynı koleksiyondaki diğer aileler (şablon metni girilmiş ürünler) — "Farklı formları keşfedin" bağlantıları. */
export function getCollectionSiblings(product: { id: string; categoryId: string; category: { parentId: string | null } }) {
  return prisma.product.findMany({
    where: { ...activeProduct, id: { not: product.id }, familyTitle: { not: null }, category: product.category.parentId ? { parentId: product.category.parentId } : { id: product.categoryId } },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    select: { slug: true, name: true, familyTitle: true },
  });
}

export function getAllProducts() {
  return prisma.product.findMany({
    where: activeProduct,
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }, { createdAt: "desc" }],
    select: cardProductSelect,
  });
}

export function getFeaturedProducts(take = 6) {
  return prisma.product.findMany({
    where: { ...activeProduct, featured: true },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    take,
    select: cardProductSelect,
  });
}

export const getProductBySlug = cache((slug: string) =>
  prisma.product.findFirst({
    where: { ...activeProduct, slug },
    include: {
      category: { include: { parent: { select: { name: true, slug: true, active: true } } } },
      images: { orderBy: { sortOrder: "asc" } },
      drawings: { orderBy: { sortOrder: "asc" } },
      specifications: { orderBy: { sortOrder: "asc" } },
      features: { orderBy: { sortOrder: "asc" } },
      options: { orderBy: { sortOrder: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
      documents: { orderBy: { sortOrder: "asc" } },
      tags: { select: { name: true, slug: true } },
      // Ürünle ilişkilendirilmiş rehber yazıları (iç linkleme). postCardSelect/publishedWhere aşağıda tanımlı;
      // sorgu çalışma anında kurulduğu için sıralama sorun değildir.
      blogPosts: { where: publishedWhere(), orderBy: { publishedAt: "desc" }, take: 3, select: postCardSelect },
      projects: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        take: 3,
        select: { id: true, title: true, slug: true, coverImage: true, coverImageAlt: true, location: true, projectType: true },
      },
    },
  }),
);

export function getRelatedProducts(product: { id: string; categoryId: string }, take = 4) {
  return prisma.product.findMany({
    where: { ...activeProduct, categoryId: product.categoryId, NOT: { id: product.id } },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
    take,
    select: cardProductSelect,
  });
}

const projectCardSelect = {
  id: true,
  title: true,
  slug: true,
  location: true,
  projectType: true,
  shortDescription: true,
  coverImage: true,
  coverImageAlt: true,
  completedAt: true,
} satisfies Prisma.ProjectSelect;

export type ProjectCardData = Prisma.ProjectGetPayload<{ select: typeof projectCardSelect }>;

export function getProjects(opts: { featured?: boolean; take?: number } = {}) {
  return prisma.project.findMany({
    where: { active: true, ...(opts.featured ? { featured: true } : {}) },
    orderBy: [{ sortOrder: "asc" }, { completedAt: "desc" }, { createdAt: "desc" }],
    take: opts.take,
    select: projectCardSelect,
  });
}

export const getProjectBySlug = cache((slug: string) =>
  prisma.project.findFirst({
    where: { slug, active: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      products: { where: activeProduct, select: cardProductSelect },
    },
  }),
);

export function getOtherProjects(id: string, take = 3) {
  return prisma.project.findMany({
    where: { active: true, NOT: { id } },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
    take,
    select: projectCardSelect,
  });
}

const postCardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  coverImageAlt: true,
  publishedAt: true,
  category: true,
  featured: true,
  subtopic: true,
  guideNo: true,
  updatedAt: true,
  tags: { select: { name: true, slug: true } },
} satisfies Prisma.BlogPostSelect;

export type PostCardData = Prisma.BlogPostGetPayload<{ select: typeof postCardSelect }>;

/** Yayında: published = true ve yayın tarihi gelmiş (ileri tarihli yazı zamanı gelince görünür). */
export function publishedWhere(): Prisma.BlogPostWhereInput {
  return { published: true, OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] };
}

export const BLOG_PAGE_SIZE = 9;

export async function getPosts(opts: { page?: number; tagSlug?: string } = {}) {
  const page = Math.max(1, opts.page ?? 1);
  const where: Prisma.BlogPostWhereInput = {
    ...publishedWhere(),
    ...(opts.tagSlug ? { tags: { some: { slug: opts.tagSlug } } } : {}),
  };
  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * BLOG_PAGE_SIZE,
      take: BLOG_PAGE_SIZE,
      select: postCardSelect,
    }),
    prisma.blogPost.count({ where }),
  ]);
  return { posts, total, page, pages: Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE)) };
}

/** Şömine Rehberi: yayındaki tüm yazılar (kart verisi) — rehber ana sayfası kütüphanesi ve kategori sayfaları. */
export const getGuidePosts = cache((category?: string) =>
  prisma.blogPost.findMany({
    where: { ...publishedWhere(), ...(category ? { category } : {}) },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    select: postCardSelect,
  }),
);

/** Rehber: içerik haritası numaralarına göre yayındaki yazılar, verilen sırayla (yayında olmayanlar atlanır). */
export async function getGuidePostsByNos(nos: number[]) {
  if (!nos.length) return [];
  const rows = await prisma.blogPost.findMany({ where: { ...publishedWhere(), guideNo: { in: nos } }, select: postCardSelect });
  return nos.map((n) => rows.find((r) => r.guideNo === n)).filter((x): x is (typeof rows)[number] => Boolean(x));
}

/** Rehber kategori sayfası: alt konu filtresi + sayfalama (12). */
export async function getGuideCategoryPage(category: string, opts: { page: number; subtopic?: string | null }) {
  const where: Prisma.BlogPostWhereInput = { ...publishedWhere(), category, ...(opts.subtopic ? { subtopic: opts.subtopic } : {}) };
  const take = 12;
  const [posts, total, subtopics] = await Promise.all([
    prisma.blogPost.findMany({ where, orderBy: [{ guideNo: "asc" }, { publishedAt: "desc" }], skip: (opts.page - 1) * take, take, select: postCardSelect }),
    prisma.blogPost.count({ where }),
    prisma.blogPost.groupBy({ by: ["subtopic"], where: { ...publishedWhere(), category }, _count: { _all: true } }),
  ]);
  return { posts, total, pages: Math.max(1, Math.ceil(total / take)), subtopics: subtopics.filter((x) => x.subtopic).map((x) => ({ name: x.subtopic!, count: x._count._all })) };
}

/** Ana sayfa: önce öne çıkanlar, sonra en yeniler. */
export async function getHomePosts(take = 3) {
  return prisma.blogPost.findMany({
    where: publishedWhere(),
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take,
    select: postCardSelect,
  });
}

export const getPostBySlug = cache((slug: string) =>
  prisma.blogPost.findFirst({
    where: { ...publishedWhere(), slug },
    include: {
      tags: { select: { name: true, slug: true } },
      products: { where: activeProduct, take: 4, select: cardProductSelect },
    },
  }),
);

export function getRelatedPosts(post: { id: string; tagSlugs: string[] }, take = 3) {
  return prisma.blogPost.findMany({
    where: {
      ...publishedWhere(),
      NOT: { id: post.id },
      ...(post.tagSlugs.length ? { tags: { some: { slug: { in: post.tagSlugs } } } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take,
    select: postCardSelect,
  });
}

export const getBlogTag = cache((slug: string) => prisma.blogTag.findUnique({ where: { slug } }));

export function getHeroSlides() {
  return prisma.heroSlide.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
}

/** Form seçimleri için (İlgilendiği ürün / kategori). */
export function getFormOptions() {
  return Promise.all([
    prisma.productCategory.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
    prisma.product.findMany({ where: activeProduct, orderBy: { name: "asc" }, select: { id: true, name: true, categoryId: true } }),
  ]);
}

/** Verilen slug sırasıyla aktif ürün kartları (ilçe/hizmet sayfalarındaki önerilen ürünler). Olmayanlar atlanır. */
export async function getProductsBySlugs(slugs: string[]): Promise<ProductCardData[]> {
  if (!slugs.length) return [];
  const rows = await prisma.product.findMany({ where: { ...activeProduct, slug: { in: slugs } }, select: cardProductSelect });
  return slugs.map((s) => rows.find((r) => r.slug === s)).filter((r): r is ProductCardData => Boolean(r));
}

/**
 * Tek ürünlü kategori (alt kategorisi yok, tek aktif ürün; ör. U Tipi Şömineler → U Tipi Odunlu Şömine): menü bu
 * kategoriyi doğrudan ürün sayfasına bağlar (categoryHref), bu yüzden kategorinin uzun SEO metni ürün sayfasında
 * gösterilir ve kategori sayfasının canonical'ı ürün sayfasıdır (yinelenen içerik oluşmaz).
 */
export const getSoleProductCategory = cache(async (categoryId: string) => {
  const c = await prisma.productCategory.findUnique({
    where: { id: categoryId },
    select: {
      name: true,
      heroTitle: true,
      content: true,
      children: { where: { active: true }, select: { id: true } },
      products: { where: { active: true }, select: { slug: true }, take: 2 },
    },
  });
  if (!c || c.children.length || c.products.length !== 1) return null;
  return { name: c.heroTitle || c.name, content: c.content, productSlug: c.products[0]!.slug };
});
