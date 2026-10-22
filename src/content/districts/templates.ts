/** Birden fazla ilçede aynen kullanılan bölümler; `{d}` ilçe adıyla değiştirilir. */
export const SECTION_TEMPLATES: Record<string, { title: string; paras: string[] }> = {
  teklif: {
    title: "{d} projesinde teklif kapsamını netleştirelim",
    paras: [
      "Hazne, kaplama, ısı odası ve yalıtımın yanında baca bağlantısı, taşıma ve montajın hangi işleri kapsadığını birlikte konuşalım. Söküm, boya veya diğer bitiş işleri gerekiyorsa sorumlulukları ayrıca ayıralım. Bedel ve süre, seçilen model ve sahadaki koşullar netleştikçe belirlenir.",
      "İlk görüşmede bütçe aralığınızı ve uygulama dönemini paylaşabilirsiniz. Üretime geçmeden önce onaylanacak ölçü, malzeme ve çizimleri belirleyelim. Sonradan istenen değişikliklerin kapsam ve takvim etkisi ayrıca değerlendirilir.",
    ],
  },
  yerlesim: {
    title: "Yerleşimi teknik koşullarla birlikte değerlendirelim",
    paras: [
      "Bir yerleşimin beğenilmesi, seçilen modelin o alanda uygulanabileceğini tek başına göstermez. Baca ve hava ihtiyacı, çevre yüzeyler, ısı odası ve servis erişimi birlikte değerlendirilmelidir. Ölçü ve uygulama ayrıntıları netleşmeden yalnız bir fotoğrafa dayanarak üretim kararı vermeyelim.",
      "İlk görüşmede kullanım önceliklerinizi ve korunacak eşyaları konuşabiliriz. Tasarım seçeneklerini daralttıktan sonra gerekli saha incelemesini ve üretime esas onayları belirleyelim. Böylece görünüş tercihinizin montaj açısından hangi işleri gerektirdiği anlaşılır.",
    ],
  },
  secim: {
    title: "Seçimi teknik inceleme ve iş kapsamıyla tamamlayalım",
    paras: [
      "Kullanım amacınızı, yaklaşık bütçe aralığınızı ve hedeflediğiniz dönemi paylaşmanız seçenekleri daraltmaya yardımcı olur. Seçilen ürünün baca ve hava ihtiyacı, çevre yüzeyler, ısı odası ve servis erişimi ayrıca değerlendirilmelidir. Görsel tercih, teknik uygunluk sonucunun yerine geçmez.",
      "Bifire Şömine olarak kendi üretimimiz ve kendi montaj ekibimizle, seçeneklerin projeniz açısından ne anlama geldiğini görüşebiliriz. Kesin karar için eksik ölçüleri ve bekleyen incelemeleri belirleyelim. Farklı alternatifleri aynı uygulama kapsamıyla karşılaştırmak satın alma kararını kolaylaştırır.",
    ],
  },
  tasima: {
    title: "Taşımayı ürün ve saha bilgisiyle netleştirelim",
    paras: [
      "Taşıma planı, seçilen hazne ve kaplama parçalarının ölçüleriyle birlikte değerlendirilmelidir. Giriş ve geçiş bilgileri ön görüşmeyi destekler; güzergâhın uygunluğu gerekli incelemeyle netleşir. Özel bir taşıma düzeni gerekiyorsa sorumluluk ve bedeli teklifte açıkça konuşalım.",
      "Ulaşımın planlanması, şöminenin teknik uygunluk incelemesinin yerine geçmez. Baca ve hava ihtiyacı, ısı odası ve çevre yüzeyler ayrıca değerlendirilir. Projenizin açık konumunu ve güncel fotoğraflarını paylaşarak hangi bilgilerin tamamlanması gerektiğini belirleyebilirsiniz.",
    ],
  },
  kaplama: {
    title: "Kaplamayı teknik detaylardan ayrı seçmeyelim",
    paras: [
      "Dış kaplamanın görünüşü ile ısı odasında kullanılan malzemelerin görevi aynı değildir. Malzeme seçimi, seçilen sistemin gereklilikleri ve ilgili ürünün kullanım sınırlarıyla birlikte değerlendirilmelidir. Yalnız dekoratif dokuya bakılarak yalıtım veya çevre yüzeyler hakkında karar verilmemelidir.",
      "Tasarım görüşmesinde kaplama birleşimlerini, kapak hareketini ve servis erişimini aynı çizim üzerinde ele alabiliriz. Seçilen malzemenin projede hangi yüzeylere uygulanacağını açıkça tarif etmek, üretim ve diğer uygulama ekiplerinin aynı karar üzerinden ilerlemesini sağlar.",
    ],
  },
  mevcut: {
    title: "Yeni tasarımı mevcut sistemle birlikte inceleyelim",
    paras: [
      "Yenileme sırasında dış kaplama, hazne, baca bağlantısı ve ısı odası birbirinden bağımsız kabul edilmemelidir. Korunacak parçaların seçilen tasarımla ilişkisi teknik değerlendirmede ele alınır. Görünmeyen bölümler hakkında inceleme yapılmadan kesin uygunluk sonucu çıkarılmamalıdır.",
      "Bifire ekibiyle hangi işlerin yeni uygulamaya dahil olacağını ve hangilerinin ayrıca değerlendirileceğini konuşabilirsiniz. Mevcut evde korunacak yüzeyleri ve kullanım düzenini paylaşmanız iş planına yardımcı olur. Üretim ve montaj, netleşen kapsam üzerinden planlanır.",
    ],
  },
  alan: {
    title: "Uygulamayı mevcut alanla birlikte değerlendirelim",
    paras: [
      "Şömineye ayrılan yerde zemin, duvar ve tavanın mevcut durumu seçilen sistemle birlikte incelenmelidir. Baca ve hava ihtiyacı, ısı odası ve erişim gereklilikleri bu değerlendirmenin parçasıdır. Yalnız ürünün dış ölçüsünün sığması, uygulama için bütün koşulların tamamlandığı anlamına gelmez.",
      "Mevcut yüzeylerde yapılacak değişiklikleri, korunacak eşyaları ve gerekli hazırlıkları birlikte konuşalım. Bifire ekibiyle montajın sınırlarını netleştirirken başka ekiplerin tamamlayacağı işleri de ayırabiliriz. Kesin program, model ve saha bilgileri netleştiğinde görüşülür.",
    ],
  },
  uretim: {
    title: "Üretim ile saha hazırlığını birlikte planlayalım",
    paras: [
      "Bifire Şömine olarak üretimi ve kendi ekibimizle yürüttüğümüz montajı projenin netleşen bilgileri üzerinden ele alıyoruz. Seçilen sistemin baca ve hava ihtiyacı, ısı odası, çevre yüzeyler ve erişim gereklilikleri teknik değerlendirmeye dahil edilmelidir.",
      "Montaj programını görüşürken diğer ekiplerin tamamlayacağı işleri de belirleyelim. Hazne, kaplama ve uygulama ölçüleri onaylanmadan verilen yaklaşık bilgiler, kesin üretim ölçüsü olarak kullanılmamalıdır. Değişen saha koşullarını üretim kararına zamanında aktarmak önemlidir.",
    ],
  },
};

