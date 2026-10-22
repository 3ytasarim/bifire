import type { Metadata } from "next";
import { AreaPageView } from "@/components/areas/AreaPageView";
import { districtProducts } from "@/content/regions";
import { districtOf, isDistrictIndexable, provinceBySlug } from "@/content/service-areas";
import { routes } from "@/lib/catalog";
import { getFormOptions, getProductsBySlugs } from "@/lib/queries";
import { buildMetadata, buildStaticPageMetadata } from "@/lib/seo/metadata";
import type { StaticPageKey } from "@/lib/seo/static-pages";

/**
 * İlçe sayfası ortak gövdesi. Adres `routes.region` ile üretilir: İstanbul ilçeleri yayındaki düz adreslerinde
 * (/hizmet-bolgeleri/adalar-somine), diğer iller il/ilçe hiyerarşisinde (/hizmet-bolgeleri/kocaeli/gebze) —
 * Word paketindeki "Önerilen URL" ile aynı.
 */
export function loadDistrict(il: string, ilce: string) {
  const province = provinceBySlug(il);
  const district = province ? districtOf(province, ilce) : null;
  return province && district ? { province, district } : null;
}

/**
 * İndekslenen ilçeler (İstanbul) Admin > SEO'dan yönetilir; diğer ilçe taslakları yerel bilgi eklenene kadar
 * `noindex, follow` (yayın planı — bkz. content/service-areas INDEXED_DISTRICT_PROVINCES).
 */
export async function districtMetadata(il: string, ilce: string): Promise<Metadata> {
  const data = loadDistrict(il, ilce);
  if (!data) return {};
  if (isDistrictIndexable(il)) return buildStaticPageMetadata(`bolge-${ilce}` as StaticPageKey);
  return buildMetadata({ title: data.district.seoTitle, description: data.district.meta, keywords: data.district.keywords, path: routes.region(il, ilce), index: false, follow: true });
}

export async function DistrictContent({ data }: { data: NonNullable<ReturnType<typeof loadDistrict>> }) {
  const il = data.province.slug;
  const [[categories, products], recommended] = await Promise.all([getFormOptions(), getProductsBySlugs(districtProducts(il === "istanbul" ? data.district.slug : ""))]);
  return <AreaPageView province={data.province} district={data.district} products={recommended} form={{ categories, products }} />;
}
