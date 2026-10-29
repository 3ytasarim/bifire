/**
 * Hizmet bölgesi grupları (ana sayfa bölge şeridi ve /hizmet-bolgeleri/bolge/{grup} sayfaları).
 * Tek ilden oluşan gruplar (İstanbul, Ankara) doğrudan il sayfasına gider; diğerleri grup sayfasında
 * illeri ve ilçeleri listeler. İl/ilçe verisi service-areas paketinden gelir.
 */
export type RegionGroup = {
  slug: string;
  label: string;
  /** Grup sayfası H1 ve SEO başlığı. */
  title: string;
  seoTitle: string;
  description: string;
  intro: string;
  provinces: string[];
  /** Tek il → il sayfasına yönlendir (grup sayfası yok). */
  province?: string;
};

export const REGION_GROUPS: RegionGroup[] = [
  {
    slug: "istanbul",
    label: "İstanbul",
    title: "İstanbul",
    seoTitle: "",
    description: "",
    intro: "",
    provinces: ["istanbul"],
    province: "istanbul",
  },
  {
    slug: "marmara",
    label: "Marmara",
    title: "Marmara’da Şömine Tasarımı ve Montajı",
    seoTitle: "Marmara Bölgesi Şömine Tasarımı ve Montajı | Bifire Şömine",
    description: "Kocaeli, Sakarya, Yalova, Bursa, Balıkesir, Çanakkale, Tekirdağ, Edirne ve Kırklareli’deki şömine projelerini Tuzla’daki üretimimiz ve kendi montaj ekibimizle değerlendiriyoruz.",
    intro:
      "Tuzla’daki üretim merkezimize yakın Marmara illerinde şömine projelerini mekânınızın mimarisi, kullanım beklentileriniz ve malzeme tercihlerinizle birlikte ele alıyoruz. İlinizi ve ilçenizi seçerek o bölgedeki tasarım ve uygulama sürecini inceleyebilirsiniz.",
    provinces: ["kocaeli", "sakarya", "yalova", "bursa", "balikesir", "canakkale", "tekirdag", "edirne", "kirklareli"],
  },
  {
    slug: "ege",
    label: "Ege",
    title: "Ege’de Şömine Tasarımı ve Montajı",
    seoTitle: "Ege Bölgesi Şömine Tasarımı ve Montajı | Bifire Şömine",
    description: "İzmir, Muğla ve Aydın’daki şömine projelerini kendi üretimimiz ve kendi montaj ekibimizle; kapsam ve takvim uygunluğuna göre değerlendiriyoruz.",
    intro:
      "İzmir, Muğla ve Aydın’daki konut, yazlık ve villa projelerinde şömineyi yaşam alanının mimarisiyle birlikte tasarlıyoruz. Proje konumu ve takvim, keşif ve montaj planlamasında birlikte netleşir.",
    provinces: ["izmir", "mugla", "aydin"],
  },
  {
    slug: "akdeniz",
    label: "Akdeniz",
    title: "Akdeniz’de Şömine Tasarımı ve Montajı",
    seoTitle: "Akdeniz Bölgesi Şömine Tasarımı ve Montajı | Bifire Şömine",
    description: "Antalya’daki şömine projelerini Tuzla’daki üretimimiz ve kendi montaj ekibimizle, kapsam ve takvim uygunluğuna göre değerlendiriyoruz.",
    intro:
      "Antalya ve ilçelerindeki projelerde şömineyi mekânın oranları, kullanım biçimi ve malzeme tercihleriyle birlikte ele alıyoruz. İlçenizi seçerek bölgedeki süreci inceleyebilirsiniz.",
    provinces: ["antalya"],
  },
  {
    slug: "ankara",
    label: "Ankara",
    title: "Ankara",
    seoTitle: "",
    description: "",
    intro: "",
    provinces: ["ankara"],
    province: "ankara",
  },
  {
    slug: "bolu-ve-duzce",
    label: "Bolu ve Düzce",
    title: "Bolu ve Düzce’de Şömine Tasarımı ve Montajı",
    seoTitle: "Bolu ve Düzce Şömine Tasarımı ve Montajı | Bifire Şömine",
    description: "Bolu ve Düzce’deki şömine projelerini kendi üretimimiz ve kendi montaj ekibimizle; kapsam ve takvim uygunluğuna göre değerlendiriyoruz.",
    intro:
      "Bolu ve Düzce’deki dağ evi, konut ve villa projelerinde şömineyi yaşam alanının mimarisi ve kullanım beklentileriyle birlikte şekillendiriyoruz. İlinizi ve ilçenizi seçerek süreci inceleyebilirsiniz.",
    provinces: ["bolu", "duzce"],
  },
];

export const regionGroupBySlug = (slug: string) => REGION_GROUPS.find((g) => g.slug === slug && !g.province) ?? null;
