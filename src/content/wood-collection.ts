/**
 * Odunlu koleksiyon ürün ailelerinin ürün sayfasına özel metinleri (Bifire odunlu koleksiyon sunumundan):
 * yerleşim yaklaşımı (görünüm / yerleşim / tasarım odağı) ve "Üretim detayları" bölümünün aileye özgü girişi.
 * Ürün slug'ına göre eşleşir; eşleşmeyen üründe bu alanlar gösterilmez.
 */
export type WoodFamily = { view: string; place: string; focus: string; detailIntro: string };

export const WOOD_FAMILIES: Record<string, WoodFamily> = {
  "u-tipi-odunlu-somine": {
    view: "Ön ve iki yan cephe",
    place: "Duvar önü veya uygun bir mimari niş",
    focus: "Yan cam oranları ve çevredeki geçişler",
    detailIntro: "Üç cepheli cam düzenini, hazne gövdesi ve kullanım mekanizmasıyla birlikte tasarlıyoruz.",
  },
  "duz-odunlu-somine": {
    view: "Ön cephe",
    place: "Duvar önü veya duvar içine planlanan uygulama",
    focus: "Ön cam oranı ve kaplama derinliği",
    detailIntro: "Tek cepheli görünümün arkasında malzeme seçimini, kapak hareketini ve yanma havasını birlikte ele alıyoruz.",
  },
  "cift-yonlu-odunlu-somine": {
    view: "Karşılıklı iki cephe",
    place: "İki alan arasında planlanan bölücü",
    focus: "İki cephenin kaplama ve erişim düzeni",
    detailIntro: "Karşılıklı iki cephede görünüm sunan haznede kullanım erişimini ve malzeme düzenini birlikte planlıyoruz.",
  },
  "epi-odunlu-somine": {
    view: "Üç cepheli görünüm; geometri modele bağlı",
    place: "Yarımada veya bölücü yaklaşımı",
    focus: "Uzun eksen, cam yönleri ve dolaşım",
    detailIntro: "Mekâna uzanan hazne formunu; iç yüzey, cam birleşimleri ve kullanım erişimiyle bütünleştiriyoruz.",
  },
  "l-tipi-odunlu-somine": {
    view: "Ön ve bir yan cephe",
    place: "Köşe veya duvar önü",
    focus: "Sağ ve sol yan cam yönü",
    detailIntro: "Ön ve yan camın birleştiği tasarımda gövde, kapak ve sızdırmazlık ayrıntılarını birlikte değerlendiriyoruz.",
  },
  "orta-odunlu-somine": {
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
