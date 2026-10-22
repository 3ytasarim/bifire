/**
 * Hizmet bölgeleri (yerel SEO). Tek kaynak: form ilçe listesi, /hizmet-bolgeleri sayfası, ana sayfa bölümü ve
 * öncelikli ilçe sayfaları buradan beslenir.
 *
 * Kural (ince içerik riskine karşı): Ayrı sayfa YALNIZCA `page` alanı olan öncelikli ilçelere açılır ve her birinin
 * içeriği o ilçeye özgüdür. Diğer ilçeler tek "Hizmet Bölgeleri" sayfasında listelenir. İlçe sayfası o ilçede şube
 * olduğu anlamına gelmez; bu metinlerde de böyle bir iddia yoktur.
 */

export type Side = "Anadolu Yakası" | "Avrupa Yakası";

export type DistrictPage = {
  /** <title> ve H1 için. */
  title: string;
  /** Bulunma ekiyle ilçe adı (ör. "Pendik'teki") — Türkçe ek uyumu elle verilir. */
  locative: string;
  metaDescription: string;
  intro: string;
  /** Bu ilçedeki projelerde öne çıkan konular (ilçeye özgü). */
  focus: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
};

export type District = {
  name: string;
  slug: string;
  side: Side;
  /** Kartlarda görünen kısa odak cümlesi. */
  hint: string;
  priority?: boolean;
  page?: DistrictPage;
};

export const SHOWROOM_DISTRICT = "Tuzla";

