import istanbul from "./data/01-istanbul.json";
import kocaeli from "./data/02-kocaeli.json";
import sakarya from "./data/03-sakarya.json";
import yalova from "./data/04-yalova.json";
import bursa from "./data/05-bursa.json";
import balikesir from "./data/06-balikesir.json";
import canakkale from "./data/07-canakkale.json";
import tekirdag from "./data/08-tekirdag.json";
import edirne from "./data/09-edirne.json";
import kirklareli from "./data/10-kirklareli.json";
import ankara from "./data/11-ankara.json";
import izmir from "./data/12-izmir.json";
import mugla from "./data/13-mugla.json";
import bolu from "./data/14-bolu.json";
import duzce from "./data/15-duzce.json";
import aydin from "./data/16-aydin.json";
import antalya from "./data/17-antalya.json";

/**
 * Hizmet bölgeleri: 17 il (Bilecik hariç Marmara'daki 10 il + Ankara; 2026-10-25 eki: İzmir, Muğla, Bolu, Düzce, Aydın,
 * Antalya) ve 271 ilçe sayfasının metni. Kaynak: "Bifire Hizmet Bölgeleri" Word paketleri (21 ve 25 Ekim 2026) →
 * data/*.json (dönüştürücü: Word başlık yapısı; anahtar kelimeler "Ana anahtar kelime" + "Yardımcı ifadeler").
 * Metinlerde şube, fiyat, süre veya proje iddiası yoktur; fabrika showroom Tuzla'dadır.
 * SUNUCU modülü: istemci bileşenlerinde names.ts kullanın (bu dosya tüm metni içerir).
 * İl/ilçe eklenir veya adı değişirse names.json yeniden üretilmeli (data/*.json → ad/slug/odak).
 */
export type AreaSection = { title: string; paras: string[]; bullets: string[] };
export type AreaPage = {
  name: string;
  slug: string;
  h1: string;
  seoTitle: string;
  meta: string;
  /** Word paketindeki "Ana anahtar kelime" + "Yardımcı ifadeler" (virgülle). */
  keywords?: string;
  /** İçerik odağı (kart ve listelerde kısa açıklama). */
  focus: string;
  intro: string[];
  sections: AreaSection[];
  faqs: { q: string; a: string }[];
  closing: AreaSection | null;
  /** Önerilen düğme metni (ör. "Çayırova Projem İçin Görüşme Talep Et"). */
  cta: string;
  /** Sayfa görseli (hizmet bölgeleri görsel paketi). */
  image?: { url: string; alt: string; width: number; height: number };
};
export type Province = { name: string; slug: string; page: AreaPage; districts: AreaPage[] };

export const PROVINCES: Province[] = [istanbul, kocaeli, sakarya, yalova, bursa, balikesir, canakkale, tekirdag, edirne, kirklareli, ankara, izmir, mugla, bolu, duzce, aydin, antalya] as Province[];

export const SHOWROOM_AREA = { province: "istanbul", district: "tuzla", name: "Tuzla" } as const;
export const DISTRICT_TOTAL = PROVINCES.reduce((n, p) => n + p.districts.length, 0);

/**
 * İndekslenen ilçe sayfaları. Yayın planı: yerel bilgisi (doğrulanmış hizmet ayrıntısı, izinli proje, gerçek saha
 * sorusu) eklenmemiş ilçe taslakları toplu indekslenmez — Google'ın "doorway" / ölçekli içerik politikası.
 * Bu illerin ilçe sayfaları sitemap'te ve indekste; diğerleri yayında ama `noindex, follow`.
 * Yerel bilgi eklenen il buraya eklenerek indekse açılır. İl sayfalarının tamamı indekslenir.
 */
export const INDEXED_DISTRICT_PROVINCES: readonly string[] = ["istanbul"];
export const isDistrictIndexable = (provinceSlug: string) => INDEXED_DISTRICT_PROVINCES.includes(provinceSlug);

export const provinceBySlug = (slug: string) => PROVINCES.find((p) => p.slug === slug) ?? null;
export const districtOf = (province: Province, slug: string) => province.districts.find((d) => d.slug === slug) ?? null;
/** Eski düz İstanbul adresleri (/hizmet-bolgeleri/tuzla) → yeni hiyerarşi için. */
export const istanbulDistrictBySlug = (slug: string) => districtOf(PROVINCES[0]!, slug);

export { districtOption, DISTRICT_OPTION_GROUPS, DISTRICT_OPTIONS, OTHER_AREA_OPTION } from "./names";

