import { serviceBySlug } from "@/content/company";
import { DISTRICT_CONTENT } from "@/content/districts";

/** İçerik dosyasındaki hizmet / ilçe sayfası için varsayılan SEO (tek kaynak: content/*). */
function serviceEntry(slug: string) {
  const s = serviceBySlug(slug)!;
  return { label: `Hizmet: ${s.name}`, path: `/hizmetler/${slug}`, defaults: { title: `${s.metaTitle} | Bifire`, description: s.metaDescription } };
}
/** 39 ilçe sayfası: anahtar "bolge-<slug>"; varsayılan başlık H1, açıklama girişin ilk cümleleri. */
const DISTRICT_ENTRIES = Object.fromEntries(
  DISTRICT_CONTENT.map((d) => [
    `bolge-${d.slug}`,
    { label: `Hizmet bölgesi: ${d.name}`, path: `/hizmet-bolgeleri/${d.slug}`, defaults: { title: `${d.h1} | Bifire`, description: d.metaDescription } },
  ]),
) as Record<`bolge-${string}`, { label: string; path: string; defaults: { title: string; description: string } }>;

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
    path: "/blog",
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
      title: "İstanbul Şömine Hizmet Bölgeleri | Bifire",
      description: "Tuzla fabrika showroomumuzdan İstanbul'un 39 ilçesindeki şömine projelerine: keşif, özel ölçü üretim ve montaj. İlçenizi seçin, projenizi konuşalım.",
    },
  },
  ...DISTRICT_ENTRIES,
} as const;

export type StaticPageKey = keyof typeof STATIC_PAGES;

export const STATIC_PAGE_KEYS = Object.keys(STATIC_PAGES) as StaticPageKey[];

export function isStaticPageKey(key: string): key is StaticPageKey {
  return key in STATIC_PAGES;
}
