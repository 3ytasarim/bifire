import type { FuelType, Product, ProductSpecification, TextPosition, ViewType } from "@prisma/client";

export const FUEL_LABELS: Record<FuelType, string> = {
  WOOD: "Odunlu",
  GAS: "Doğalgazlı",
  ELECTRIC: "Elektrikli",
  BIOETHANOL: "Bioethanol",
  PELLET: "Peletli",
  CHARCOAL: "Kömür / Mangal",
  NONE: "Yakıtsız",
};

export const VIEW_LABELS: Record<ViewType, string> = {
  SINGLE: "Tek taraflı (düz cam)",
  CORNER_LEFT: "Köşe — L tipi (sol)",
  CORNER_RIGHT: "Köşe — L tipi (sağ)",
  THREE_SIDED: "Üç taraflı (U tipi)",
  TUNNEL: "Çift taraflı (tünel)",
  PANORAMIC: "Panoramik / prizmatik",
  ROUND: "360° / yuvarlak",
};

export const TEXT_POSITION_LABELS: Record<TextPosition, string> = {
  LEFT: "Sol",
  CENTER: "Orta",
  RIGHT: "Sağ",
  BOTTOM_LEFT: "Sol alt",
};

/**
 * Kategori bağlantısı: alt kategorisi olmayan ve tek aktif ürünü bulunan kategori doğrudan ürün sayfasına gider
 * (kategori sayfası açılıp ürünü ikinci kez tıklamak gerekmesin). Kategori sayfası yine erişilebilir kalır.
 */
export function categoryHref(c: { slug: string; products?: { slug: string }[]; childCount?: number }): string {
  if (!c.childCount && c.products?.length === 1) return routes.product(c.products[0]!.slug, c.slug);
  return routes.category(c.slug);
}

/**
 * Kategori adres kökü — kategori sayfası Word paketindeki "URL önerisi": şömine modelleri (odunlu ve alt tipleri,
 * elektrikli, bioethanol) /somine-modelleri/…, bahçe ürünleri ve aksesuarlar /urunler/…. Yeni bir alt kategori
 * üst kategorisinden kökünü alır (parentSlug); bilinmeyen bağlantılar kategori sayfasında doğru köke yönlenir.
 */
export type CategoryBase = "urunler" | "somine-modelleri" | "elektrikli" | "barbeku";
export const SOMINE_MODEL_ROOTS = ["odunlu-somineler", "bioethanol-somineler"];
/**
 * Elektrikli şömineler Zaya ürün paketindeki URL planıyla kendi kökünde: /elektrikli-somineler (ana kategori),
 * /elektrikli-somineler/2-boyutlu-somineler (alt kategori), /elektrikli-somineler/2-boyutlu-somineler/zaya-pagla-70 (ürün).
 */
export const ELECTRIC_ROOT = "elektrikli-somineler";
const ELECTRIC_SUBS = new Set(["2-boyutlu-somineler", "3-boyutlu-somineler"]);
/** Barbekü modelleri paket URL planıyla kendi kökünde: /barbeku-modelleri (kategori), /barbeku-modelleri/{ürün}. */
export const BBQ_ROOT = "barbeku-modelleri";
const SOMINE_MODEL_SLUGS = new Set([...SOMINE_MODEL_ROOTS, "duz-somineler", "u-tipi-somineler", "l-tipi-somineler", "epi-somineler", "cift-yonlu-somineler", "prizma-somineler", "orta-somineler"]);
export function categoryBase(slug: string, parentSlug?: string | null): CategoryBase {
  if (slug === ELECTRIC_ROOT || ELECTRIC_SUBS.has(slug) || parentSlug === ELECTRIC_ROOT) return "elektrikli";
  if (slug === BBQ_ROOT) return "barbeku";
  return SOMINE_MODEL_SLUGS.has(slug) || (parentSlug && SOMINE_MODEL_ROOTS.includes(parentSlug)) ? "somine-modelleri" : "urunler";
}

/**
 * İstanbul ilçeleri yayındaki düz adreslerini korur (/hizmet-bolgeleri/adalar-somine); diğer iller il/ilçe
 * hiyerarşisindedir (/hizmet-bolgeleri/kocaeli/gebze). Kaynak: hizmet bölgeleri Word paketi "Önerilen URL".
 */
export const FLAT_REGION_PROVINCE = "istanbul";
export const FLAT_REGION_SUFFIX = "-somine";

