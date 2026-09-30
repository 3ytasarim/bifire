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

export const routes = {
  home: "/",
  about: "/kurumsal",
  products: "/urunler",
  category: (slug: string) => `/urunler/${slug}`,
  product: (slug: string) => `/urun/${slug}`,
  projects: "/projeler",
  project: (slug: string) => `/projeler/${slug}`,
  blog: "/blog",
  post: (slug: string) => `/blog/${slug}`,
  blogTag: (slug: string) => `/blog/etiket/${slug}`,
  contact: "/iletisim",
  quote: "/teklif-al",
  kvkk: "/kvkk",
  privacy: "/gizlilik-politikasi",
  cookies: "/cerez-politikasi",
};

export type TechRow = { label: string; value: string; unit?: string | null; group?: string | null };

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
  const add = (label: string, value: string | null | undefined, unit?: string) => {
    if (value) rows.push({ label, value, unit, group: "Genel" });
  };
  add("Marka", p.brand);
  add("Model kodu", p.modelCode);
  add("Yakıt türü", p.fuelType ? FUEL_LABELS[p.fuelType] : null);
  add("Cam / görünüm", p.viewType ? VIEW_LABELS[p.viewType] : null);
  add("Nominal güç", num(p.powerKw), "kW");
  add("Isıtma alanı", p.heatingArea);
  add("Verim", num(p.efficiency), "%");
  add("Genişlik", num(p.widthMm), "mm");
  add("Yükseklik", num(p.heightMm), "mm");
  add("Derinlik", num(p.depthMm), "mm");
  add("Ağırlık", num(p.weightKg), "kg");
  add("Baca çapı", num(p.flueDiameterMm), "mm");
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
