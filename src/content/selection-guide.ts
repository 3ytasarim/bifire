/**
 * "Birlikte tasarlayalım" seçim rehberi (Bifire şömine seçim rehberi sunumundan). Birkaç soruyla ürün grubunu
 * daraltır; sonuç bir başlangıç yönüdür — teknik onay, kapasite hesabı veya kesin model önerisi değildir.
 */
export type GuideKey = "place" | "fuel" | "flue" | "priority" | "views";
export type GuideAnswers = Partial<Record<GuideKey, string>>;
type GuideOption = { value: string; title: string; help: string };
type GuideQuestion = { title: string; help: string; label: string; options: GuideOption[] };

const o = (value: string, title: string, help: string): GuideOption => ({ value, title, help });

export const GUIDE_QUESTIONS: Record<GuideKey, GuideQuestion> = {
  place: {
    title: "Şöminenizi nerede hayal ediyorsunuz?",
    help: "Kullanım yerini bilmek, seçenekleri doğru koşullarla değerlendirmemize yardımcı olur.",
    label: "Mekân",
    options: [
      o("home", "Ev içinde", "Salon, oturma alanı veya evinizde başka bir bölüm."),
      o("outdoor", "Bahçe veya teras", "Açık ya da yarı açık bir kullanım alanı."),
      o("commercial", "Ticari bir mekân", "İşletme veya birden fazla kullanıcısı olan proje."),
      o("unknown", "Henüz karar vermedim", "Yerleşimi de birlikte değerlendirelim."),
    ],
  },
  fuel: {
    title: "Nasıl bir ateş deneyimi arıyorsunuz?",
    help: "Ürün grupları farklı kurulum ve kullanım şartları taşır.",
    label: "Ürün grubu",
    options: [
      o("wood", "Odunlu şömine", "Odun ateşi; baca ve kullanım hazırlığı birlikte değerlendirilir."),
      o("electric", "Elektrikli şömine", "Alev efekti; elektrik ve ürünün kurulum şartları esas alınır."),
      o("bio", "Bioethanol şömine", "Yakıt, havalandırma ve kullanım koşulları ürüne göre incelenir."),
      o("unknown", "Seçenekleri birlikte görelim", "Görünüm ve kullanım beklentimle karşılaştıralım."),
    ],
  },
  flue: {
    title: "Baca durumunuz hakkında ne biliyorsunuz?",
    help: "Bacanın bulunması tek başına teknik uygunluk anlamına gelmez.",
    label: "Baca bilgisi",
    options: [
      o("existing", "Mevcut bir baca var", "Durumu ve seçilen ürünle uyumu kontrol edilmeli."),
      o("planned", "Yeni yapıda planlanıyor", "Güzergâh ve bağlantılar projeyle birlikte ele alınmalı."),
      o("none", "Baca bulunmuyor", "Uygulanabilirlik için teknik değerlendirme gerekli."),
      o("unknown", "Henüz bilmiyorum", "Fotoğraf ve planla hangi bilgiye ihtiyaç olduğunu belirleyelim."),
    ],
  },
  priority: {
    title: "Sizin için hangi beklenti öne çıkıyor?",
    help: "Isıtma beklentisi varsa mekân bilgileri ve ürünün teknik verileri ayrıca değerlendirilir.",
    label: "Öncelik",
    options: [
      o("ambience", "Görünüm ve atmosfer", "Mekânın odak noktasını oluşturmasını istiyorum."),
      o("heat", "Isıtma beklentisi", "Mekânın ısıtma ihtiyacını da görüşmek istiyorum."),
      o("both", "Her ikisi", "Görünümü ve kullanım amacını birlikte düşünelim."),
      o("unknown", "Henüz net değil", "Önceliklerimi görüşmede belirleyelim."),
    ],
  },
  views: {
    title: "Ateşi hangi yönlerden görmek istersiniz?",
    help: "Cam düzenini, oturma planını ve şöminenin konumunu birlikte düşünelim.",
    label: "İzleme yönü",
    options: [
      o("front", "Ön cepheden", "Düz bir görünüm benim için yeterli."),
      o("corner", "İki komşu yönden", "Köşe ve L tipi düzenleri değerlendirmek istiyorum."),
      o("three", "Üç yönden", "U tipi veya prizma seçeneklerini görmek istiyorum."),
      o("opposite", "Karşılıklı yönlerden", "Çift yönlü veya Epi yerleşimini konuşmak istiyorum."),
      o("center", "Mekânın ortasında", "Orta şömine seçeneklerini değerlendirelim."),
      o("unknown", "Yerleşimim henüz net değil", "Plan üzerinden birlikte karar verelim."),
    ],
  },
};

