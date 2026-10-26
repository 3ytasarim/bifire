import { SERVICE_ARTICLES, type ServiceArticle } from "./service-articles";
/**
 * Firma geneli metinler. Kullanıcı tarafından doğrulanan gerçekler (2026-10-22): kendi üretim, kendi montaj ekibi,
 * Tuzla'da fabrika showroom. Doğrulanamayan iddia (yıl, adet, yüzde, ödül, puan) EKLENMEZ.
 */

export const TRUST_POINTS = [
  { title: "Kendi üretimimiz", text: "Ölçü ve tasarımı projeye göre birlikte ele alırız." },
  { title: "Kendi montaj ekibimiz", text: "Kararları uygulama koşullarıyla buluştururuz." },
  { title: "Tuzla fabrika showroom", text: "Malzemeyi ve örnekleri yerinde değerlendirelim." },
] as const;

/** Proje adımları — ana sayfa (3 adım) ve ürün/hizmet sayfaları (4 adım) için. */
export const PROCESS = [
  {
    key: "degerlendirme",
    label: "Değerlendirme",
    title: "Mekânı tanıyalım",
    text: "İlçe, mekân fotoğrafları, plan ve mevcut baca bilgisiyle başlayalım.",
  },
  {
    key: "tasarim",
    label: "Tasarım",
    title: "Yerleşimi belirleyelim",
    text: "Ölçü, cam yönü, kaplama ve bakım erişimini projenizle birlikte değerlendirelim.",
  },
  {
    key: "teklif",
    label: "Teklif",
    title: "Kapsamı yazılılaştıralım",
    text: "Hazne, kaplama, baca, nakliye ve montaj işlerinin kapsamını açıkça belirleyelim.",
  },
  {
    key: "uygulama",
    label: "Uygulama",
    title: "Onayla ilerleyelim",
    text: "Onaylanan proje ve iş programına göre üretim ile montajı planlayalım.",
  },
] as const;

export type Service = {
  slug: string;
  eyebrow: string;
  name: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  sections: { title: string; text: string }[];
  includes: string[];
  faqs: { q: string; a: string }[];
  /** Uzun SEO metni (HTML): bölümler, SSS, kapanış ve rehber bağlantıları — SeoArticle ile gösterilir. */
  article: string;
  /** Hizmet sayfası başlık görseli (paketten; boşsa site ayarlarındaki görsel). */
  image: string | null;
  imageAlt: string | null;
};

