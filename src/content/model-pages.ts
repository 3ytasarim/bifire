/**
 * Kendi içeriği olan model sayfaları (ör. Orta Şömine koleksiyonundaki 13 model). Model sayfası normalde aile
 * metnini paylaşır ve noindex'tir; burada tanımlı modeller kendi başlığı, görseli, tanıtımı ve SEO alanlarıyla
 * indekslenir ve site haritasına girer. Anahtar: ürün slug'ı → model slug'ı (lib/models: slugify(model kodu)).
 * Teknik değer (ölçü, güç, ağırlık, verim) burada YAZILMAZ — yalnız ürünün doğrulanmış teknik satırlarından gelir.
 * Kaynak: Bifire Orta Şömine 13 Model SEO/Görsel paketi (2026-10-30).
 */
export type ModelPage = {
  h1: string;
  seoTitle: string;
  metaDescription: string;
  keywords: string;
  image: { url: string; alt: string; width: number; height: number };
  /** Hero altındaki tek cümlelik özet. */
  lead: string;
  /** Modele özel tanıtım (paragraflar). */
  intro: string[];
  /** Mekânda yerleşim değerlendirmesi (paragraflar). */
  placement: string[];
};

const IMG = (slug: string, alt: string) => ({ url: `/uploads/2026/10/bifire-${slug}-orta-somine.webp`, alt, width: 1672, height: 941 });
const KW = (model: string) => `Bifire ${model} orta şömine, orta şömine, orta şömine modelleri, odunlu orta şömine, modern şömine tasarımı`;
const TITLE = (model: string) => `Bifire ${model} Orta Şömine | Tasarım ve Mekân Önerileri`;

