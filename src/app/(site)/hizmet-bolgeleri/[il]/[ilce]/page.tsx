import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PROVINCES } from "@/content/service-areas";
import { FLAT_REGION_PROVINCE, routes } from "@/lib/catalog";
import { districtMetadata, DistrictContent, loadDistrict } from "../../district";

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return PROVINCES.flatMap((p) => p.districts.map((d) => ({ il: p.slug, ilce: d.slug })));
}

type Props = { params: Promise<{ il: string; ilce: string }> };

/** İl/ilçe hiyerarşisindeki ilçe sayfası. İstanbul ilçeleri düz adreslerine kalıcı yönlenir (routes.region). */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { il, ilce } = await params;
  return il === FLAT_REGION_PROVINCE ? {} : districtMetadata(il, ilce);
}

export default async function DistrictPage({ params }: Props) {
  const { il, ilce } = await params;
  const data = loadDistrict(il, ilce);
  if (!data) notFound();
  if (il === FLAT_REGION_PROVINCE) permanentRedirect(routes.region(il, ilce));
  return <DistrictContent data={data} />;
}
