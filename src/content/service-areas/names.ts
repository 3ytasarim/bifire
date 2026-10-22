import names from "./names.json";

/**
 * Hizmet bölgelerinin yalnız ad/slug/odak listesi (~18 KB). İstemci bileşenleri (form ilçe seçimi, bölge bulucu)
 * bunu kullanır — tam sayfa metinleri (data/*.json, ~830 KB) tarayıcı paketine girmez.
 * names.json, data/*.json'dan üretilir; il/ilçe eklenirse yeniden üretin (bkz. index.ts).
 */
export type AreaName = { name: string; slug: string; focus: string };
export type ProvinceName = AreaName & { districts: AreaName[] };

export const PROVINCE_NAMES = names as ProvinceName[];

/** Form ilçe seçimi: "Tuzla / İstanbul" biçiminde, il başlıkları altında gruplu. İl geneli ve "Diğer" dahil. */
export const districtOption = (provinceName: string, districtName?: string | null) => (districtName ? `${districtName} / ${provinceName}` : `${provinceName} (il geneli)`);
export const OTHER_AREA_OPTION = "Diğer / henüz belli değil";
export const DISTRICT_OPTION_GROUPS = PROVINCE_NAMES.map((p) => ({
  label: p.name,
  options: [districtOption(p.name), ...[...p.districts].sort((a, b) => a.name.localeCompare(b.name, "tr")).map((d) => districtOption(p.name, d.name))],
}));
export const DISTRICT_OPTIONS: string[] = [...DISTRICT_OPTION_GROUPS.flatMap((g) => g.options), OTHER_AREA_OPTION];
