import type { Metadata } from "next";
import { getLocalContent, localKey } from "@/lib/local-content";
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
 * Tüm ilçe sayfaları indekslenir. İstanbul ilçelerinin SEO alanları Admin > SEO'dan yönetilir (INDEXED_DISTRICT_PROVINCES);
 * diğer illerin ilçeleri kendi içerik dosyasındaki başlık/açıklamayı kullanır.
 */
export async function districtMetadata(il: string, ilce: string): Promise<Metadata> {
  const data = loadDistrict(il, ilce);
  if (!data) return {};
  if (isDistrictIndexable(il)) return buildStaticPageMetadata(`bolge-${ilce}` as StaticPageKey);
  return buildMetadata({ title: data.district.seoTitle, description: data.district.meta, keywords: data.district.keywords, image: data.district.image?.url, imageAlt: data.district.image?.alt, path: routes.region(il, ilce) });
}

export async function DistrictContent({ data }: { data: NonNullable<ReturnType<typeof loadDistrict>> }) {
  const il = data.province.slug;
  const [[categories, products], recommended, local] = await Promise.all([
    getFormOptions(),
    getProductsBySlugs(districtProducts(il === "istanbul" ? data.district.slug : "")),
    getLocalContent(localKey.district(il, data.district.slug)),
  ]);
  return <AreaPageView province={data.province} district={data.district} products={recommended} form={{ categories, products }} local={local} />;
}
