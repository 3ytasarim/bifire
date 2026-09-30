import "server-only";
import type { SiteSettings } from "@/lib/settings";
import { socialLinks } from "@/lib/settings";
import type { ImageMeta } from "./image-meta";
import { absoluteUrl, canonicalUrl, getSiteUrl, SITE_LANG, SITE_NAME } from "./site";

/**
 * Site genelinde birbirine @id ile bağlı JSON-LD grafiği:
 *   Organization (#organization) ← WebSite (#website).publisher
 *   WebSite ← WebPage.isPartOf;  WebPage → BreadcrumbList (#breadcrumb), primaryImage (#primaryimage), mainEntity
 *   Product.brand/manufacturer → Organization;  BlogPosting.publisher → Organization
 * Organization ve WebSite TEK yerde (public layout) tanımlanır; sayfalar yalnızca {"@id"} ile referans verir.
 * Gerçek veri yoksa alan hiç yazılmaz: sahte fiyat, stok, puan, yorum ÜRETİLMEZ.
 */

type Node = Record<string, unknown>;

export const ids = {
  organization: () => `${getSiteUrl()}/#organization`,
  website: () => `${getSiteUrl()}/#website`,
  logo: () => `${getSiteUrl()}/#logo`,
  webpage: (path: string) => `${canonicalUrl(path)}#webpage`,
  breadcrumb: (path: string) => `${canonicalUrl(path)}#breadcrumb`,
  primaryImage: (path: string) => `${canonicalUrl(path)}#primaryimage`,
  product: (path: string) => `${canonicalUrl(path)}#product`,
  article: (path: string) => `${canonicalUrl(path)}#article`,
};

export function graph(...nodes: (Node | null | undefined | false)[]): Node {
  return { "@context": "https://schema.org", "@graph": nodes.filter(Boolean) };
}

/** <script type="application/ld+json"> için güvenli serileştirme: "<" kaçışlanır → "</script>" enjeksiyonu olmaz. */
export function serializeJsonLd(data: unknown): string {
  const BS = "\\";
  const LS = String.fromCharCode(0x2028);
  const PS = String.fromCharCode(0x2029);
  return JSON.stringify(data)
    .split("<").join(BS + "u003c")
    .split(LS).join(BS + "u2028")
    .split(PS).join(BS + "u2029");
}

export function organizationNode(s: SiteSettings, logo?: { url: string; meta: ImageMeta | null }): Node {
  const site = getSiteUrl();
  const sameAs = socialLinks(s).map((x) => x.url);
  return {
    "@type": "Organization",
    "@id": ids.organization(),
    name: s.companyName || SITE_NAME,
    url: `${site}/`,
    ...(logo
      ? {
          logo: {
            "@type": "ImageObject",
            "@id": ids.logo(),
            url: absoluteUrl(logo.url),
            contentUrl: absoluteUrl(logo.url),
            ...(logo.meta ? { width: logo.meta.width, height: logo.meta.height } : {}),
          },
          image: { "@id": ids.logo() },
        }
      : {}),
    ...(s.footerDescription ? { description: s.footerDescription } : {}),
    ...(s.email ? { email: s.email } : {}),
    ...(s.phone ? { telephone: s.phone } : {}),
    ...(s.address ? { address: { "@type": "PostalAddress", streetAddress: s.address, addressCountry: "TR" } } : {}),
    ...(s.phone || s.email
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            availableLanguage: ["Turkish"],
            ...(s.phone ? { telephone: s.phone } : {}),
            ...(s.email ? { email: s.email } : {}),
          },
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteNode(s: SiteSettings): Node {
  return {
    "@type": "WebSite",
    "@id": ids.website(),
    url: `${getSiteUrl()}/`,
    name: s.companyName || SITE_NAME,
    inLanguage: SITE_LANG,
    publisher: { "@id": ids.organization() },
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbNode(path: string, crumbs: Crumb[]): Node {
  return {
    "@type": "BreadcrumbList",
    "@id": ids.breadcrumb(path),
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: canonicalUrl(c.path),
    })),
  };
}

export function imageNode(path: string, image: { url: string; alt?: string | null; meta?: ImageMeta | null }): Node {
  const url = absoluteUrl(image.url);
  return {
    "@type": "ImageObject",
    "@id": ids.primaryImage(path),
    url,
    contentUrl: url,
    inLanguage: SITE_LANG,
    ...(image.alt ? { caption: image.alt } : {}),
    ...(image.meta ? { width: image.meta.width, height: image.meta.height, encodingFormat: image.meta.type } : {}),
  };
}

export function webPageNode(input: {
  path: string;
  name: string;
  description?: string;
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage" | "ItemPage";
  hasBreadcrumb?: boolean;
  hasPrimaryImage?: boolean;
  mainEntityId?: string;
  datePublished?: Date | null;
  dateModified?: Date | null;
}): Node {
  return {
    "@type": input.type ?? "WebPage",
    "@id": ids.webpage(input.path),
    url: canonicalUrl(input.path),
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    inLanguage: SITE_LANG,
    isPartOf: { "@id": ids.website() },
    ...(input.hasBreadcrumb ? { breadcrumb: { "@id": ids.breadcrumb(input.path) } } : {}),
    ...(input.hasPrimaryImage ? { primaryImageOfPage: { "@id": ids.primaryImage(input.path) } } : {}),
    ...(input.mainEntityId ? { mainEntity: { "@id": input.mainEntityId } } : {}),
    ...(input.datePublished ? { datePublished: input.datePublished.toISOString() } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified.toISOString() } : {}),
  };
}