/** Yanıtlara göre sorulacak adımlar: baca yalnız odunluda, izleme yönü odunlu/kararsızda sorulur. */
export function guideSteps(a: GuideAnswers): GuideKey[] {
  return ["place", "fuel", ...(a.fuel === "wood" ? (["flue"] as const) : []), "priority", ...(a.fuel === "wood" || a.fuel === "unknown" ? (["views"] as const) : [])];
}

/** Ürün grubu değişince artık sorulmayan yanıtları temizler. */
export function normalizeGuide(a: GuideAnswers): GuideAnswers {
  const n = { ...a };
  if (n.fuel !== "wood") delete n.flue;
  if (n.fuel !== "wood" && n.fuel !== "unknown") delete n.views;
  return n;
}

export const guideLabel = (k: GuideKey, v: string | undefined) => GUIDE_QUESTIONS[k].options.find((x) => x.value === v)?.title ?? "Henüz seçilmedi";

export function guideSummary(a: GuideAnswers) {
  return guideSteps(a)
    .filter((k) => a[k])
    .map((k) => ({ key: k, label: GUIDE_QUESTIONS[k].label, value: guideLabel(k, a[k]) }));
}

type Link = { label: string; href: string };
const P = (slug: string) => `/urun/${slug}`;
const WOOD: Record<string, { title: string; why: string; links: Link[] }> = {
  front: { title: "Düz odunlu şömineler", why: "Ön cepheden izleme isteğiniz, düz hazne seçeneklerini incelemek için bir başlangıç.", links: [{ label: "Düz odunlu şömine", href: P("duz-odunlu-somine") }] },
  corner: { title: "L tipi odunlu şömineler", why: "İki komşu yönden ateş görünümü isteğiniz, L tipi düzenleri değerlendirmeyi anlamlı kılıyor.", links: [{ label: "L tipi odunlu şömine", href: P("l-tipi-odunlu-somine") }] },
  three: {
    title: "U tipi ve prizma şömineler",
    why: "Üç yönden izleme isteğiniz doğrultusunda U tipi ve prizma düzenlerin yerleşimini karşılaştırabiliriz.",
    links: [
      { label: "U tipi odunlu şömine", href: P("u-tipi-odunlu-somine") },
      { label: "Prizma odunlu şömine", href: P("prizma-odunlu-somine") },
    ],
  },
  opposite: {
    title: "Çift yönlü ve Epi şömineler",
    why: "Karşılıklı görüş isteğinizi, mekân bölümleri arasındaki ilişki ve ürün yerleşimi üzerinden değerlendirebiliriz.",
    links: [
      { label: "Çift yönlü odunlu şömine", href: P("cift-yonlu-odunlu-somine") },
      { label: "Epi odunlu şömine", href: P("epi-odunlu-somine") },
    ],
  },
  center: { title: "Orta şömine seçenekleri", why: "Mekânın ortasında konumlanma isteğiniz için görüş yönleri ve bağlantı güzergâhı birlikte incelenmeli.", links: [{ label: "Orta odunlu şömine", href: P("orta-odunlu-somine") }] },
};

