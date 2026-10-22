/**
 * "Mekânınıza özel tasarım" hizmeti (Bifire mekân tasarım sunumundan). Müşteri mekân fotoğrafını ve
 * tercihlerini paylaşır; görsel yerleşim önerisini Bifire ekibi hazırlar. Fotoğraf yüklemek otomatik
 * tasarım üretmez; süre/ücret taahhüdü verilmez.
 */
export const DESIGN_PREFERENCES = ["Birlikte seçelim", "L tipi", "Düz", "U tipi", "Elektrikli", "Diğer"] as const;
export const DESIGN_FLUE = ["Henüz bilmiyorum", "Mevcut baca var", "Mevcut baca yok", "Yeni yapı, planlanabilir"] as const;

/** Fotoğraf: seçimde en fazla 12 MB; tarayıcıda küçültülüp gönderilir, sunucu en fazla 8 MB kabul eder. */
export const DESIGN_PHOTO_MAX_MB = 12;
export const DESIGN_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const DESIGN_STEPS = [
  { title: "Mekânı tanıyalım", text: "Duvarın net göründüğü fotoğrafı, yaklaşık ölçüleri ve aklınızdaki şömineyi paylaşın." },
  { title: "Fikri geliştirelim", text: "İhtiyacınızı ve tasarım yönünü değerlendirelim. Uygun kapsamı belirleyip görsel öneriyi hazırlayalım." },
  { title: "Birlikte netleştirelim", text: "Öneriyi görüşmede ele alalım. Ürün, kaplama ve teknik değerlendirme için sonraki adımı belirleyelim." },
];

export const DESIGN_FAQS = [
  {
    q: "Nasıl bir fotoğraf paylaşmalıyım?",
    a: "Şöminenin düşünüldüğü duvarı ve yakın çevresini gösteren, aydınlık ve mümkün olduğunca karşıdan çekilmiş bir fotoğraf yeterli. Varsa farklı açıları ve yaklaşık ölçüleri daha sonra görüşmede değerlendirebiliriz.",
  },
  {
    q: "Fotoğrafı yüklediğimde tasarım hemen oluşur mu?",
    a: "Hayır. Öneriyi Bifire ekibi, paylaştığınız bilgiler doğrultusunda hazırlar. Fotoğraf yüklemek otomatik tasarım oluşturmaz; talebiniz bize ulaştıktan sonra sizinle iletişime geçeriz.",
  },
  {
    q: "Henüz bir şömine modeli seçmedim. Başlayabilir miyim?",
    a: "Evet. “Birlikte seçelim” seçeneğini kullanabilirsiniz. Tasarım yönünü görüşmede birlikte değerlendirebiliriz.",
  },
  {
    q: "Görsel öneri uygulama için yeterli midir?",
    a: "Görsel öneri tasarımı anlatır. Kesin ölçü, baca uygunluğu, güvenli mesafeler ve montaj ayrıntıları ürün bilgileri ve yerinde teknik değerlendirmeyle netleşir.",
  },
  {
    q: "Çalışmanın süresi ve kapsamı nedir?",
    a: "Hazırlama süresi, ücret durumu ve alternatif veya revizyon kapsamı projeniz değerlendirilirken ayrıca netleştirilir.",
  },
  {
    q: "Fotoğrafım nerede saklanıyor?",
    a: "Fotoğrafınız herkese açık bir alanda yayınlanmaz; yalnızca talebinizi değerlendiren Bifire ekibi erişebilir. Konum gibi dosya içi bilgiler kayıt sırasında temizlenir.",
  },
];
