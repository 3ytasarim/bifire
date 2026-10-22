import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AreaPageView } from "@/components/areas/AreaPageView";
import { districtProducts } from "@/content/regions";
import { districtOf, isDistrictIndexable, PROVINCES, provinceBySlug } from "@/content/service-areas";
import { routes } from "@/lib/catalog";
import { getFormOptions, getProductsBySlugs } from "@/lib/queries";
import { buildMetadata, buildStaticPageMetadata } from "@/lib/seo/metadata";
import type { StaticPageKey } from "@/lib/seo/static-pages";

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return PROVINCES.flatMap((p) => p.districts.map((d) => ({ il: p.slug, ilce: d.slug })));
}

type Props = { params: Promise<{ il: string; ilce: string }> };

function load(il: string, ilce: string) {
  const province = provinceBySlug(il);
  const district = province ? districtOf(province, ilce) : null;
  return province && district ? { province, district } : null;
}

/**
 * İndekslenen ilçeler (İstanbul) Admin > SEO'dan yönetilir; diğer ilçe taslakları yerel bilgi eklenene kadar
 * `noindex, follow` (yayın planı — bkz. content/service-areas INDEXED_DISTRICT_PROVINCES).
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { il, ilce } = await params;
  const data = load(il, ilce);
  if (!data) return {};
  if (isDistrictIndexable(il)) return buildStaticPageMetadata(`bolge-${ilce}` as StaticPageKey);
  return buildMetadata({ title: data.district.seoTitle, description: data.district.meta, keywords: data.district.keywords, path: routes.region(il, ilce), index: false, follow: true });
}

export default async function DistrictPage({ params }: Props) {
  const { il, ilce } = await params;
  const data = load(il, ilce);
  if (!data) notFound();
  const [[categories, products], recommended] = await Promise.all([getFormOptions(), getProductsBySlugs(districtProducts(il === "istanbul" ? ilce : ""))]);
  return <AreaPageView province={data.province} district={data.district} products={recommended} form={{ categories, products }} />;
}