export const routes = {
  home: "/",
  about: "/kurumsal",
  products: "/urunler",
  category: (slug: string, parentSlug?: string | null) => {
    const base = categoryBase(slug, parentSlug);
    if (base === "elektrikli") return slug === ELECTRIC_ROOT ? `/${ELECTRIC_ROOT}` : `/${ELECTRIC_ROOT}/${slug}`;
    if (base === "barbeku") return `/${BBQ_ROOT}`;
    return `/${base}/${slug}`;
  },
  /** Ürün adresi: elektrikli alt kategorilerdeki ürünler /elektrikli-somineler/{alt}/{ürün}, diğerleri /urun/{ürün}. */
  product: (slug: string, categorySlug?: string | null, parentSlug?: string | null) =>
    categorySlug === BBQ_ROOT
      ? `/${BBQ_ROOT}/${slug}`
      : categorySlug && categorySlug !== ELECTRIC_ROOT && categoryBase(categorySlug, parentSlug) === "elektrikli"
        ? `/${ELECTRIC_ROOT}/${categorySlug}/${slug}`
        : `/urun/${slug}`,
  projects: "/projeler",
  project: (slug: string) => `/projeler/${slug}`,
  blog: "/somine-rehberi",
  post: (slug: string) => `/somine-rehberi/${slug}`,
  blogTag: (slug: string) => `/somine-rehberi/etiket/${slug}`,
  blogCategory: (slug: string) => `/somine-rehberi/kategori/${slug}`,
  contact: "/iletisim",
  quote: "/teklif-al",
  services: "/hizmetler",
  service: (slug: string) => `/hizmetler/${slug}`,
  showroom: "/fabrika-showroom",
  design: "/mekaniniza-ozel-tasarim",
  regions: "/hizmet-bolgeleri",
  province: (il: string) => `/hizmet-bolgeleri/${il}`,
  /** Bölge grubu (Marmara, Ege…) — tek illik gruplar il sayfasına gider. */
  regionGroup: (slug: string) => `/hizmet-bolgeleri/bolge/${slug}`,
  region: (il: string, ilce: string) => (il === FLAT_REGION_PROVINCE ? `/hizmet-bolgeleri/${ilce}${FLAT_REGION_SUFFIX}` : `/hizmet-bolgeleri/${il}/${ilce}`),
  kvkk: "/kvkk",
  privacy: "/gizlilik-politikasi",
  cookies: "/cerez-politikasi",
};

/** value: kullanıcıya gösterilen (tr-TR biçimli); raw: yapısal veri için makine okunur değer (ör. "1450", "12.5"). */
export type TechRow = { label: string; value: string; raw?: string; unit?: string | null; group?: string | null };

function raw(value: { toString(): string } | null | undefined): string | undefined {
  if (value === null || value === undefined) return undefined;
  const n = Number(value.toString());
  return Number.isFinite(n) ? String(n) : undefined;
}

function num(value: { toString(): string } | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const n = Number(value.toString());
  return Number.isFinite(n) ? n.toLocaleString("tr-TR", { maximumFractionDigits: 2 }) : null;
}

type ProductTech = Pick<
  Product,
  | "fuelType"
  | "viewType"
  | "powerKw"
  | "heatingArea"
  | "efficiency"
  | "widthMm"
  | "heightMm"
  | "depthMm"
  | "weightKg"
  | "flueDiameterMm"
  | "dimensionsNote"
  | "modelCode"
  | "brand"
>;

/** Ürün kartı / detay "öne çıkan değerler" (yalnızca dolu olanlar). */
export function keyFacts(p: Pick<Product, "fuelType" | "powerKw" | "heatingArea" | "efficiency">): { label: string; value: string }[] {
  const facts: { label: string; value: string }[] = [];
  if (p.fuelType) facts.push({ label: "Yakıt", value: FUEL_LABELS[p.fuelType] });
  const power = num(p.powerKw);
  if (power) facts.push({ label: "Güç", value: `${power} kW` });
  if (p.heatingArea) facts.push({ label: "Isıtma alanı", value: p.heatingArea });
  const eff = num(p.efficiency);
  if (eff) facts.push({ label: "Verim", value: `%${eff}` });
  return facts;
}

/** Detay sayfasındaki teknik tablo: sabit alanlar + admin'in eklediği esnek özellik satırları. */
export function technicalRows(p: ProductTech, specs: Pick<ProductSpecification, "group" | "label" | "value" | "unit">[]): TechRow[] {
  const rows: TechRow[] = [];
  const add = (label: string, value: string | null | undefined, unit?: string, rawValue?: string) => {
    if (value) rows.push({ label, value, raw: rawValue, unit, group: "Genel" });
  };
  // Üretici markalı cihazlarda (Bifire dışı) marka ziyaretçiye gösterilmez; yalnız admin kaydında tutulur.
  add("Marka", p.brand && /bifire/i.test(p.brand) ? p.brand : null);
  add("Model kodu", p.modelCode);
  add("Yakıt türü", p.fuelType ? FUEL_LABELS[p.fuelType] : null);
  add("Cam / görünüm", p.viewType ? VIEW_LABELS[p.viewType] : null);
  add("Nominal güç", num(p.powerKw), "kW", raw(p.powerKw));
  add("Isıtma alanı", p.heatingArea);
  add("Verim", num(p.efficiency), "%", raw(p.efficiency));
  add("Genişlik", num(p.widthMm), "mm", raw(p.widthMm));
  add("Yükseklik", num(p.heightMm), "mm", raw(p.heightMm));
  add("Derinlik", num(p.depthMm), "mm", raw(p.depthMm));
  add("Ağırlık", num(p.weightKg), "kg", raw(p.weightKg));
  add("Baca çapı", num(p.flueDiameterMm), "mm", raw(p.flueDiameterMm));
  add("Ölçü notu", p.dimensionsNote);
  for (const s of specs) rows.push({ label: s.label, value: s.value, unit: s.unit, group: s.group || "Teknik özellikler" });
  return rows;
}

export function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });
}

export function readingMinutes(text: string): number {
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));
}