export function guideRecommendation(a: GuideAnswers) {
  let title = "Ürün gruplarını birlikte karşılaştıralım";
  let why = "Kullanım yerinizi ve günlük beklentinizi konuşarak seçenekleri daraltabiliriz.";
  let alternatives = "Odunlu, elektrikli ve bioethanol ürün grupları farklı kullanım ve kurulum koşullarıyla karşılaştırılabilir.";
  let links: Link[] = [{ label: "Tüm ürünler", href: "/somine-modelleri" }];

  if (a.fuel === "wood") {
    const m = WOOD[a.views ?? ""];
    title = m?.title ?? "Odunlu şömine seçenekleri";
    why = m?.why ?? "Hazne biçimini belirlemek için oturma planı, görüş yönleri ve bağlantı koşullarını birlikte ele alalım.";
    links = m?.links ?? [{ label: "Odunlu şömineler", href: "/somine-modelleri/odunlu-somineler" }];
    alternatives = "Yerleşim değişirse diğer odunlu hazne biçimleri de karşılaştırılabilir. Odunlu uygulama uygun bulunmazsa farklı ürün gruplarının koşulları ayrıca incelenebilir.";
  } else if (a.fuel === "electric") {
    title = "Elektrikli şömine seçenekleri";
    why = "Elektrikli ürün grubunu tercih ettiniz. Alev efekti, ölçü ve yerleşimi ürünün teknik özellikleriyle birlikte karşılaştırabiliriz.";
    alternatives = "Gömme veya farklı yerleşim biçimleri yalnız seçilen ürünün kurulum talimatları çerçevesinde değerlendirilir.";
    links = [{ label: "Elektrikli şömine", href: P("elektrikli-somine") }];
  } else if (a.fuel === "bio") {
    title = "Bioethanol şömine seçenekleri";
    why = "Bioethanol ürün grubunu tercih ettiniz. Kullanım yeri, yakıt ve havalandırma koşulları seçilen modele göre incelenmeli.";
    alternatives = "Görünüm ve günlük kullanım beklentinize göre elektrikli seçeneklerle de karşılaştırma yapabilirsiniz; her grubun koşulları ayrıdır.";
    links = [{ label: "Bioethanol şömine", href: P("bioethanol-somine") }];
  }

  const checks = ["Kesin ürün ölçüsü, kurulum şartları ve bakım erişimi henüz teknik olarak onaylanmadı."];
  if (a.place === "outdoor") {
    title = "Dış mekâna uygun ateş çözümleri";
    why = "Bahçe veya teras seçiminiz öncelikli. Yalnız dış mekân kullanımına uygunluğu doğrulanmış ürünleri; zemin, çevre malzemeleri ve yerleşim koşullarıyla birlikte değerlendirelim.";
    alternatives = "Dış mekâna uygun bahçe şöminesi ve ateş çukuru seçenekleri kullanım amacınıza göre incelenebilir. Barbekü veya bahçe mutfağı beklentisi ayrıca görüşülebilir.";
    links = [
      { label: "Bahçe şömineleri ve ateş çukurları", href: P("bahce-somine-ve-ates-cukuru") },
      { label: "Barbekü", href: P("barbeku") },
      { label: "Bahçe mutfağı", href: P("bahce-mutfagi") },
    ];
    checks.push("İç mekân ürünü açık alana otomatik olarak önerilmez. Üstü kapalı alan da ayrıca değerlendirilir.");
  }
  if (a.place === "commercial") checks.push("Ticari mekânın kullanım biçimi, kullanıcılar ve proje gereklilikleri ayrıca değerlendirilmelidir.");
  if (a.place === "unknown") checks.push("Kullanım yeri netleşmediği için yerleşim ve ortam uygunluğu açık konular arasında.");
  if (a.fuel === "wood")
    checks.push(
      a.flue === "none"
        ? "Baca bulunmadığını belirttiniz. Yeni bir çözümün uygulanabilirliği incelenmeden odunlu montaj kararı verilemez."
        : "Bacanın mevcut veya planlanmış olması yeterli değildir; ürünle uyumu ve gerçek durumu incelenmeli.",
    );
  if (a.fuel === "bio") checks.push("Yakıt dolumu, havalandırma ve kullanım, seçilen ürünün talimatlarına göre ele alınmalı.");
  if (a.priority === "heat" || a.priority === "both") checks.push("Isıtma beklentisi; yapı, mekân ve ürüne ait verilerle ayrıca değerlendirilir. Bu rehber kapasite hesabı yapmaz.");
  if (a.fuel === "electric") checks.push("Isıtma özelliği ve elektrik gereksinimi modele göre değişebilir; teknik belge kontrol edilmeli.");
  return { title, why, alternatives, checks, links };
}