export const DISTRICTS: District[] = [
  {
    name: "Tuzla",
    slug: "tuzla",
    side: "Anadolu Yakası",
    hint: "Üretim ve fabrika showroom",
    priority: true,
    page: {
      title: "Tuzla Şömine Üretimi ve Montajı",
      locative: "Tuzla'daki",
      metaDescription:
        "Tuzla'daki fabrika showroomumuzda şömine modellerini ve kaplama malzemelerini yerinde görün. Kendi üretimimiz ve montaj ekibimizle Tuzla'da şömine projeleri.",
      intro:
        "Bifire'nin üretimi ve fabrika showroomu Tuzla'dadır. Tuzla'daki projelerde hazne, cam ve kaplama seçeneklerini showroomda yerinde inceleyebilir, kararlarınızı malzemeyi görerek verebilirsiniz.",
      focus: [
        {
          title: "Showroomdan uygulamaya kısa yol",
          text: "Fabrikanın ilçede olması, numune ve malzeme onayı ile keşif randevularının daha kolay planlanmasını sağlar.",
        },
        {
          title: "Müstakil ev ve site projeleri",
          text: "Müstakil konutlarda odunlu ve doğalgazlı hazneler için baca güzergâhı keşif aşamasında birlikte belirlenir.",
        },
        {
          title: "Özel ölçü üretim",
          text: "Standart ölçülerin mekâna uymadığı durumlarda cam oranı ve kaplama ölçüsü projeye göre birlikte değerlendirilir.",
        },
      ],
      faqs: [
        {
          q: "Tuzla showroomunda hangi ürünleri görebilirim?",
          a: "Sergilenen örnekler zaman zaman değişebilir. Görmek istediğiniz model, kapak mekanizması veya kaplama malzemesi varsa ziyaret öncesinde bizimle teyit etmenizi öneririz.",
        },
        {
          q: "Tuzla'da keşif nasıl planlanır?",
          a: "Mekân fotoğrafları, yaklaşık ölçüler ve baca bilgisiyle ön görüşme yapılır; ardından gerekli görülürse yerinde keşif randevusu planlanır.",
        },
      ],
    },
  },
  {
    name: "Pendik",
    slug: "pendik",
    side: "Anadolu Yakası",
    hint: "Showroom görüşmesinden proje teklifine",
    priority: true,
    page: {
      title: "Pendik Şömine Projeleri",
      locative: "Pendik'teki",
      metaDescription:
        "Pendik'te şömine yaptırmak isteyenler için Tuzla fabrika showroomumuzda ön görüşme, yerinde keşif, özel ölçü üretim ve montaj. Projenizi birlikte planlayalım.",
      intro:
        "Pendik, Tuzla'daki fabrika showroomumuza komşu ilçelerden biridir. Pendik'teki projelerde ilk görüşmeyi showroomda yapıp malzemeleri yerinde görerek teklif kapsamını netleştirebilirsiniz.",
      focus: [
        {
          title: "Showroomda ön görüşme",
          text: "Planınızı ve mekân fotoğraflarınızı showrooma getirerek hazne tipi, cam yönü ve kaplama seçeneklerini birlikte değerlendirebiliriz.",
        },
        {
          title: "Konut ve villa projeleri",
          text: "Apartman dairelerinde baca durumuna göre elektrikli veya bioethanol, müstakil yapılarda odunlu ve doğalgazlı seçenekler değerlendirilir.",
        },
        {
          title: "Yazılı teklif kapsamı",
          text: "Hazne, kaplama, yalıtım, baca, nakliye ve montaj başlıkları teklifte ayrı ayrı belirtilir.",
        },
      ],
      faqs: [
        {
          q: "Pendik'teki projem için önce showrooma mı gelmeliyim?",
          a: "Zorunlu değildir. Fotoğraf ve ölçülerle uzaktan ön görüşme yapılabilir; ancak malzeme ve kaplama seçimini yerinde görmek kararı kolaylaştırır.",
        },
        {
          q: "Apartman dairesine şömine yapılabilir mi?",
          a: "Baca imkânı yoksa elektrikli veya bioethanol modeller değerlendirilebilir. Baca bulunan binalarda teknik durum incelendikten sonra diğer seçenekler de mümkün olabilir.",
        },
      ],
    },
  },
  {
    name: "Kartal",
    slug: "kartal",
    side: "Anadolu Yakası",
    hint: "Keşiften üretime ölçü onayı",
    priority: true,
    page: {
      title: "Kartal Şömine Tasarımı ve Montajı",
      locative: "Kartal'daki",
      metaDescription:
        "Kartal'da şömine projeleri: yerinde keşif, ölçü onayı, özel ölçü üretim ve kendi montaj ekibimizle uygulama. Tuzla fabrika showroomumuzda malzemeleri görün.",
      intro:
        "Kartal'daki projelerde süreç, yerinde keşif ve ölçü onayıyla netleşir. Nihai ölçüler onaylandıktan sonra üretim ve montaj planı birlikte belirlenir.",
      focus: [
        {
          title: "Keşif ve ölçü onayı",
          text: "Hazne, cam ve tamamlanmış kaplama ölçüleri birbirinden farklıdır; uygulama ölçüsü keşifte alınır ve üretimden önce onaylanır.",
        },
        {
          title: "Yeni yapı ve tadilat",
          text: "Yeni yapılarda şömine, inşaat iş programına göre planlanır; tadilatlarda mevcut duvar ve baca durumu incelenir.",
        },
        {
          title: "Kendi montaj ekibimiz",
          text: "Baca bağlantısı, yanma havası, ısı yalıtımı ve kaplama işleri aynı ekip tarafından koordine edilir.",
        },
      ],
      faqs: [
        {
          q: "Ölçü onayı neden önemlidir?",
          a: "Şömine haznesi, cam ve kaplama ölçüleri mekâna göre değişir. Onaylanmış ölçü, üretimin ve montajın sorunsuz ilerlemesi için temel kabul edilir.",
        },
        {
          q: "Tadilat sırasında şömine yaptırabilir miyim?",
          a: "Evet. Tadilat iş sırasına göre şömine uygulamasının hangi aşamada yapılacağı birlikte planlanır.",
        },
      ],
    },
  },
  {
    name: "Maltepe",
    slug: "maltepe",
    side: "Anadolu Yakası",
    hint: "Kaplama ve malzeme onayı",
    priority: true,
    page: {
      title: "Maltepe Şömine Modelleri ve Uygulama",
      locative: "Maltepe'deki",
      metaDescription:
        "Maltepe'de şömine yaptırmak için hazne ve kaplama seçimi, malzeme onayı ve montaj. Traverten, mermer ve doğal taş seçeneklerini Tuzla showroomumuzda görün.",
      intro:
        "Maltepe'deki projelerde şöminenin mekândaki karakterini çoğunlukla kaplama belirler. Traverten, mermer ve doğal taş seçeneklerini numunelerle karşılaştırarak karar verebilirsiniz.",
      focus: [
        {
          title: "Kaplama ve malzeme onayı",
          text: "Renk, doku ve damar yönü numune üzerinden onaylanır; zemin ve mobilya tonlarıyla birlikte değerlendirilir.",
        },
        {
          title: "Salon oranlarına uygun hazne",
          text: "Hazne genişliği ve gövde yüksekliği, duvarın ve oturma düzeninin oranına göre seçilir.",
        },
        {
          title: "Baca durumuna göre yakıt",
          text: "Mevcut baca imkânı, odunlu, doğalgazlı, elektrikli veya bioethanol seçenekler arasında ilk belirleyicidir.",
        },
      ],
      faqs: [
        {
          q: "Kaplama malzemesini nasıl seçmeliyim?",
          a: "Görünüm kadar ısıya dayanım ve bakım ihtiyacı da önemlidir. Numuneleri mekânınızın ışığında görmek ve zemin tonlarıyla karşılaştırmak en sağlıklı yöntemdir.",
        },
        {
          q: "Traverten mi mermer mi?",
          a: "Traverten daha mat ve sıcak bir doku sunar; mermer daha belirgin damarlı ve parlak bir etki yaratır. Seçim, mekânın genel tasarım diline göre yapılır.",
        },
      ],
    },
  },
  {
    name: "Ataşehir",
    slug: "atasehir",
    side: "Anadolu Yakası",
    hint: "Mekâna yerleşim ve tadilat",
    priority: true,
    page: {
      title: "Ataşehir Şömine Çözümleri",
      locative: "Ataşehir'deki",
      metaDescription:
        "Ataşehir'deki daire ve rezidanslar için şömine çözümleri: bacasız elektrikli ve bioethanol seçenekler, yerleşim planlaması ve montaj. Projenizi birlikte değerlendirelim.",
      intro:
        "Ataşehir'deki projelerin önemli bir kısmı daire ve rezidanslardadır. Bu tür mekânlarda yakıt seçimini baca imkânı ve bina koşulları belirler; yerleşim ise oturma düzeni ve sabit mobilyalarla birlikte planlanır.",
      focus: [
        {
          title: "Bacasız seçenekler",
          text: "Baca imkânı olmayan dairelerde elektrikli şömineler ve düzenli havalandırma koşuluyla bioethanol modeller değerlendirilebilir.",
        },
        {
          title: "Yerleşim ve tadilat",
          text: "Televizyon duvarı, sabit mobilya ve şömine birlikte tasarlanarak mekânda bütüncül bir görünüm sağlanır.",
        },
        {
          title: "Bina ve yönetim koşulları",
          text: "Çalışma saatleri, malzeme taşıma ve yönetim izinleri gibi konular montaj planında baştan dikkate alınır.",
        },
      ],
      faqs: [
        {
          q: "Rezidans dairesine gerçek alevli şömine yapılabilir mi?",
          a: "Baca yoksa bioethanol şömineler gerçek alev sunabilir; ancak mekânın düzenli havalandırılması ve üretici talimatlarına uyulması gerekir. Bina yönetiminin kurallarını da önceden öğrenmenizi öneririz.",
        },
        {
          q: "Elektrikli şömine montajı ne gerektirir?",
          a: "Baca gerektirmez; uygun elektrik bağlantısı ve yerleşim planı yeterlidir. Gömme modellerde duvar içi hazırlık birlikte planlanır.",
        },
      ],
    },
  },
  {
    name: "Sarıyer",
    slug: "sariyer",
    side: "Avrupa Yakası",
    hint: "Özel tasarım ve mimarla koordinasyon",
    priority: true,
    page: {
      title: "Sarıyer Özel Tasarım Şömine",
      locative: "Sarıyer'deki",
      metaDescription:
        "Sarıyer'deki villa ve konut projeleri için özel ölçü şömine tasarımı, mimar ve iç mimarla koordinasyon, kendi üretimimiz ve montaj ekibimizle uygulama.",
      intro:
        "Sarıyer'deki villa ve müstakil konut projelerinde şömine çoğunlukla mimari projenin bir parçası olarak tasarlanır. Bu projelerde mimar ve iç mimarla erken aşamada koordinasyon, sonucu doğrudan etkiler.",
      focus: [
        {
          title: "Mimarla koordinasyon",
          text: "Hazne ölçüsü, baca güzergâhı ve kaplama detayları mimari çizimlerle birlikte, uygulama başlamadan netleştirilir.",
        },
        {
          title: "Özel ölçü tasarım",
          text: "Üç tarafı camlı, tünel veya köşe gibi hazne tipleri, manzara ve oturma düzenine göre özel ölçüde değerlendirilir.",
        },
        {
          title: "Uzak mesafede planlama",
          text: "Ön görüşme fotoğraf ve çizimlerle uzaktan yapılabilir; yerinde keşif ve montaj takvimi birlikte planlanır.",
        },
      ],
      faqs: [
        {
          q: "Mimarımla birlikte çalışabilir misiniz?",
          a: "Evet. Hazne teknik bilgileri, baca ve yalıtım detayları mimar veya iç mimarınızla paylaşılarak projeye birlikte işlenir.",
        },
        {
          q: "Avrupa Yakası'ndaki projeler için showroom ziyareti şart mı?",
          a: "Şart değildir. Ön görüşme uzaktan yapılabilir; malzeme ve model seçimini yerinde görmek isterseniz Tuzla showroom ziyaretini birlikte planlayabiliriz.",
        },
      ],
    },
  },
  { name: "Adalar", slug: "adalar", side: "Anadolu Yakası", hint: "Taşıma ve saha hazırlığı" },
  { name: "Arnavutköy", slug: "arnavutkoy", side: "Avrupa Yakası", hint: "Proje konumu ve iş programı" },
  { name: "Avcılar", slug: "avcilar", side: "Avrupa Yakası", hint: "Kullanılan evde tadilat" },
  { name: "Bağcılar", slug: "bagcilar", side: "Avrupa Yakası", hint: "Apartman erişimi ve montaj kapsamı" },
  { name: "Bahçelievler", slug: "bahcelievler", side: "Avrupa Yakası", hint: "Mobilya ile şömine yerleşimi" },
  { name: "Bakırköy", slug: "bakirkoy", side: "Avrupa Yakası", hint: "Mevcut şöminenin yenilenmesi" },
  { name: "Başakşehir", slug: "basaksehir", side: "Avrupa Yakası", hint: "Teslim öncesi iç mimari koordinasyon" },
  { name: "Bayrampaşa", slug: "bayrampasa", side: "Avrupa Yakası", hint: "Teklif kapsamı ve satın alma" },
  { name: "Beşiktaş", slug: "besiktas", side: "Avrupa Yakası", hint: "İç mimari bütünlük ve malzeme" },
  { name: "Beykoz", slug: "beykoz", side: "Anadolu Yakası", hint: "Birden fazla görüş açısından tasarım" },
  { name: "Beylikdüzü", slug: "beylikduzu", side: "Avrupa Yakası", hint: "Toplam proje bütçesi ve alternatifler" },
  { name: "Beyoğlu", slug: "beyoglu", side: "Avrupa Yakası", hint: "Mevcut yapı ve korunacak detaylar" },
  { name: "Büyükçekmece", slug: "buyukcekmece", side: "Avrupa Yakası", hint: "Geniş cephede ölçü ve kullanım" },
  { name: "Çatalca", slug: "catalca", side: "Avrupa Yakası", hint: "Adrese göre saha ve teslim planı" },
  { name: "Çekmeköy", slug: "cekmekoy", side: "Anadolu Yakası", hint: "Duvar ve köşe yerleşimi karşılaştırması" },
  { name: "Esenler", slug: "esenler", side: "Avrupa Yakası", hint: "Baca bilgisi ve sistem seçimi" },
  { name: "Esenyurt", slug: "esenyurt", side: "Avrupa Yakası", hint: "Binada çalışma ve taşıma organizasyonu" },
  { name: "Eyüpsultan", slug: "eyupsultan", side: "Avrupa Yakası", hint: "Sıfırdan uygulama ile yenileme kapsamı" },
  { name: "Fatih", slug: "fatih", side: "Avrupa Yakası", hint: "Yapı bilgileri ve korunacak unsurlar" },
  { name: "Gaziosmanpaşa", slug: "gaziosmanpasa", side: "Avrupa Yakası", hint: "İlk sipariş ve karar aşamaları" },
  { name: "Güngören", slug: "gungoren", side: "Avrupa Yakası", hint: "Ölçü ve kullanım alanı" },
  { name: "Kadıköy", slug: "kadikoy", side: "Anadolu Yakası", hint: "Televizyon ve sabit mobilya yerleşimi" },
  { name: "Kâğıthane", slug: "kagithane", side: "Avrupa Yakası", hint: "Depolama alanları ve servis erişimi" },
  { name: "Küçükçekmece", slug: "kucukcekmece", side: "Avrupa Yakası", hint: "Salonun farklı kullanım alanları" },
  { name: "Sancaktepe", slug: "sancaktepe", side: "Anadolu Yakası", hint: "İnşaat ve tadilat iş sırası" },
  { name: "Silivri", slug: "silivri", side: "Avrupa Yakası", hint: "Uzaktan ön görüşme ve saha randevusu" },
  { name: "Sultanbeyli", slug: "sultanbeyli", side: "Anadolu Yakası", hint: "Dış ölçüler ve özel üretim kararı" },
  { name: "Sultangazi", slug: "sultangazi", side: "Avrupa Yakası", hint: "Montaj hazırlığı ve iş paylaşımı" },
  { name: "Şile", slug: "sile", side: "Anadolu Yakası", hint: "Kullanım sıklığı ve proje konumu" },
  { name: "Şişli", slug: "sisli", side: "Avrupa Yakası", hint: "Bütünleşik cephe ve detay onayı" },
  { name: "Ümraniye", slug: "umraniye", side: "Anadolu Yakası", hint: "Cam düzeni ve kapak kullanımı" },
  { name: "Üsküdar", slug: "uskudar", side: "Anadolu Yakası", hint: "Görüş yönü ve korunacak dekorasyon" },
  { name: "Zeytinburnu", slug: "zeytinburnu", side: "Avrupa Yakası", hint: "Teslim kapsamı ve kullanım bilgileri" },
];