export function productNode(input: {
  path: string;
  name: string;
  description: string;
  images: string[];
  category?: string | null;
  modelCode?: string | null;
  brand?: string | null;
  properties: { name: string; value: string; unitText?: string | null }[];
}): Node {
  const brand = input.brand?.trim();
  return {
    "@type": "Product",
    "@id": ids.product(input.path),
    name: input.name,
    description: input.description,
    url: canonicalUrl(input.path),
    image: input.images.map((i) => absoluteUrl(i)),
    // Marka yalnızca admin girdiyse; Bifire ise Organization'a bağlanır, ithal markaysa yalnızca adı yazılır.
    ...(brand
      ? { brand: /^bifire$/i.test(brand) ? { "@id": ids.organization() } : { "@type": "Brand", name: brand } }
      : {}),
    mainEntityOfPage: { "@id": ids.webpage(input.path) },
    ...(input.category ? { category: input.category } : {}),
    ...(input.modelCode ? { model: input.modelCode, mpn: input.modelCode } : {}),
    ...(input.properties.length
      ? {
          additionalProperty: input.properties.map((p) => ({
            "@type": "PropertyValue",
            name: p.name,
            value: p.value,
            ...(p.unitText ? { unitText: p.unitText } : {}),
          })),
        }
      : {}),
  };
}

export function articleNode(input: {
  path: string;
  headline: string;
  description: string;
  image?: string | null;
  authorName?: string | null;
  datePublished?: Date | null;
  dateModified: Date;
  keywords?: string[];
  wordCount?: number;
}): Node {
  return {
    "@type": "BlogPosting",
    "@id": ids.article(input.path),
    headline: input.headline.slice(0, 110),
    description: input.description,
    url: canonicalUrl(input.path),
    inLanguage: SITE_LANG,
    mainEntityOfPage: { "@id": ids.webpage(input.path) },
    isPartOf: { "@id": ids.website() },
    ...(input.image ? { image: { "@id": ids.primaryImage(input.path) } } : {}),
    // Yazar adı girilmişse kişi, girilmemişse kurum (uydurma yazar yok).
    author: input.authorName ? { "@type": "Person", name: input.authorName } : { "@id": ids.organization() },
    publisher: { "@id": ids.organization() },
    ...(input.datePublished ? { datePublished: input.datePublished.toISOString() } : {}),
    dateModified: input.dateModified.toISOString(),
    ...(input.keywords?.length ? { keywords: input.keywords.join(", ") } : {}),
    ...(input.wordCount ? { wordCount: input.wordCount } : {}),
  };
}

export function itemListNode(path: string, items: { name: string; path: string }[]): Node {
  return {
    "@type": "ItemList",
    "@id": `${canonicalUrl(path)}#itemlist`,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: canonicalUrl(it.path) })),
  };
}
