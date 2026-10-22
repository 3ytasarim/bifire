/**
 * Odunlu koleksiyon ürün ailelerinin ürün sayfasına özel metinleri (Bifire odunlu koleksiyon sunumundan):
 * koleksiyon kartı metinleri, yerleşim yaklaşımı (görünüm / yerleşim / tasarım odağı) ve "Üretim detayları" girişi.
 * Ürün slug'ına göre eşleşir; eşleşmeyen üründe bu alanlar gösterilmez.
 */
export type WoodFamily = {
  /** Model adlarında kullanılan kısa ad: "U Tipi Şömine 70'lik". */
  title: string;
  /** Kartlardaki üst etiket ve başlık altı vurgu cümlesi. */
  tag: string;
  line: string;
  /** Koleksiyon kartındaki tanıtım. */
  desc: string;
  view: string;
  place: string;
  focus: string;
  detailIntro: string;
};

export const WOOD_FAMILIES: Record<string, WoodFamily> = {
  "u-tipi-odunlu-somine": {
    title: "U Tipi Şömine",
    tag: "Üç cephede ateş",
    line: "Ateşi farklı açılardan yaşayın.",
    desc: "Ön ve iki yan camın oluşturduğu görünüm, farklı oturma noktaları arasında ateşi ortak bir odak haline getirir. U tipi şömineyi duvar, kaplama ve çevresindeki dolaşım alanıyla birlikte planlıyoruz.",
    view: "Ön ve iki yan cephe",
    place: "Duvar önü veya uygun bir mimari niş",
    focus: "Yan cam oranları ve çevredeki geçişler",
    detailIntro: "Üç cepheli cam düzenini, hazne gövdesi ve kullanım mekanizmasıyla birlikte tasarlıyoruz.",
  },
  "duz-odunlu-somine": {
    title: "Düz Şömine",
    tag: "Tek cephede güçlü odak",
    line: "Duvarınızla bütünleşen sade bir çizgi.",
    desc: "Tek ön camıyla ateşi belirgin bir çerçevede sunan düz şömineler, modern veya klasik kaplama tasarımlarına başlangıç oluşturur. Cam oranını duvarın genişliği ve mobilya yerleşimiyle birlikte ele alıyoruz.",
    view: "Ön cephe",
    place: "Duvar önü veya duvar içine planlanan uygulama",
    focus: "Ön cam oranı ve kaplama derinliği",
    detailIntro: "Tek cepheli görünümün arkasında malzeme seçimini, kapak hareketini ve yanma havasını birlikte ele alıyoruz.",
  },
  "cift-yonlu-odunlu-somine": {
    title: "Çift Yönlü Şömine",
    tag: "Karşılıklı iki görünüm",
    line: "İki yaşam alanı arasında ortak bir odak.",
    desc: "Karşılıklı iki cam yüzey, ateşin iki farklı noktadan izlenmesini sağlar. Salon ve yemek alanı gibi ilişkili mekânlarda her iki cephenin tasarımını birlikte değerlendiriyoruz.",
    view: "Karşılıklı iki cephe",
    place: "İki alan arasında planlanan bölücü",
    focus: "İki cephenin kaplama ve erişim düzeni",
    detailIntro: "Karşılıklı iki cephede görünüm sunan haznede kullanım erişimini ve malzeme düzenini birlikte planlıyoruz.",
  },
  "epi-odunlu-somine": {
    title: "Epi Şömine",
    tag: "Mekâna uzanan ateş çizgisi",
    line: "Yerleşiminizi şekillendiren bir tasarım.",
    desc: "Epi şömineleri yalnız bir cephe ürünü olarak değil, mekânın içine uzanan bir mimari yerleşim olarak ele alıyoruz. Cam yüzeylerin yönü ve haznenin derinliği, oturma düzeniyle birlikte değerlendirilir.",
    view: "Üç cepheli görünüm; geometri modele bağlı",
    place: "Yarımada veya bölücü yaklaşımı",
    focus: "Uzun eksen, cam yönleri ve dolaşım",
    detailIntro: "Mekâna uzanan hazne formunu; iç yüzey, cam birleşimleri ve kullanım erişimiyle bütünleştiriyoruz.",
  },
  "l-tipi-odunlu-somine": {
    title: "L Tipi Şömine",
    tag: "İki komşu cephede ateş",
    line: "Köşeyi, yaşam alanınızın odağına dönüştürün.",
    desc: "Ön ve yan camın buluştuğu L tipi şömineler, ateşi iki komşu açıdan izleme imkânı sunar. Sağ veya sol cam yönünü, mekâna giriş ve oturma noktalarıyla birlikte seçiyoruz.",
    view: "Ön ve bir yan cephe",
    place: "Köşe veya duvar önü",
    focus: "Sağ ve sol yan cam yönü",
    detailIntro: "Ön ve yan camın birleştiği tasarımda gövde, kapak ve sızdırmazlık ayrıntılarını birlikte değerlendiriyoruz.",
  },
  "orta-odunlu-somine": {
    title: "Orta Şömine",
    tag: "Ateş mekânın merkezinde",
    line: "Ateşin çevresinde yeni bir yaşam alanı.",
    desc: "Zemin veya asma yerleşimli orta şömineler, ateşi bir duvarın sınırından çıkarıp mekânın merkezine taşır. Formu seçerken çevredeki dolaşımı, baca hattını ve yapının taşıma koşullarını birlikte ele alıyoruz.",
    view: "Forma ve modele göre çok yönlü",
    place: "Mekânın merkezinde zemin veya asma yerleşim",
    focus: "Taşıyıcılık, baca ve çevre dolaşımı",
    detailIntro: "Merkezî yerleşimde malzeme ve yanma düzenini, seçilen formun taşıma ve bakım koşullarıyla birlikte ele alıyoruz.",
  },
};

