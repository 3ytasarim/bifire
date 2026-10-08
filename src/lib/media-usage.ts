import "server-only";
import { prisma } from "@/lib/db";

/** Görselin kullanıldığı yerler (silmeden önce kontrol — kullanımdaki görsel silinemez). */
export async function findMediaUsage(url: string): Promise<string[]> {
  const inText = { contains: url };
  const [pc, pi, cat, pr, pri, bp, bpc, hs, st, seo, pd, prc, cc] = await Promise.all([
    prisma.product.count({ where: { OR: [{ coverImage: url }, { ogImage: url }] } }),
    prisma.productImage.count({ where: { url } }),
    prisma.productCategory.count({ where: { OR: [{ image: url }, { ogImage: url }] } }),
    prisma.project.count({ where: { OR: [{ coverImage: url }, { ogImage: url }] } }),
    prisma.projectImage.count({ where: { url } }),
    prisma.blogPost.count({ where: { OR: [{ coverImage: url }, { ogImage: url }] } }),
    prisma.blogPost.count({ where: { content: inText } }),
    prisma.heroSlide.count({ where: { OR: [{ desktopImage: url }, { mobileImage: url }, { desktopVideo: url }, { mobileVideo: url }] } }),
    prisma.siteSetting.count({ where: { OR: [{ logoUrl: url }, { faviconUrl: url }, { defaultOgImage: url }, { aboutImage: url }, { aboutVideo: url }, { featureImage: url }] } }),
    prisma.seoPage.count({ where: { ogImage: url } }),
    prisma.product.count({ where: { description: inText } }),
    prisma.project.count({ where: { content: inText } }),
    prisma.productCategory.count({ where: { content: inText } }),
  ]);
  const out: string[] = [];
  if (pc + pi) out.push(`${pc + pi} ürün görselinde`);
  if (cat + cc) out.push(`${cat + cc} kategoride`);
  if (pr + pri + prc) out.push(`${pr + pri + prc} projede`);
  if (bp + bpc) out.push(`${bp + bpc} blog yazısında`);
  if (hs) out.push(`${hs} slider kaydında`);
  if (st) out.push("site ayarlarında");
  if (seo) out.push(`${seo} SEO sayfasında`);
  if (pd) out.push(`${pd} ürün açıklamasında`);
  return out;
}
