import "server-only";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { htmlToText } from "@/lib/sanitize";
import { getImageMeta } from "./image-meta";
import { absoluteUrl, canonicalUrl, SITE_LOCALE, SITE_NAME } from "./site";
import { pageDefaults, STATIC_PAGES, type StaticPageKey } from "./static-pages";

/** Marka yoksa ekler: "Şömine Hazneleri" → "Şömine Hazneleri | Bifire". Zaten markalıysa dokunmaz. */
export function withBrand(title: string): string {
  const t = title.trim();
  return /\bbifire\b/i.test(t) ? t : `${t} | ${SITE_NAME}`;
}

/** Meta description için gerçek içerikten (ilk cümleler) türetilmiş, ~155 karakterlik özet. Uydurma metin yok. */
export function deriveDescription(...sources: (string | null | undefined)[]): string {
  const text = sources.map((s) => htmlToText(s)).find((s) => s.length > 0) ?? "";
  const max = 158;
  if (text.length <= max) return text;
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [];
  let out = "";
  for (const s of sentences) {
    if ((out + s).trim().length > max) break;
    out = `${out}${s}`.trim() + " ";
  }
  out = out.trim();
  if (out.length >= 70) return out;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\s]+$/, "")}…`;
}

export type SeoFields = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  noIndex?: boolean | null;
};

type BuildInput = {
  /** Nihai <title> (marka dahil). */
  title: string;
  description: string;
  path: string;
  canonical?: string | null;
  keywords?: string | null;
  image?: string | null;
  imageAlt?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  index?: boolean;
  follow?: boolean;
  type?: "website" | "article";
  publishedTime?: Date | null;
  modifiedTime?: Date | null;
};

/**
 * Tüm public sayfaların metadata'sı buradan üretilir: title, description, keywords, self canonical,
 * robots, OpenGraph (gerçek görsel ölçüsüyle), Twitter summary_large_image.
 */
export async function buildMetadata(input: BuildInput): Promise<Metadata> {
  const settings = await getSiteSettings();
  const url = canonicalUrl(input.path, input.canonical);
  const imagePath = input.image || settings.defaultOgImage || "/og/bifire-og.png";
  const imageUrl = absoluteUrl(imagePath);
  const meta = await getImageMeta(imagePath);
  const ogTitle = input.ogTitle?.trim() || input.title;
  const ogDescription = input.ogDescription?.trim() || input.description;
  const index = input.index ?? true;
  const follow = input.follow ?? true;
  const keywords = input.keywords
    ?.split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return {
    title: { absolute: input.title },
    description: input.description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: url },
    robots: {
      index,
      follow,
      ...(index ? { "max-image-preview": "large" as const, "max-snippet": -1, "max-video-preview": -1 } : {}),
    },
    openGraph: {
      type: input.type ?? "website",
      locale: SITE_LOCALE,
      siteName: settings.companyName || SITE_NAME,
      url,
      title: ogTitle,
      description: ogDescription,
      images: [
        {
          url: imageUrl,
          ...(meta ? { width: meta.width, height: meta.height, type: meta.type } : {}),
          alt: input.imageAlt || ogTitle,
        },
      ],
      ...(input.type === "article" && input.publishedTime ? { publishedTime: input.publishedTime.toISOString() } : {}),
      ...(input.type === "article" && input.modifiedTime ? { modifiedTime: input.modifiedTime.toISOString() } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [imageUrl],
    },
  };
}

/**
 * İçerik (ürün/kategori/proje/blog) için: manuel SEO varsa onu, yoksa otomatik fallback'i kullanır.
 * Fallback başlık: "{ad} | Bifire"; açıklama: kısa açıklama → içerikten türetilen özet.
 */
export function buildEntityMetadata(input: {
  name: string;
  path: string;
  seo: SeoFields;
  fallbackDescription: (string | null | undefined)[];
  image?: string | null;
  imageAlt?: string | null;
  type?: "website" | "article";
  publishedTime?: Date | null;
  modifiedTime?: Date | null;
}): Promise<Metadata> {
  const { seo } = input;
  return buildMetadata({
    title: seo.metaTitle?.trim() ? withBrand(seo.metaTitle) : withBrand(input.name),
    description: seo.metaDescription?.trim() || deriveDescription(...input.fallbackDescription) || `${input.name} — ${SITE_NAME}`,
    keywords: seo.metaKeywords,
    path: input.path,
    canonical: seo.canonicalUrl,
    image: seo.ogImage || input.image,
    imageAlt: input.imageAlt,
    index: !seo.noIndex,
    follow: true,
    type: input.type,
    publishedTime: input.publishedTime,
    modifiedTime: input.modifiedTime,
  });
}

/** Admin > SEO'da yönetilen statik sayfa. Alan boşsa static-pages.ts'teki varsayılan kullanılır. */
export async function buildStaticPageMetadata(key: StaticPageKey, overrides?: { path?: string; index?: boolean }): Promise<Metadata> {
  const def = STATIC_PAGES[key];
  const row = await prisma.seoPage.findUnique({ where: { key } });
  return buildMetadata({
    title: row?.title?.trim() ? withBrand(row.title) : def.defaults.title,
    description: row?.description?.trim() || def.defaults.description,
    keywords: row?.keywords?.trim() || pageDefaults(key).keywords,
    path: overrides?.path ?? def.path,
    canonical: row?.canonicalUrl,
    image: row?.ogImage || pageDefaults(key).image,
    ogTitle: row?.ogTitle,
    ogDescription: row?.ogDescription,
    index: overrides?.index ?? row?.robotsIndex ?? true,
    follow: row?.robotsFollow ?? true,
  });
}