/** Teknik tablonun altındaki not (seçeneğe bağlı tablosu olan ürünlerde). */
export const SPEC_NOTE = "Baca bağlantısında birim, hat koşulları ve teknik uygunluk projeye göre doğrulanır. Garanti kapsamı yazılı koşullarla birlikte değerlendirilir.";

/** Üretim detayları kartlarının altındaki not. */
export const DETAIL_NOTE =
  "Asansör, ray ve rulman açıklamaları bu mekanizmayla sunulan modellere ilişkindir. Bileşen sıcaklık değerleri sistemin tamamı için çalışma veya güvenlik sınırı değildir.";

/** Odunlu koleksiyon sayfası (kategori) için giriş metinleri. */
export const WOOD_COLLECTION = {
  categorySlug: "odunlu-somineler",
  eyebrow: "Bifire odunlu şömine koleksiyonu",
  title: "Ateşin farklı yüzleri. Mekânınızın kendi hikâyesi.",
  intro: "Tek cepheden mekânın merkezine uzanan tasarım yaklaşımlarını keşfedin. Görünümü, yerleşimi ve kullanım beklentinizi birlikte değerlendirelim.",
  pickTitle: "Sizin yaşam alanınıza hangi form eşlik etsin?",
  pickText: "Önce ateşi hangi noktalardan görmek istediğinizi düşünün. Ölçü ve uygulama kararlarını projeniz üzerinden birlikte ele alalım.",
  approachTitle: "Görünen güzelliği, detaylarıyla düşünürüz.",
  approach: [
    "Şömineyi bir cam yüzeyinden ibaret görmüyoruz. Hazne, kaplama, baca ve uygulama koşullarını mekânınızın mimarisiyle birlikte ele alıyoruz.",
    "Kendi üretimimiz ve uygulama ekibimizle tasarım kararlarını aynı proje üzerinden değerlendirebiliriz. Doğru ürün seçiminin başlangıcı, beklentinizle yapının koşullarını birlikte tanımaktır.",
  ],
};

/** Model sayfası/kartı adı: "U Tipi Şömine 70'lik", "Düz Şömine 80 × 55", "Orta Şömine Dairesel". */
export const modelName = (family: WoodFamily | null, productName: string, size: string) => `${family?.title ?? productName} ${size}`;
