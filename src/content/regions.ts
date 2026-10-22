/**
 * İstanbul ilçelerinin ek bilgileri (yaka, öncelik, kart cümlesi, önerilen ürünler) ve bölge sayfası ortak metinleri.
 * Tüm il/ilçe sayfa metinleri `content/service-areas` altındadır (11 il, 175 ilçe). İlçe sayfası o ilçede şube
 * olduğu anlamına gelmez; metinlerde de böyle bir iddia yoktur — fabrika showroom Tuzla'dadır.
 */

export type Side = "Anadolu Yakası" | "Avrupa Yakası";

export type District = {
  name: string;
  slug: string;
  side: Side;
  /** Kartlarda görünen kısa odak cümlesi. */
  hint: string;
  /** Öncelikli görüşme bölgesi (Tuzla, çevre ilçeler, Sarıyer). */
  priority?: boolean;
};

export const DISTRICTS: District[] = [
  { name: "Tuzla", slug: "tuzla", side: "Anadolu Yakası", hint: "Üretim ve fabrika showroom", priority: true },
  { name: "Pendik", slug: "pendik", side: "Anadolu Yakası", hint: "Showroom görüşmesinden proje teklifine", priority: true },
  { name: "Kartal", slug: "kartal", side: "Anadolu Yakası", hint: "Keşiften üretime ölçü onayı", priority: true },
  { name: "Maltepe", slug: "maltepe", side: "Anadolu Yakası", hint: "Kaplama ve malzeme onayı", priority: true },
  { name: "Ataşehir", slug: "atasehir", side: "Anadolu Yakası", hint: "Mekâna yerleşim ve tadilat", priority: true },
  { name: "Sarıyer", slug: "sariyer", side: "Avrupa Yakası", hint: "Özel tasarım ve mimarla koordinasyon", priority: true },
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

/**
 * İlçe sayfasında "bu tür projelerde öne çıkan şömine tipleri" (ürün slug'ları). Yalnızca aktif ürünler gösterilir.
 * Tanımsız ilçeler varsayılan listeyi kullanır.
 */
const DEFAULT_PRODUCTS = ["l-tipi-odunlu-somine", "duz-odunlu-somine", "elektrikli-somine", "bioethanol-somine"];
const DISTRICT_PRODUCTS: Record<string, string[]> = {
  tuzla: ["l-tipi-odunlu-somine", "cift-yonlu-odunlu-somine", "orta-odunlu-somine", "bioethanol-somine"],
  pendik: ["duz-odunlu-somine", "l-tipi-odunlu-somine", "elektrikli-somine", "bioethanol-somine"],
  kartal: ["duz-odunlu-somine", "epi-odunlu-somine", "u-tipi-odunlu-somine", "elektrikli-somine"],
  maltepe: ["prizma-odunlu-somine", "duz-odunlu-somine", "l-tipi-odunlu-somine", "epi-odunlu-somine"],
  atasehir: ["elektrikli-somine", "bioethanol-somine", "duz-odunlu-somine", "l-tipi-odunlu-somine"],
  sariyer: ["orta-odunlu-somine", "u-tipi-odunlu-somine", "cift-yonlu-odunlu-somine", "prizma-odunlu-somine"],
  beykoz: ["u-tipi-odunlu-somine", "l-tipi-odunlu-somine", "cift-yonlu-odunlu-somine", "orta-odunlu-somine"],
  kadikoy: ["elektrikli-somine", "duz-odunlu-somine", "epi-odunlu-somine", "bioethanol-somine"],
  cekmekoy: ["l-tipi-odunlu-somine", "duz-odunlu-somine", "prizma-odunlu-somine", "u-tipi-odunlu-somine"],
  kucukcekmece: ["u-tipi-odunlu-somine", "cift-yonlu-odunlu-somine", "l-tipi-odunlu-somine", "orta-odunlu-somine"],
  buyukcekmece: ["epi-odunlu-somine", "duz-odunlu-somine", "u-tipi-odunlu-somine", "orta-odunlu-somine"],
  esenler: ["elektrikli-somine", "bioethanol-somine", "duz-odunlu-somine", "l-tipi-odunlu-somine"],
};
export const districtProducts = (slug: string) => DISTRICT_PRODUCTS[slug] ?? DEFAULT_PRODUCTS;

/** Bölgeler sayfası SSS (kaynak: Hizmet Bölgeleri sunumu "Başlamadan önce" + İstanbul dışı). */
export const REGION_FAQS = [
  {
    q: "İlk görüşme için hangi bilgileri hazırlamalıyım?",
    a: "Şöminenin düşünüldüğü alanın ve salonun genel fotoğrafları, varsa planı ve yaklaşık ölçüler yararlıdır. Mevcut baca bilgilerini, kullanım beklentinizi ve hedeflediğiniz dönemi de paylaşabilirsiniz.",
  },
  {
    q: "Her ilçede showroomunuz bulunuyor mu?",
    a: "Fabrika showroomumuz Tuzla’dadır. İlçe sayfaları, projenizin bulunduğu bölge için bilgi ve görüşme başlangıcı sunar.",
  },
  {
    q: "Kesin fiyat ve uygulama tarihi nasıl belirlenir?",
    a: "Model, malzeme, saha koşulları ve dahil olan işler netleştikçe teklif ve takvim görüşülür. Ön görüşmede eksik bilgileri ve sonraki adımı birlikte belirleyebiliriz.",
  },
  {
    q: "İstanbul dışındaki projelere hizmet veriyor musunuz?",
    a: "Bilecik hariç Marmara’daki 10 il ile Ankara’dan gelen talepler proje bazında değerlendirilir. Keşif, sevkiyat, montaj ve satış sonrası kapsamı konum ve ekip uygunluğuyla netleşir. Fabrika showroomumuz Tuzla’dadır.",
  },
];

/** Bölgeler sayfası proje yolculuğu (kaynak: Hizmet Bölgeleri sunumu). */
export const REGION_JOURNEY = [
  { title: "Projenizi paylaşın", text: "İlçenizi, mekân fotoğraflarınızı ve şömineden beklentinizi konuşalım." },
  { title: "Birlikte değerlendirelim", text: "Gerekli keşif, ölçü ve teknik değerlendirmelerle seçenekleri netleştirelim." },
  { title: "Tasarımı kesinleştirelim", text: "Modeli, kaplamayı ve teklif kapsamını aynı proje üzerinde ele alalım." },
  { title: "Uygulamayı planlayalım", text: "Üretim ve montajı onaylanan bilgiler ve sahanın durumuyla planlayalım." },
];
