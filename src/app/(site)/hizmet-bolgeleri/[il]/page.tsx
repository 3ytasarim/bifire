import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { AreaPageView } from "@/components/areas/AreaPageView";
import { districtProducts } from "@/content/regions";
import { istanbulDistrictBySlug, PROVINCES, provinceBySlug } from "@/content/service-areas";
import { FLAT_REGION_PROVINCE, FLAT_REGION_SUFFIX, routes } from "@/lib/catalog";
import { getFormOptions, getProductsBySlugs } from "@/lib/queries";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import type { StaticPageKey } from "@/lib/seo/static-pages";
import { districtMetadata, DistrictContent, loadDistrict } from "../district";

export const revalidate = 300;

/**
 * Bu segment iki sayfa türü taşır:
 * - İl sayfası (/hizmet-bolgeleri/ankara).
 * - İstanbul ilçe sayfası, yayındaki düz adresiyle (/hizmet-bolgeleri/adalar-somine).
 * Eski kısa İstanbul ilçe adresi (/hizmet-bolgeleri/adalar) kalıcı olarak düz adrese yönlenir.
 */
export function generateStaticParams() {
  const istanbul = provinceBySlug(FLAT_REGION_PROVINCE)!;
  return [...PROVINCES.map((p) => ({ il: p.slug })), ...istanbul.districts.map((d) => ({ il: `${d.slug}${FLAT_REGION_SUFFIX}` }))];
}

type Props = { params: Promise<{ il: string }> };

/** "/adalar-somine" → İstanbul ilçesi "adalar" (yoksa null). */
function flatDistrict(segment: string) {
  if (!segment.endsWith(FLAT_REGION_SUFFIX)) return null;
  return loadDistrict(FLAT_REGION_PROVINCE, segment.slice(0, -FLAT_REGION_SUFFIX.length));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { il } = await params;
  if (provinceBySlug(il)) return buildStaticPageMetadata(`il-${il}` as StaticPageKey);
  const flat = flatDistrict(il);
  return flat ? districtMetadata(FLAT_REGION_PROVINCE, flat.district.slug) : {};
}

export default async function ProvincePage({ params }: Props) {
  const { il } = await params;
  const province = provinceBySlug(il);
  if (!province) {
    const flat = flatDistrict(il);
    if (flat) return <DistrictContent data={flat} />;
    if (istanbulDistrictBySlug(il)) permanentRedirect(routes.region(FLAT_REGION_PROVINCE, il));
    notFound();
  }
  const [[categories, products], recommended] = await Promise.all([getFormOptions(), getProductsBySlugs(districtProducts(""))]);
  return <AreaPageView province={province} district={null} products={recommended} form={{ categories, products }} />;
}