const BASE_SERVICES: Omit<Service, keyof ServiceArticle>[] = [
  {
    slug: "ozel-olcu-somine-tasarimi",
    eyebrow: "Mekânınıza göre",
    name: "Özel Ölçü Şömine Tasarımı",
    summary: "Cam biçiminden dış kaplamaya, ölçü ve malzeme kararlarını evinizin planıyla birlikte ele alalım.",
    sections: [
      {
        title: "Cam biçimi ve görüş yönü",
        text: "Tek cepheli düz, iki yönden görülen L tipi, üç cepheli U tipi veya iki mekânı birleştiren çift yönlü hazneler; oturma düzeni ve izleme noktalarına göre seçilir.",
      },
      {
        title: "Ölçü ve oran",
        text: "Hazne, cam ve tamamlanmış kaplama ölçüleri farklıdır. Duvarın, tavan yüksekliğinin ve mobilyanın oranlarına göre nihai ölçü projede belirlenir.",
      },
      {
        title: "Kaplama ve malzeme",
        text: "Traverten, mermer, doğal taş, sıva veya metal yüzeyler; ısıya dayanım ve bakım ihtiyacıyla birlikte değerlendirilir, numune üzerinden onaylanır.",
      },
      {
        title: "Teknik koşullar",
        text: "Baca, yanma havası, ısı yalıtımı ve bakım erişimi tasarım aşamasında ele alınır; görünüş ile uygulama koşulları birlikte netleşir.",
      },
    ],
    includes: ["Mekân ve kullanım beklentisinin değerlendirilmesi", "Hazne tipi ve cam yönü seçimi", "Kaplama malzemesi ve numune onayı", "Ölçü onayı ve üretim planı"],
  },
  {
    slug: "somine-montaji",
    eyebrow: "Kendi montaj ekibimizle",
    name: "Şömine Montajı",
    summary: "Saha, baca bağlantısı, yanma havası, ısı odası ve kaplama kararları aynı uygulamanın parçalarıdır.",
    sections: [
      {
        title: "Keşif ve saha hazırlığı",
        text: "Uygulama yerinin ölçüsü, erişimi ve mevcut durumu incelenir; malzeme taşıma ve çalışma koşulları baştan planlanır.",
      },
      {
        title: "Baca bağlantısı ve yanma havası",
        text: "Baca uygunluğu, yalnızca bağlantı çapına bakılarak değil; ürün gereklilikleri ve baca koşulları birlikte incelenerek değerlendirilir.",
      },
      {
        title: "Isı yalıtımı",
        text: "Hazne çevresindeki gövde ve kaplama, ısıya dayanıklı malzemelerle yalıtılır; bakım erişimi için gerekli detaylar korunur.",
      },
      {
        title: "Kaplama ve teslim",
        text: "Onaylanan kaplama uygulanır; teslimde ilk kullanım ve bakım konusunda bilgilendirme yapılır.",
      },
    ],
    includes: ["Yerinde keşif", "Baca ve yanma havası değerlendirmesi", "Isı yalıtımı ve kaplama uygulaması", "Teslim ve kullanım bilgilendirmesi"],
  },
];

// Başlık, meta, giriş, SSS ve uzun metin hizmet sayfası Word paketinden gelir (service-articles.ts).
export const SERVICES: Service[] = BASE_SERVICES.map((s) => ({ ...s, ...SERVICE_ARTICLES[s.slug]! }));

export const serviceBySlug = (slug: string) => SERVICES.find((s) => s.slug === slug);

export const SHOWROOM = {
  eyebrow: "Tuzla fabrika showroom",
  title: "Kararınızı showroomda somutlaştıralım.",
  intro: "Planınızı, fotoğraflarınızı ve beğendiğiniz örnekleri getirin. Malzemeyi, cam yönünü ve uygulama ayrıntılarını birlikte konuşalım.",
  steps: [
    { title: "Hazırlanın", text: "Mekân fotoğrafı, yaklaşık ölçüler, varsa plan ve baca bilgileri." },
    { title: "Birlikte değerlendirelim", text: "Cam yönü, kapak kullanımı, kaplama ve mekândaki oranlar." },
    { title: "Sonraki adımı belirleyelim", text: "Gerekli saha incelemesi, teknik bilgiler ve teklif kapsamı." },
  ],
  faqs: [
    { q: "Her modeli showroomda görebilir miyim?", a: "Sergilenen örnekler değişebilir. Görmek istediğiniz modeli ziyaret öncesinde bizimle teyit edin." },
    { q: "Showroomda kesin teklif alabilir miyim?", a: "Model ve malzemeyi görüşebiliriz. Kesin teklif için saha, ölçü ve uygulama kapsamının tamamlanması gerekebilir." },
    { q: "Ziyaret için randevu gerekli mi?", a: "Görmek istediğiniz örneğin hazır olmasını teyit edebilmek için ziyaretinizi önceden planlamanızı öneririz." },
  ],
} as const;

/** Proje başvurusu formu seçenekleri. */
export const PROJECT_TOPICS = ["Genel proje görüşmesi", ...SERVICES.map((s) => s.name)];
export const PROJECT_STAGES = ["Fikir ve araştırma", "Yeni yapı", "Tadilat", "Mevcut şömineyi yenileme"];
export const PROJECT_TIMELINES = ["Önümüzdeki 1 ay", "1–3 ay içinde", "3–6 ay içinde", "Henüz belli değil"];
