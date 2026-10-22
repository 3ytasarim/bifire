import { serviceBySlug } from "@/content/company";
import { isDistrictIndexable, PROVINCES } from "@/content/service-areas";

/** İçerik dosyasındaki hizmet sayfası için varsayılan SEO (tek kaynak: content/*). */
function serviceEntry(slug: string) {
  const s = serviceBySlug(slug)!;
  return { label: `Hizmet: ${s.name}`, path: `/hizmetler/${slug}`, defaults: { title: /bifire/i.test(s.metaTitle) ? s.metaTitle : `${s.metaTitle} | Bifire`, description: s.metaDescription } };
}
type AreaEntry = { label: string; path: string; defaults: { title: string; description: string; keywords?: string } };
/**
 * Hizmet bölgeleri: 11 il sayfası ("il-<il>") ve indekslenen ilçe sayfaları ("bolge-<ilçe>", şimdilik İstanbul).
 * Varsayılanlar Word paketindeki SEO başlığı ve meta açıklamasıdır. noindex ilçe taslakları burada değildir.
 */
const AREA_ENTRIES = Object.fromEntries(
  PROVINCES.flatMap((p) => [
    [`il-${p.slug}`, { label: `Hizmet bölgesi (il): ${p.name}`, path: `/hizmet-bolgeleri/${p.slug}`, defaults: { title: p.page.seoTitle, description: p.page.meta, keywords: p.page.keywords } }],
    ...(isDistrictIndexable(p.slug)
      ? p.districts.map((d) => [`bolge-${d.slug}`, { label: `Hizmet bölgesi: ${d.name} (${p.name})`, path: `/hizmet-bolgeleri/${p.slug}/${d.slug}`, defaults: { title: d.seoTitle, description: d.meta, keywords: d.keywords } }])
      : []),
  ]),
) as Record<`il-${string}` | `bolge-${string}`, AreaEntry>;

/**
 * Admin > SEO menüsünde yönetilen statik sayfalar. `defaults` admin alanları boş bırakıldığında kullanılan
 * otomatik SEO'dur — sayfa hiçbir zaman SEO'suz kalmaz.
 */
export const STATIC_PAGES = {
  home: {
    label: "Ana Sayfa",
    path: "/",
    defaults: {
      title: "Bifire Şömine | Tuzla Şömine Üretimi, Tasarımı ve Montajı",
      description:
        "Odunlu, elektrikli ve bioethanol şömineler; özel ölçü tasarım, kendi üretimimiz ve montaj ekibimizle İstanbul genelinde uygulama. Tuzla fabrika showroom.",
    },
  },
  kurumsal: {
    label: "Kurumsal",
    path: "/kurumsal",
    defaults: {
      title: "Kurumsal | Bifire",
      description: "Bifire; şömineyi bir ısıtma cihazı değil, yaşam alanının mimari merkezi olarak ele alan şömine markasıdır.",
    },
  },
  urunler: {
    label: "Ürünler",
    path: "/urunler",
    defaults: {
      title: "Şömine Modelleri ve Şömine Sistemleri | Bifire",
      description:
        "Şömine hazneleri, elektrikli, doğalgazlı, bioethanol, orta ve bahçe şömineleri. Teknik özellikleriyle tüm Bifire şömine modellerini inceleyin.",
    },
  },
  projeler: {
    label: "Projeler",
    path: "/projeler",
    defaults: {
      title: "Şömine Projeleri ve Uygulamalar | Bifire",
      description: "Konut, villa ve ticari mekânlarda tamamlanan Bifire şömine uygulamaları.",
    },
  },
  blog: {
    label: "Şömine Rehberi",
    path: "/somine-rehberi",
    defaults: {
      title: "Şömine Rehberi | Seçim, Montaj, Baca ve Bakım | Bifire",
      description: "Şömine seçiminden montaj ve bacaya, yalıtımdan kullanım ve bakıma: konulara ayrılmış rehberlerle evinize uygun şömineyi doğru sorularla keşfedin.",
    },
  },
  iletisim: {
    label: "İletişim",
    path: "/iletisim",
    defaults: {
      title: "İletişim | Bifire",
      description: "Şömine projeniz için Bifire ile iletişime geçin; keşif, ürün seçimi ve teklif için size dönüş yapalım.",
    },
  },
  "teklif-al": {
    label: "Teklif Al / Proje başvurusu",
    path: "/teklif-al",
    defaults: {
      title: "Şömine Teklifi ve Proje Başvurusu | Bifire",
      description: "Şömine projeniz için ilçe, ölçü ve beklentilerinizi paylaşın; kendi üretimimiz ve montaj ekibimizle size özel teklif hazırlayalım. Tuzla fabrika showroom.",
    },
  },
  hizmetler: {
    label: "Hizmetler",
    path: "/hizmetler",
    defaults: {
      title: "Şömine Tasarımı ve Montajı Hizmetleri | Bifire",
      description: "Özel ölçü şömine tasarımı ve kendi montaj ekibimizle şömine montajı. Tasarımı uygulamayla birlikte ele alıyoruz; Tuzla fabrika showroom.",
    },
  },
  "hizmet-ozel-olcu": serviceEntry("ozel-olcu-somine-tasarimi"),
  "hizmet-montaj": serviceEntry("somine-montaji"),
  showroom: {
    label: "Fabrika Showroom",
    path: "/fabrika-showroom",
    defaults: {
      title: "Tuzla Şömine Showroom | Fabrika Showroom Ziyareti | Bifire",
      description: "Tuzla fabrika showroomumuzda şömine modellerini, kapak mekanizmalarını ve kaplama malzemelerini yerinde görün. Ziyaretinizi önceden planlayın.",
    },
  },
  "mekan-tasarim": {
    label: "Mekânınıza Özel Tasarım",
    path: "/mekaniniza-ozel-tasarim",
    defaults: {
      title: "Mekânınıza Özel Şömine Tasarımı | Fotoğrafınızı Paylaşın | Bifire",
      description: "Mekânınızın fotoğrafını ve tercihlerinizi paylaşın; şöminenizin yaşam alanınızdaki yerleşimini görsel öneriyle birlikte tasarlayalım. Tuzla fabrika showroom.",
    },
  },
  "hizmet-bolgeleri": {
    label: "Hizmet Bölgeleri",
    path: "/hizmet-bolgeleri",
    defaults: {
      title: "Şömine Hizmet Bölgeleri | İstanbul, Marmara ve Ankara | Bifire",
      description: "Tuzla’daki üretim ve fabrika showroomumuzdan İstanbul, Marmara’daki 10 il ve Ankara’daki şömine projelerine: özel tasarım, sevkiyat ve montaj.",
    },
  },
  ...AREA_ENTRIES,
} as const;

export type StaticPageKey = keyof typeof STATIC_PAGES;

export const STATIC_PAGE_KEYS = Object.keys(STATIC_PAGES) as StaticPageKey[];

export function isStaticPageKey(key: string): key is StaticPageKey {
  return key in STATIC_PAGES;
}

/** Sayfanın varsayılan SEO'su (anahtar kelime yalnızca bazı sayfalarda tanımlı). */
export function pageDefaults(key: StaticPageKey): { title: string; description: string; keywords?: string } {
  return STATIC_PAGES[key].defaults as { title: string; description: string; keywords?: string };
}