export const MODEL_PAGES: Record<string, Record<string, ModelPage>> = {
  "orta-odunlu-somine": {
    "bifire-quadra": {
      h1: "Bifire Quadra Orta Şömine",
      seoTitle: TITLE("Quadra"),
      metaDescription: "Bifire Quadra orta şömineyi keşfedin. Modelin mekânınızdaki yerleşimini, kaplama seçeneklerini ve uygulama sürecini Bifire Şömine ile birlikte değerlendirin.",
      keywords: KW("Quadra"),
      image: IMG("quadra", "Açık taş zeminli salonda kare cam hazneli, antrasit Bifire Quadra orta şömine."),
      lead: "Kare cam haznesi ve dikey bacasıyla salonun ortasında net, mimari bir odak.",
      intro: [
        "Bifire Quadra, dört yönü camla çevrili kare bir hazneyi zemine oturan sağlam bir gövdeyle birleştirir. Haznenin altındaki açık bölüm görsel olarak hafiflik sağlarken düz hatlı başlık ve dikey baca, şömineyi tavana kadar uzanan sakin bir çizgiye dönüştürür.",
        "Antrasit yüzey, açık taş ve doğal ahşap tonlarıyla güçlü bir kontrast kurar. Quadra’yı, ateşi salonun farklı köşelerinden izlemek isteyen ve sade geometrileri seven mekânlar için değerlendiriyoruz.",
      ],
      placement: [
        "Dört cepheden görünen bir orta şömine, çevresinde rahat bir dolaşım alanı ister. Oturma grubunu haznenin bir yüzüne, geçişleri ise diğer yüzlere göre planlamak, hem ateşin görünümünü hem de günlük kullanımı kolaylaştırır.",
        "Baca güzergâhı, tavan yapısı ve zemin taşıma koşulları yerleşimden önce birlikte incelenir. Mekânınızın planını ve fotoğraflarını paylaştığınızda Quadra için uygun konumu ekibimizle birlikte belirleyebiliriz.",
      ],
    },
    "bifire-strata": {
      h1: "Bifire Strata Orta Şömine",
      seoTitle: TITLE("Strata"),
      metaDescription: "Bifire Strata orta şömine ile yaşam alanınıza uygun tasarımı planlayın. Yerleşim, malzeme seçimi ve montaj ayrıntıları için Bifire Şömine ile iletişime geçin.",
      keywords: KW("Strata"),
      image: IMG("strata", "Doğal meşe ve açık taş detaylı salonda tavandan asılı Bifire Strata orta şömine."),
      lead: "Tavandan inen kademeli başlığıyla zemini serbest bırakan asma bir orta şömine.",
      intro: [
        "Bifire Strata, cam hazneyi tavandan asılı, aşağı doğru genişleyen kademeli bir başlıkla taşır. Zemine dokunmayan bu form, şömineyi salonun ortasında havada duran bir heykele dönüştürür ve altındaki taş platformu ön plana çıkarır.",
        "Çok yüzlü başlık, gün boyunca değişen ışıkta farklı gölgeler oluşturur. Strata’yı yüksek tavanlı, geniş açıklıklı ve doğal malzemelerin öne çıktığı yaşam alanlarında değerlendiriyoruz.",
      ],
      placement: [
        "Asma modellerde taşıyıcı bağlantı, tavanın yapısına ve yük taşıma kapasitesine göre ayrıca değerlendirilir. Bu nedenle Strata için yerleşim kararı, statik ve baca incelemesiyle birlikte netleşir.",
        "Şöminenin altındaki platform, hem görsel bir zemin hem de güvenli bir çevre alanı oluşturur. Platformun ölçüsünü ve malzemesini, oturma düzeninize ve salonun zemin kaplamasına göre birlikte belirleyebiliriz.",
      ],
    },
    "bifire-octa": {
      h1: "Bifire Octa Orta Şömine",
      seoTitle: TITLE("Octa"),
      metaDescription: "Bifire Octa orta şömine modelini inceleyin. Salonunuzun planına uygun konumlandırma, kaplama ve uygulama seçeneklerini ekibimizle birlikte değerlendirin.",
      keywords: KW("Octa"),
      image: IMG("octa", "Bahçeye açılan salonda sekizgen cam hazneli ve ayaklı Bifire Octa orta şömine."),
      lead: "Sekizgen cam haznesi ve incelen gövdesiyle ateşi her açıdan yumuşak geçişlerle gösterir.",
      intro: [
        "Bifire Octa’nın sekizgen haznesi, ateşi tek bir ön yüz yerine birbirine açılı cam yüzeylerden izlemeyi sağlar. Hazne, aşağıda incelerek zemine oturan bir ayak ve yukarıda daralan bir başlıkla dengelenir.",
        "Dikey ve ince oranları sayesinde Octa, geniş pencereli ve bahçeye açılan salonlarda manzarayı kapatmadan bir odak noktası oluşturur.",
      ],
      placement: [
        "Açılı cam yüzeyler, şöminenin çevresindeki farklı oturma noktalarına benzer bir görüş sunar. Bu nedenle Octa, salonun ortasına ya da oturma ve yemek alanları arasındaki geçiş bölgesine yerleştirilebilir.",
        "Baca hattının tavandan geçeceği nokta, tavan kirişleri ve üst kattaki kullanım birlikte değerlendirilir. Ön görüşmede mekânınızın planını paylaşmanız, uygun konum seçeneklerini hızla daraltmamıza yardımcı olur.",
      ],
    },
    "bifire-aura": {
      h1: "Bifire Aura Orta Şömine",
      seoTitle: TITLE("Aura"),
      metaDescription: "Bifire Aura orta şömineyi yakından tanıyın. Mekânınıza uygun ölçü, yerleşim ve tasarım kararlarını Tuzla fabrika showroomumuzda birlikte netleştirelim.",
      keywords: KW("Aura"),
      image: IMG("aura", "Salon ve yemek alanı arasında yuvarlak camlı, silindirik ayaklı Bifire Aura orta şömine."),
      lead: "Yuvarlak camı ve silindirik gövdesiyle iki yaşam alanı arasında yumuşak bir geçiş.",
      intro: [
        "Bifire Aura, silindirik bir gövde üzerinde yükselen yuvarlak cam hazneden oluşur. Kavisli cam, ateşi keskin köşeler olmadan çevreler; üstteki kubbemsi başlık ve ince baca formu bütünler.",
        "Yumuşak hatları sayesinde Aura, salon ile yemek alanını birbirinden ayırmadan aynı ateş etrafında buluşturan açık planlı yaşam alanlarına uyum sağlar.",
      ],
      placement: [
        "İki alan arasında konumlanan bir orta şömine, her iki taraftan da rahat izlenebilmeli ve geçişleri daraltmamalıdır. Aura için mobilya mesafeleri ve dolaşım yolları yerleşim önerisinde birlikte ele alınır.",
        "Zeminin taşıma kapasitesi, baca güzergâhı ve yanma havası koşulları keşif aşamasında netleştirilir. Modeli ve malzeme alternatiflerini Tuzla fabrika showroomumuzda yakından değerlendirebilirsiniz.",
      ],
    },
    "bifire-orbita": {
      h1: "Bifire Orbita Orta Şömine",
      seoTitle: TITLE("Orbita"),
      metaDescription: "Bifire Orbita orta şömine ile mekânınızın odak noktasını planlayın. Modelin yerleşimi, çevre düzeni ve uygulama seçenekleri hakkında ekibimizden bilgi alın.",
      keywords: KW("Orbita"),
      image: IMG("orbita", "Açık taş platform üzerinde tavandan asılı, yatay disk formlu Bifire Orbita orta şömine."),
      lead: "Yatay disk formuyla taş platformun üzerinde süzülen, alçak ve geniş bir ateş.",
      intro: [
        "Bifire Orbita, tavandan inen ince bir baca hattının ucunda yatay bir disk gibi açılır. Ateş, zemine yakın ve geniş bir açıklıkta görünür; bu da şömineyi oturma grubunun seviyesine yaklaştırır.",
        "Altındaki yuvarlak taş platform, diskin formunu zeminde tekrarlar ve kompozisyonu tamamlar. Orbita’yı, manzaralı ve sade düzenlenmiş salonlarda dikkat çekici bir merkez olarak öneriyoruz.",
      ],
      placement: [
        "Asma bir modelde tavan bağlantısı ve baca güzergâhı, yerleşimin ilk belirleyicisidir. Orbita için tavan yapısı, taşıyıcı detaylar ve platform ölçüsü birlikte değerlendirilir.",
        "Platformun çevresinde bırakılacak boşluk, hem güvenli kullanım hem de görsel denge için önemlidir. Oturma düzeninizi paylaştığınızda platform ve mobilya mesafelerini sizinle birlikte planlayabiliriz.",
      ],
    },
    "bifire-sfera": {
      h1: "Bifire Sfera Orta Şömine",
      seoTitle: TITLE("Sfera"),
      metaDescription: "Bifire Sfera orta şömine modelini keşfedin. Yaşam alanınızın mimarisiyle uyumlu yerleşim ve tasarım seçeneklerini Bifire Şömine ekibiyle değerlendirin.",
      keywords: KW("Sfera"),
      image: IMG("sfera", "Açık taş ve doğal meşe tonlu okuma salonunda küresel gövdeli Bifire Sfera asma şömine."),
      lead: "Küresel gövdesiyle küçük ölçekli salonlara ve okuma köşelerine karakter katan asma şömine.",
      intro: [
        "Bifire Sfera, tavandan inen ince bir baca üzerinde asılı küresel bir gövdeden oluşur. Ateş, kürenin ön yüzündeki açıklıktan görünür; yalın form, şömineyi mekânda bir obje gibi öne çıkarır.",
        "Kompakt görünümü sayesinde Sfera, okuma köşeleri, kütüphane alanları ve daha sakin yaşam bölümleri için değerlendirilebilir.",
      ],
      placement: [
        "Küresel gövde, belirli bir yöne açıldığından oturma noktasının konumu yerleşim kararında önceliklidir. Sfera’yı, en çok kullanılan koltuk veya okuma alanına bakacak şekilde konumlandırmayı öneriyoruz.",
        "Asma bağlantı ve baca hattı tavan yapısına göre ayrıca incelenir. Altındaki zemin platformu, hem kullanım güvenliği hem de görsel çerçeve için birlikte tasarlanır.",
      ],
    },
    "bifire-linea": {
      h1: "Bifire Linea Orta Şömine",
      seoTitle: TITLE("Linea"),
      metaDescription: "Bifire Linea orta şömine için mekânınıza uygun tasarımı birlikte oluşturalım. Yerleşim, kaplama tercihleri ve montaj planlaması hakkında bilgi edinin.",
      keywords: KW("Linea"),
      image: IMG("linea", "Salon ve yemek alanı arasında dikdörtgen asma başlıklı, cam yüzeyli Bifire Linea orta şömine."),
      lead: "Dikdörtgen asma başlığı ve cam yüzeyleriyle iki alanı ayırmadan bağlayan şeffaf bir hacim.",
      intro: [
        "Bifire Linea, zemindeki dikdörtgen ateş alanını tavandan inen dikdörtgen bir başlık ve cam yüzeylerle çerçeveler. Şeffaf gövde, salon ile yemek alanı arasında görüş hattını kapatmadan ateşi ortada konumlandırır.",
        "Düz çizgileri ve dengeli oranlarıyla Linea, modern mimarinin sade hatlarını tercih eden açık planlı yaşam alanlarına uyum sağlar.",
      ],
      placement: [
        "Linea’nın şeffaf yapısı, iki alanın birbirini görmesine izin verir; bu nedenle şöminenin her iki yüzündeki mobilya düzeni birlikte planlanır.",
        "Asma başlığın tavan bağlantısı, baca hattı ve zemindeki ateş alanının kaplaması uygulama öncesinde netleşir. Kaplama tercihlerinizi zeminle uyumlu olacak şekilde birlikte belirleyebiliriz.",
      ],
    },
    "bifire-rotonda": {
      h1: "Bifire Rotonda Orta Şömine",
      seoTitle: TITLE("Rotonda"),
      metaDescription: "Bifire Rotonda orta şömineyi inceleyin. Salon yerleşiminiz, kullanım beklentileriniz ve mimari tercihleriniz doğrultusunda projenizi birlikte planlayalım.",
      keywords: KW("Rotonda"),
      image: IMG("rotonda", "Açık taş zeminli salonda yuvarlak cam hazneli, kubbe başlıklı Bifire Rotonda orta şömine."),
      lead: "Yuvarlak cam haznesi ve kubbe başlığıyla geniş salonlarda sıcak, kapsayıcı bir merkez.",
      intro: [
        "Bifire Rotonda, kubbe biçimli bir başlığın altında yuvarlak cam bir hazne ve onu taşıyan tek bir ayaktan oluşur. Hazne, zeminden yükseltilmiş konumuyla ateşi oturma seviyesine yakın tutar.",
        "Yuvarlak formu, salonun ortasında her yönden benzer bir görünüm sunar. Rotonda’yı, geniş oturma grupları ve çevresinde toplanılan yaşam alanları için öneriyoruz.",
      ],
      placement: [
        "Her yöne açılan bir hazne, şöminenin çevresinde dengeli bir mobilya düzeni gerektirir. Rotonda için koltuk mesafeleri ve geçiş yolları, ateşin görünümünü kısıtlamayacak şekilde planlanır.",
        "Baca güzergâhı ve zemin koşulları keşif sırasında değerlendirilir. Salonunuzun fotoğrafları ve yaklaşık ölçüleriyle ilk yerleşim önerisini birlikte hazırlayabiliriz.",
      ],
    },
    "bifire-vertice": {
      h1: "Bifire Vertice Orta Şömine",
      seoTitle: TITLE("Vertice"),
      metaDescription: "Bifire Vertice orta şömine ile tasarım seçeneklerinizi değerlendirin. Mekânınıza uygun konumlandırma ve uygulama ayrıntıları için Bifire Şömine’ye ulaşın.",
      keywords: KW("Vertice"),
      image: IMG("vertice", "Geniş pencereli salonda yukarı daralan geometrik cam hazneli Bifire Vertice orta şömine."),
      lead: "Yukarı doğru daralan geometrik formuyla yüksek tavanları vurgulayan dikey bir siluet.",
      intro: [
        "Bifire Vertice, kare bir kaide üzerinde yükselen ve yukarı doğru sivrilen geometrik bir gövdeye sahiptir. Açılı cam yüzeyler ateşi farklı yönlerden gösterirken metal çerçeve formun keskin çizgilerini belirginleştirir.",
        "Dikey oranları sayesinde Vertice, geniş pencereli ve yüksek tavanlı salonlarda mimari bir vurgu oluşturur.",
      ],
      placement: [
        "Yukarı doğru daralan bir form, yanından ve karşısından bakıldığında farklı siluetler oluşturur. Vertice’i, salonun ana bakış noktalarından görünecek şekilde konumlandırmayı öneriyoruz.",
        "Kaidenin oturacağı zemin, baca hattı ve yanma havası koşulları uygulama öncesinde incelenir. Mekânınızın planını paylaşmanız, konum seçeneklerini birlikte değerlendirmemizi kolaylaştırır.",
      ],
    },
    "bifire-alto": {
      h1: "Bifire Alto Orta Şömine",
      seoTitle: TITLE("Alto"),
      metaDescription: "Bifire Alto orta şömine modelini yakından keşfedin. Mekânınızın ölçülerine ve mimarisine uygun yerleşim ile uygulama sürecini ekibimizle birlikte planlayın.",
      keywords: KW("Alto"),
      image: IMG("alto", "Meşe dolaplı yaşam alanında kare cam hazneli ve ayaklı Bifire Alto orta şömine."),
      lead: "Yükseltilmiş kare haznesi ve uzun bacasıyla ateşi göz hizasına taşıyan dikey bir model.",
      intro: [
        "Bifire Alto, kare bir kaide üzerinde yükseltilmiş cam bir hazne ve onu tamamlayan uzun, dikdörtgen bir baca gövdesinden oluşur. Yükseltilmiş hazne, ateşi ayakta ya da otururken rahatça görülebilen bir seviyeye taşır.",
        "Sade ve dikey kurgusuyla Alto, ahşap dolaplar ve doğal malzemelerle düzenlenmiş yaşam alanlarında dengeli bir odak oluşturur.",
      ],
      placement: [
        "Alto’nun dikey gövdesi, tavan yüksekliği ve baca güzergâhıyla birlikte değerlendirilir. Hazne yüksekliği, oturma grubunun konumuna göre ateşin en iyi göründüğü noktayı belirlemede dikkate alınır.",
        "Zemin taşıma koşulları ve çevresinde bırakılacak kullanım alanı keşif aşamasında netleşir. Mekân fotoğraflarınızla uygun konumu ve oranları birlikte belirleyebiliriz.",
      ],
    },
    "bifire-plano": {
      h1: "Bifire Plano Orta Şömine",
      seoTitle: TITLE("Plano"),
      metaDescription: "Bifire Plano orta şömine için yaşam alanınıza uygun çözümü değerlendirin. Tasarım, yerleşim ve montaj planlaması hakkında Bifire Şömine’den bilgi alın.",
      keywords: KW("Plano"),
      image: IMG("plano", "Salon ve yemek alanı arasında geniş tabanlı, dört cepheli Bifire Plano orta şömine."),
      lead: "Geniş tabanı ve dört cepheli haznesiyle salon ile yemek alanını aynı ateşte buluşturur.",
      intro: [
        "Bifire Plano, geniş ve alçak bir taban üzerinde dört cepheden görünen bir hazne ile bunu taçlandıran piramidal bir başlıktan oluşur. Geniş taban, şömineye sağlam ve dengeli bir duruş kazandırır.",
        "Dört cepheli yapısı sayesinde Plano, salon ve yemek alanının birlikte kullanıldığı açık planlı yaşam alanlarında her iki taraf için de ortak bir odak sunar.",
      ],
      placement: [
        "Dört yönden görünen bir haznede, çevredeki tüm oturma noktaları ve geçişler birlikte düşünülür. Plano için salon ve yemek alanı mobilyalarının mesafeleri yerleşim önerisinde ayrıca ele alınır.",
        "Geniş taban, zeminin taşıma kapasitesi ve zemin kaplamasıyla birlikte değerlendirilir. Baca güzergâhı ve uygulama ayrıntıları keşif sonrasında netleşir.",
      ],
    },
    "bifire-hexa": {
      h1: "Bifire Hexa Orta Şömine",
      seoTitle: TITLE("Hexa"),
      metaDescription: "Bifire Hexa orta şömineyi keşfedin. Modelin salonunuzdaki konumunu ve tasarım uyumunu inceleyin; projenizin uygulama ayrıntılarını ekibimizle netleştirin.",
      keywords: KW("Hexa"),
      image: IMG("hexa", "Açık taş ve doğal ahşap tonlu salonda çokgen gövdeli Bifire Hexa orta şömine."),
      lead: "Çokgen gövdesi ve konik başlığıyla sade salonlarda zamansız bir siluet.",
      intro: [
        "Bifire Hexa, çokgen bir kaide üzerinde yükselen cam bir hazneyi yukarı doğru daralan konik bir başlıkla birleştirir. Yüzeyler arasındaki açılar, gün ışığında gövdeye derinlik kazandırır.",
        "Dengeli oranları ve sakin formu sayesinde Hexa, açık taş ve doğal ahşap tonlarının hâkim olduğu salonlarda zamansız bir tamamlayıcı olur.",
      ],
      placement: [
        "Çokgen hazne, ateşi birden fazla açıdan görünür kılar. Hexa’yı salonun ortasında ya da pencere önüne yakın bir konumda, oturma grubunu haznenin geniş görünen yüzlerine göre düzenleyerek değerlendirebilirsiniz.",
        "Baca hattının tavandan geçişi ve zemin koşulları uygulama öncesinde incelenir. Kaplama ve zemin tercihlerinizi şöminenin rengiyle uyumlu olacak şekilde birlikte planlayabiliriz.",
      ],
    },
    "bifire-levita": {
      h1: "Bifire Levita Orta Şömine",
      seoTitle: TITLE("Levita"),
      metaDescription: "Bifire Levita orta şömine modelini inceleyin. Mekânınızın mimarisine uygun yerleşim, tasarım ve uygulama seçeneklerini Bifire Şömine ile değerlendirin.",
      keywords: KW("Levita"),
      image: IMG("levita", "Yüksek tavanlı salonda dikdörtgen cam hazneli Bifire Levita asma orta şömine."),
      lead: "Dikdörtgen haznesi ve yüksek bacasıyla çift katlı salonlarda dikkat çeken asma bir orta şömine.",
      intro: [
        "Bifire Levita, dikdörtgen cam bir hazneyi yukarı doğru daralan bir başlık ve tavana uzanan dikdörtgen bir baca gövdesiyle birleştirir. Haznenin zeminle kurduğu hafif ilişki, şömineye asılı gibi duran bir görünüm kazandırır.",
        "Yüksek ve dikey kurgusuyla Levita, çift katlı ya da galeri boşluklu salonlarda hacmin yüksekliğini vurgulayan bir merkez oluşturur.",
      ],
      placement: [
        "Yüksek bir baca gövdesi, tavan ve üst kat bağlantılarıyla birlikte değerlendirilir. Levita için taşıyıcı detaylar ve baca güzergâhı, yerleşim kararının ilk adımıdır.",
        "Geniş dikdörtgen hazne, oturma grubunun uzun kenara bakacak şekilde düzenlenmesiyle en iyi görünümü sunar. Mekânınızın planı ve fotoğraflarıyla yerleşimi birlikte netleştirebiliriz.",
      ],
    },
  },
};

export const modelPageOf = (productSlug: string, modelSlug: string): ModelPage | null => MODEL_PAGES[productSlug]?.[modelSlug] ?? null;
