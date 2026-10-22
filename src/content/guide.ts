/**
 * Şömine Rehberi yapısı (Bifire Şömine Rehberi 130 makale planı, 22 Ekim 2026).
 * - Altı ana kategori: yazının kategorisi BlogPost.category alanında `slug` ile tutulur (admin'de seçilir).
 * - Makaleler içerik haritasındaki numarayla (BlogPost.guideNo) eşleşir; numara sitede gösterilmez.
 * - Okuma yolları ve "önce bunları okuyun" listesi numaralarla tanımlanır; yalnız yayındaki yazılar gösterilir.
 */
export type GuideCategory = { slug: string; name: string; intro: string; /** Önce okunacak merkez rehber (makale no). */ hub: number };

export const GUIDE_CATEGORIES: GuideCategory[] = [
  { slug: "somine-secimi", name: "Şömine Seçimi", hub: 1, intro: "Kullanım amacınıza, evinizin özelliklerine ve ısıtma beklentinize göre seçime nereden başlayacağınızı öğrenin." },
  { slug: "tasarim-ve-modeller", name: "Tasarım ve Modeller", hub: 19, intro: "Cam düzenini, kaplamayı, salon yerleşimini ve bahçe tasarımını birlikte değerlendirin; yaşam alanınıza uygun tasarımı belirleyin." },
  { slug: "fiyat-ve-satin-alma", name: "Fiyat ve Satın Alma", hub: 2, intro: "Fiyatı oluşturan işleri, teklif kapsamını, sipariş kararlarını ve showroom görüşmesine hazırlığı adım adım inceleyin." },
  { slug: "montaj-ve-baca", name: "Montaj ve Baca", hub: 24, intro: "Keşif, baca, hava ihtiyacı, iş sırası ve ekip koordinasyonunu projeniz başlamadan önce tanıyın." },
  { slug: "yalitim-ve-malzemeler", name: "Yalıtım ve Malzemeler", hub: 7, intro: "Isı odasını, yalıtım malzemelerini, camı ve ürün belgelerini hangi sorularla değerlendireceğinizi öğrenin." },
  { slug: "kullanim-ve-bakim", name: "Kullanım ve Bakım", hub: 29, intro: "İlk kullanımdan sezon sonuna kadar bakım ihtiyaçlarını, kullanım alışkanlıklarını ve teknik destek hazırlığını inceleyin." },
];

export const guideCategoryBySlug = (slug: string | null | undefined) => GUIDE_CATEGORIES.find((c) => c.slug === slug) ?? null;
export const guideCategoryByName = (name: string) => GUIDE_CATEGORIES.find((c) => c.name === name) ?? null;

/** Okuma yolu: ihtiyaca göre sıralı rehberler (makale no) + sonraki adım. */
export type GuidePath = { key: string; label: string; title: string; text: string; nos: number[]; next: { label: string; href: string } };

const SHOWROOM = { label: "Showroom ziyaretini planlayın", href: "/fabrika-showroom" };
const PROJECT = { label: "Proje bilgilerinizi paylaşın", href: "/teklif-al" };
const SUPPORT = { label: "Teknik destek talebi", href: "/iletisim" };

export const GUIDE_PATHS: GuidePath[] = [
  { key: "ilk", label: "İlk kez alacağım", title: "Şömine almayı düşünüyorum", text: "Önce evinizin uygunluğunu ve beklentinizi belirleyin; ardından fiyatı oluşturan işleri ve teklif kapsamını inceleyin.", nos: [1, 3, 2, 9, 10], next: SHOWROOM },
  { key: "yenileme", label: "Evimi yeniliyorum", title: "Evimi yaptırıyor veya yeniliyorum", text: "Yeni yapı ve mevcut ev için iş sırasını, keşif ihtiyacını ve baca kararlarını netleştirin.", nos: [76, 22, 23, 24, 25, 4], next: PROJECT },
  { key: "tasarim", label: "Tasarım arıyorum", title: "Salonuma uygun tasarımı arıyorum", text: "Modeli, malzemeyi ve yerleşimi birlikte karşılaştırın.", nos: [19, 5, 21, 78, 34], next: SHOWROOM },
  { key: "mimar", label: "Mimarım", title: "Mimar olarak proje hazırlıyorum", text: "Çizim, teknik belge ve iş sınırlarını netleştirin.", nos: [24, 59, 48, 77, 32], next: PROJECT },
  { key: "destek", label: "Destek arıyorum", title: "Şöminem var ve destek arıyorum", text: "Belirtiye göre ilgili rehbere geçin: duman, cam kararması, ses, koku, yüzey izi, cam hasarı veya kapak sorunu.", nos: [29, 67, 98, 99, 26, 27, 68, 69, 92, 93, 94], next: SUPPORT },
  { key: "elektrikli", label: "Elektrikli / bioethanol", title: "Elektrikli veya bioethanol düşünüyorum", text: "Yakıt teknolojilerini karşılaştırın, ardından tercih ettiğiniz sisteme göre ilerleyin.", nos: [101, 102, 103, 104, 120, 128], next: PROJECT },
  { key: "bahce", label: "Bahçe ve açık alan", title: "Bahçemi ve açık alanımı planlıyorum", text: "Barbekü, bahçe mutfağı ve ateş ürünü seçimini yerleşim ve bakım kararlarıyla birleştirin.", nos: [106, 107, 108, 119, 129], next: PROJECT },
  { key: "belgeler", label: "Yalıtım ve belgeler", title: "Yalıtım ve ürün belgelerini inceleyeceğim", text: "Ürün kimliğini, katmanları, emisyon belgesini ve birleşim detaylarını ayırın.", nos: [8, 121, 122, 124, 125, 123], next: PROJECT },
];

/** Rehber ana sayfası "Önce bunları okuyun". */
export const GUIDE_ESSENTIALS = [1, 2, 3, 7, 24, 29];
/** "Fikirden uygulamaya" yol haritası ve showroom hazırlık rehberi. */
export const GUIDE_ROADMAP = { roadmap: 100, showroomPrep: 10 };

/** Yazı sonu sonraki adım (içerik haritasındaki "Sonraki adım"). */
export const NEXT_STEPS: Record<string, { title: string; text: string; cta: { label: string; href: string } }> = {
  "Showroom randevusu": { title: "Kararınızı fabrika showroomunda somutlaştıralım", text: "Mekânınızın fotoğrafları, varsa planı ve yaklaşık ölçüleriyle gelin; cam düzenini, kaplamayı ve kullanım ayrıntılarını Tuzla fabrika showroomumuzda yakından değerlendirelim.", cta: SHOWROOM },
  "Teklif kapsamını görüş": { title: "Teklif kapsamını birlikte netleştirelim", text: "Ürün, kaplama, baca, nakliye ve montajın hangi kapsamda olduğunu proje bilgilerinizle birlikte açık bir teklife dönüştürelim.", cta: { label: "Teklif kapsamını görüşelim", href: "/teklif-al" } },
  "Proje bilgisi paylaş": { title: "Planınızı birlikte değerlendirelim", text: "Plan, fotoğraf ve yaklaşık ölçülerinizi paylaşın; keşif ihtiyacını ve sonraki adımı birlikte belirleyelim.", cta: PROJECT },
  "Teknik destek": { title: "Teknik destek için bilgilerinizi hazırlayın", text: "Modelinizi, gözlediğiniz belirtiyi ve varsa fotoğrafları paylaşın; ekibimiz durumu değerlendirip sonraki adımı belirlesin.", cta: SUPPORT },
};