export const PRIORITY_DISTRICTS = DISTRICTS.filter((d) => d.priority);
export const DISTRICT_PAGES = DISTRICTS.filter((d): d is District & { page: DistrictPage } => Boolean(d.page));
export const districtBySlug = (slug: string) => DISTRICT_PAGES.find((d) => d.slug === slug);
/** Form seçenekleri: alfabetik İstanbul ilçeleri + İstanbul dışı. */
export const DISTRICT_OPTIONS = [...DISTRICTS.map((d) => d.name).sort((a, b) => a.localeCompare(b, "tr")), "İstanbul dışı"];

/**
 * Öncelikli ilçe sayfalarının ek içeriği (ilçeye özgü). `products` → bu tür projelerde öne çıkan ürün sayfaları
 * (slug); yalnızca var olan, aktif ürünler gösterilir. İstatistik veya "X proje yaptık" gibi doğrulanamayan iddia yok.
 */
export type DistrictExtra = {
  body: string[];
  focus: { title: string; text: string }[];
  products: string[];
  faqs: { q: string; a: string }[];
};

export const DISTRICT_EXTRA: Record<string, DistrictExtra> = {
  tuzla: {
    body: [
      "Showroomun ilçede olması, karar sürecini somutlaştırır: kaplama numunelerini gün ışığında görebilir, kapak mekanizmalarını yakından inceleyebilir ve ölçü sorularınızı ekibimizle aynı masada konuşabilirsiniz.",
      "Tuzla'da sahil tarafındaki konutlardan site içi villalara kadar farklı yapı tipleri bulunur. Her projede baca durumu, yerleşim ve kaplama kararı mekânın kendi koşullarına göre ele alınır.",
    ],
    focus: [{ title: "Numuneyle karar", text: "Traverten, mermer ve doğal taş numunelerini showroomda karşılaştırıp mekânınızın tonlarına göre seçim yapabilirsiniz." }],
    products: ["l-tipi-odunlu-somine", "cift-yonlu-odunlu-somine", "orta-odunlu-somine", "bioethanol-somine"],
    faqs: [
      { q: "Showroom ziyareti için randevu almalı mıyım?", a: "Görmek istediğiniz örneğin hazır olmasını teyit edebilmek için ziyaretinizi önceden planlamanızı öneririz." },
      { q: "Tuzla'daki projem için süreç nasıl başlar?", a: "Mekân fotoğrafları, yaklaşık ölçüler ve baca bilgisiyle ön görüşme yapılır; ardından showroom ziyareti ve gerekirse yerinde keşif planlanır." },
    ],
  },
  pendik: {
    body: [
      "Pendik'te yeni konut projelerinden müstakil yapılara kadar farklı mekânlarda şömine talebi oluşur. Yeni yapılarda şöminenin inşaat iş programına göre planlanması, sonradan yapılacak değişiklikleri azaltır.",
      "Showroomun yakın olması sayesinde ön görüşmeyi yüz yüze yapıp malzeme ve model seçimini somutlaştırabilir, ardından keşif ve teklif adımlarına geçebilirsiniz.",
    ],
    focus: [{ title: "Yeni yapıda erken planlama", text: "İnşaat sürerken baca güzergâhı ve hazne boşluğunun planlanması, uygulamayı kolaylaştırır ve sonradan yapılacak tadilatı azaltır." }],
    products: ["duz-odunlu-somine", "l-tipi-odunlu-somine", "elektrikli-somine", "bioethanol-somine"],
    faqs: [
      { q: "Yeni yapılan evime şömine ne zaman planlanmalı?", a: "Mümkünse inşaat aşamasında. Baca güzergâhı, hazne boşluğu ve elektrik altyapısı erken planlandığında uygulama daha sorunsuz ilerler." },
      { q: "Teklif ne zaman netleşir?", a: "Model, nihai ölçü, saha koşulları ve iş kapsamı netleştiğinde yazılı teklif hazırlanır." },
    ],
  },
  kartal: {
    body: [
      "Kartal'daki projelerde süreç çoğunlukla ölçü sorularıyla başlar: hazne ölçüsü, cam oranı ve tamamlanmış kaplamanın duvardaki yeri. Bu soruların yanıtı keşifte alınan ölçülerle netleşir.",
      "Onaylanmış ölçüler üretimin temelidir. Ölçü onayı tamamlandıktan sonra üretim ve montaj takvimi birlikte belirlenir; kendi montaj ekibimiz baca, yalıtım ve kaplama işlerini tek elden koordine eder.",
    ],
    focus: [{ title: "Tek elden koordinasyon", text: "Hazne montajı, baca bağlantısı, yalıtım ve kaplama işleri aynı ekip tarafından sırasıyla yürütülür." }],
    products: ["duz-odunlu-somine", "epi-odunlu-somine", "u-tipi-odunlu-somine", "elektrikli-somine"],
    faqs: [
      { q: "Keşifte neler yapılır?", a: "Uygulama yerinin ölçüsü, erişimi ve mevcut durumu incelenir; baca ve yanma havası koşulları değerlendirilir." },
      { q: "Montaj sırasında başka ekiplerle çalışılabilir mi?", a: "Evet. İş sırası, ölçüler ve sorumluluklar proje özelinde diğer ekiplerle birlikte netleştirilir." },
    ],
  },
  maltepe: {
    body: [
      "Maltepe'deki projelerde kaplama seçimi genellikle kararın merkezindedir. Aynı hazne, farklı bir kaplamayla bambaşka bir karakter kazanabilir; bu yüzden numune üzerinden onay önemlidir.",
      "Kaplama kararı verilirken yalnızca görünüm değil; ısıya dayanım, bakım ihtiyacı ve zemin, mobilya, aydınlatma tonlarıyla uyum da birlikte değerlendirilir.",
    ],
    focus: [{ title: "Isıya dayanım ve bakım", text: "Haznenin çevresindeki yüzeyler ısıya dayanıklı malzemelerle yalıtılır; seçilen taşın bakım ihtiyacı teslimde paylaşılır." }],
    products: ["prizma-odunlu-somine", "duz-odunlu-somine", "l-tipi-odunlu-somine", "epi-odunlu-somine"],
    faqs: [
      { q: "Kaplama numunelerini nerede görebilirim?", a: "Tuzla fabrika showroomumuzda kaplama malzemelerini ve numuneleri yerinde inceleyebilirsiniz." },
      { q: "Mevcut şöminemin kaplamasını yeniletebilir miyim?", a: "Mevcut hazne ve gövdenin durumu incelendikten sonra kaplama yenileme kapsamı değerlendirilebilir." },
    ],
  },
  atasehir: {
    body: [
      "Ataşehir'deki daire ve rezidanslarda şömine kararı çoğunlukla bina koşullarıyla başlar: baca imkânı, yönetim kuralları ve çalışma saatleri. Bu koşullar yakıt seçimini ve montaj planını doğrudan etkiler.",
      "Baca imkânı olmayan mekânlarda elektrikli şömineler pratik bir çözüm sunar; gerçek alev isteniyorsa bioethanol modeller düzenli havalandırma koşuluyla değerlendirilebilir.",
    ],
    focus: [{ title: "Televizyon duvarıyla bütünlük", text: "Gömme elektrikli şömine, televizyon ve sabit mobilyalarla aynı duvar tasarımında planlanarak bütüncül bir görünüm elde edilir." }],
    products: ["elektrikli-somine", "bioethanol-somine", "duz-odunlu-somine", "l-tipi-odunlu-somine"],
    faqs: [
      { q: "Bina yönetiminden izin gerekir mi?", a: "Binanın kurallarına bağlıdır. Çalışma saatleri, malzeme taşıma ve olası izinleri bina yönetiminden önceden öğrenmenizi öneririz." },
      { q: "Rezidansta hangi şömine tipi daha uygun?", a: "Baca yoksa elektrikli veya bioethanol şömineler değerlendirilir. Seçim, kullanım beklentinize ve havalandırma koşullarına göre yapılır." },
    ],
  },
  sariyer: {
    body: [
      "Sarıyer'de manzara çoğu zaman yerleşimi belirler. Şöminenin konumu, oturma grubunun hem ateşe hem manzaraya bakabileceği şekilde planlandığında mekân en iyi şekilde kullanılır.",
      "Villa projelerinde şömine mimari projenin bir parçası olarak ele alınır. Hazne teknik bilgileri, baca ve yalıtım detayları mimar veya iç mimarla erken aşamada paylaşılarak çizimlere işlenir.",
    ],
    focus: [{ title: "Manzarayla birlikte yerleşim", text: "Şöminenin konumu, oturma grubunun hem ateşe hem manzaraya bakabileceği şekilde planlanır." }],
    products: ["orta-odunlu-somine", "u-tipi-odunlu-somine", "cift-yonlu-odunlu-somine", "prizma-odunlu-somine"],
    faqs: [
      { q: "Mimari projeye şömine nasıl işlenir?", a: "Hazne teknik bilgileri, baca güzergâhı ve yalıtım detayları mimar veya iç mimarınızla paylaşılır ve çizimlere birlikte işlenir." },
      { q: "Bahçe şöminesi de planlayabilir misiniz?", a: "Evet. Bahçe şömineleri, ateş çukurları ve bahçe mutfakları da açık alan projesinin parçası olarak planlanabilir." },
    ],
  },
};

