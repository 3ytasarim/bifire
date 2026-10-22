import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { AreaPageView } from "@/components/areas/AreaPageView";
import { districtProducts } from "@/content/regions";
import { istanbulDistrictBySlug, PROVINCES, provinceBySlug } from "@/content/service-areas";
import { routes } from "@/lib/catalog";
import { getFormOptions, getProductsBySlugs } from "@/lib/queries";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import type { StaticPageKey } from "@/lib/seo/static-pages";

export const revalidate = 300;

/**
 * İl hizmet sayfası (/hizmet-bolgeleri/ankara). Eski düz İstanbul ilçe adresleri (/hizmet-bolgeleri/tuzla) aynı
 * segmente düşer ve kalıcı olarak yeni hiyerarşiye yönlendirilir (/hizmet-bolgeleri/istanbul/tuzla).
 */
export function generateStaticParams() {
  return PROVINCES.map((p) => ({ il: p.slug }));
}

type Props = { params: Promise<{ il: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { il } = await params;
  return provinceBySlug(il) ? buildStaticPageMetadata(`il-${il}` as StaticPageKey) : {};
}

export default async function ProvincePage({ params }: Props) {
  const { il } = await params;
  const province = provinceBySlug(il);
  if (!province) {
    if (istanbulDistrictBySlug(il)) permanentRedirect(routes.region("istanbul", il));
    notFound();
  }
  const [[categories, products], recommended] = await Promise.all([getFormOptions(), getProductsBySlugs(districtProducts(""))]);
  return <AreaPageView province={province} district={null} products={recommended} form={{ categories, products }} />;
}
