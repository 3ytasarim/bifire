import { prisma } from "@/lib/db";
import { routes } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/settings";
import { canonicalUrl } from "@/lib/seo/site";
import { FEATURES } from "@/lib/features";

export const revalidate = 3600;

/** llms.txt — AI asistanları için sitenin özet haritası (GEO). Yalnızca gerçek, yayındaki içerik. */
export async function GET() {
  const [s, categories, products] = await Promise.all([
    getSiteSettings(),
    prisma.productCategory.findMany({ where: { active: true, noIndex: false }, orderBy: { sortOrder: "asc" }, select: { name: true, slug: true, description: true } }),
    prisma.product.findMany({
      where: { active: true, noIndex: false, category: { active: true } },
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true, shortDescription: true, category: { select: { slug: true, parent: { select: { slug: true } } } } },
      take: 200,
    }),
  ]);

  const lines = [
    `# ${s.companyName}`,
    "",
    `> ${s.footerDescription || "Bifire; şömine hazneleri, elektrikli, doğalgazlı, bioethanol ve bahçe şömineleri sunan, projeye özel şömine çözümleri tasarlayan ve uygulayan bir şömine markasıdır."}`,
    "",
    "## Sayfalar",
    `- [Ürünler](${canonicalUrl(routes.products)})`,
    ...(FEATURES.projects ? [`- [Projeler](${canonicalUrl(routes.projects)})`] : []),
    `- [Hizmetler: Özel ölçü şömine tasarımı ve montaj](${canonicalUrl(routes.services)})`,
    `- [Tuzla Fabrika Showroom](${canonicalUrl(routes.showroom)})`,
    `- [Hizmet Bölgeleri (İstanbul, Marmara ve Ankara)](${canonicalUrl(routes.regions)})`,
    `- [Şömine Rehberi (Blog)](${canonicalUrl(routes.blog)})`,
    `- [Kurumsal](${canonicalUrl(routes.about)})`,
    `- [İletişim](${canonicalUrl(routes.contact)})`,
    `- [Teklif Al](${canonicalUrl(routes.quote)})`,
    "",
    "## Ürün kategorileri",
    ...categories.map((c) => `- [${c.name}](${canonicalUrl(routes.category(c.slug))})${c.description ? `: ${c.description}` : ""}`),
    "",
    "## Ürünler",
    ...products.map((p) => `- [${p.name}](${canonicalUrl(routes.product(p.slug, p.category.slug, p.category.parent?.slug))})${p.shortDescription ? `: ${p.shortDescription}` : ""}`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