/** Bölgeler sayfası: yaka özetleri ve SSS. */
export const SIDES: { side: Side; text: string }[] = [
  {
    side: "Anadolu Yakası",
    text: "Tuzla fabrika showroomumuz Anadolu Yakası'ndadır. Tuzla, Pendik, Kartal, Maltepe ve Ataşehir gibi ilçelerde ön görüşmeyi showroomda yapıp malzemeleri yerinde görerek ilerlemek daha kolaydır.",
  },
  {
    side: "Avrupa Yakası",
    text: "Avrupa Yakası'ndaki projelerde ön görüşme fotoğraf, plan ve ölçülerle uzaktan yapılabilir. Malzeme ve model seçimini yerinde görmek isterseniz showroom ziyaretini, ardından yerinde keşif ve montaj takvimini birlikte planlarız.",
  },
];

export const REGION_FAQS = [
  { q: "İlçemde şubeniz var mı?", a: "Hayır. Tüm projeler Tuzla'daki fabrika showroomumuz ve kendi montaj ekibimizle yürütülür. İlçe sayfaları, o bölgedeki projelere nasıl yaklaştığımızı anlatır." },
  { q: "İstanbul dışındaki projelere hizmet veriyor musunuz?", a: "Proje konumuna göre değerlendirilir. Formda “İstanbul dışı” seçeneğini işaretleyerek projenizi paylaşabilirsiniz; kapsam ve takvim uygunluğu ön görüşmede netleşir." },
  { q: "Ön görüşme için showroom ziyareti şart mı?", a: "Şart değildir. Ön görüşme fotoğraf, plan ve ölçülerle uzaktan yapılabilir; malzemeleri yerinde görmek isterseniz showroom ziyaretini birlikte planlarız." },
  { q: "Keşif ve montaj takvimi nasıl belirlenir?", a: "Model, nihai ölçü ve iş kapsamı netleştikten sonra proje konumu ve iş programına göre birlikte planlanır." },
];
