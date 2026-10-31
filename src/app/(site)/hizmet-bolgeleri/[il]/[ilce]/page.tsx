import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PROVINCES } from "@/content/service-areas";
import { FLAT_REGION_PROVINCE, FLAT_REGION_SUFFIX, routes } from "@/lib/catalog";
import { districtMetadata, DistrictContent, loadDistrict } from "../../district";

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  // Yeni adres (armutlu-somine) + eski adres (armutlu → kalıcı yönlendirme).
  return PROVINCES.flatMap((p) => p.districts.flatMap((d) => [{ il: p.slug, ilce: `${d.slug}${FLAT_REGION_SUFFIX}` }, { il: p.slug, ilce: d.slug }]));
}

type Props = { params: Promise<{ il: string; ilce: string }> };

/** "armutlu-somine" → "armutlu"; sonek yoksa olduğu gibi (eski adres). */
const districtSlug = (seg: string) => (seg.endsWith(FLAT_REGION_SUFFIX) ? seg.slice(0, -FLAT_REGION_SUFFIX.length) : seg);

/**
 * İl/ilçe hiyerarşisindeki ilçe sayfası: /hizmet-bolgeleri/yalova/armutlu-somine. Soneksiz eski adres ve İstanbul
 * ilçeleri (düz adres) kalıcı olarak routes.region adresine yönlenir.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { il, ilce } = await params;
  return il === FLAT_REGION_PROVINCE || !ilce.endsWith(FLAT_REGION_SUFFIX) ? {} : districtMetadata(il, districtSlug(ilce));
}

export default async function DistrictPage({ params }: Props) {
  const { il, ilce: seg } = await params;
  const ilce = districtSlug(seg);
  const data = loadDistrict(il, ilce);
  if (!data) notFound();
  if (il === FLAT_REGION_PROVINCE || !seg.endsWith(FLAT_REGION_SUFFIX)) permanentRedirect(routes.region(il, ilce));
  return <DistrictContent data={data} />;
}
