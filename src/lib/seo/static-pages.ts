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
    label: "Teklif Al",
    path: "/teklif-al",
    defaults: {
      title: "Şömine Teklifi Al | Bifire",
      description: "Mekânınıza uygun şömine için ölçü ve beklentilerinizi paylaşın, Bifire size özel teklif hazırlasın.",
    },
  },
} as const;

export type StaticPageKey = keyof typeof STATIC_PAGES;

export const STATIC_PAGE_KEYS = Object.keys(STATIC_PAGES) as StaticPageKey[];

export function isStaticPageKey(key: string): key is StaticPageKey {
  return key in STATIC_PAGES;
}