export const FAQ_TEMPLATES: Record<string, { q: string; a: string }> = {
  faqBilgi: {
    q: "{d} için görüşmeye hangi bilgilerle başlayabilirim",
    a: "Mekânın genel fotoğrafları, varsa planı, yaklaşık ölçüler ve mevcut baca bilgisiyle başlayabilirsiniz. Beğendiğiniz örnekleri ve uygulama dönemini de paylaşın. Kesin uygunluk ve üretim ölçüleri ayrıca netleşir.",
  },
  faqShowroom: {
    q: "{d} sınırlarında showroomunuz var mı",
    a: "Fabrika showroomumuz Tuzla’dadır. Ziyaret öncesinde proje bilgilerinizi paylaşarak görüşmenizi planlayabilirsiniz. Özellikle görmek istediğiniz model veya malzemeyi ekibimizle önceden teyit edin.",
  },
};

export const CLOSING_TEMPLATE =
  "Fotoğraflarda beğendiğiniz şömineyi, kendi mekânınızın ölçüleri ve malzeme tercihleriyle birlikte ele alalım. Proje bilgilerinizi Bifire Şömine ekibiyle paylaşın; Tuzla fabrika showroomunda sergilenen örnekleri inceleyerek tasarım, teklif ve uygulama için sonraki adımı birlikte netleştirelim.";
