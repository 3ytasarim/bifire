import { serviceBySlug } from "@/content/company";
import { districtBySlug } from "@/content/regions";

/** İçerik dosyasındaki hizmet / ilçe sayfası için varsayılan SEO (tek kaynak: content/*). */
function serviceEntry(slug: string) {
  const s = serviceBySlug(slug)!;
  return { label: `Hizmet: ${s.name}`, path: `/hizmetler/${slug}`, defaults: { title: `${s.metaTitle} | Bifire`, description: s.metaDescription } };
}
function districtEntry(slug: string) {
  const d = districtBySlug(slug)!;
  return { label: `Hizmet bölgesi: ${d.name}`, path: `/hizmet-bolgeleri/${slug}`, defaults: { title: `${d.page.title} | Bifire`, description: d.page.metaDescription } };
}

/**
 * Admin > SEO menüsünde yönetilen statik sayfalar. `defaults` admin alanları boş bırakıldığında kullanılan
 * otomatik SEO'dur — sayfa hiçbir zaman SEO'suz kalmaz.
 */
export const STATIC_PAGES = {
  home: {
    label: "Ana Sayfa",
    path: "/",
    defaults: {
      title: "Bifire | Modern Şömine Sistemleri ve Mimari Şömine Çözümleri",
      description:
        "Şömine hazneleri, elektrikli, doğalgazlı ve bioethanol şömineler. Bifire yaşam alanınıza özel modern şömine çözümlerini tasarlar ve uygular.",
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
    label: "Blog",
    path: "/blog",
    defaults: {
      title: "Şömine Rehberi ve İlham | Bifire Blog",
      description: "Şömine seçimi, yakıt türleri, bakım ve tasarım üzerine rehber içerikler.",
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
  "hizmet-bolgeleri": {
    label: "Hizmet Bölgeleri",
    path: "/hizmet-bolgeleri",
    defaults: {
      title: "İstanbul Şömine Hizmet Bölgeleri | Bifire",
      description: "Tuzla fabrika showroomumuzdan İstanbul'un 39 ilçesindeki şömine projelerine: keşif, özel ölçü üretim ve montaj. İlçenizi seçin, projenizi konuşalım.",
    },
  },
  "bolge-tuzla": districtEntry("tuzla"),
  "bolge-pendik": districtEntry("pendik"),
  "bolge-kartal": districtEntry("kartal"),
  "bolge-maltepe": districtEntry("maltepe"),
  "bolge-atasehir": districtEntry("atasehir"),
  "bolge-sariyer": districtEntry("sariyer"),
} as const;

export type StaticPageKey = keyof typeof STATIC_PAGES;

export const STATIC_PAGE_KEYS = Object.keys(STATIC_PAGES) as StaticPageKey[];

export function isStaticPageKey(key: string): key is StaticPageKey {
  return key in STATIC_PAGES;
}
