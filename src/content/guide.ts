/**
 * Şömine Rehberi konu kategorileri (Bifire web tasarım sunumundaki rehber kütüphanesi). Yazının kategorisi
 * BlogPost.category alanında bu listedeki `slug` ile tutulur; admin yazı formunda seçilir.
 */
export type GuideCategory = { slug: string; name: string; intro: string };

export const GUIDE_CATEGORIES: GuideCategory[] = [
  { slug: "somine-secimi", name: "Şömine Seçimi", intro: "Yakıt türünden hazne tipine, mekânınıza ve kullanım beklentinize uygun şömineyi seçerken sorulacak doğru sorular." },
  { slug: "tasarim-ve-modeller", name: "Tasarım ve Modeller", intro: "L, U, düz, çift yönlü ve özel ölçü modeller; kaplama, yerleşim ve mekânla uyum üzerine tasarım rehberleri." },
  { slug: "fiyat-ve-satin-alma", name: "Fiyat ve Satın Alma", intro: "Fiyatı belirleyen kalemler, teklif karşılaştırma, sipariş ve ödeme süreçleri; satın almadan önce netleştirilecekler." },
  { slug: "montaj-ve-baca", name: "Montaj ve Baca", intro: "Keşiften montaja: baca güzergâhı, hazırlık, uygulama aşamaları ve yeni yapı ya da mevcut evde planlama." },
  { slug: "yalitim-ve-malzemeler", name: "Yalıtım ve Malzemeler", intro: "Isı odası, yalıtım levhaları, taş yünü ve uygulama detayları; malzeme seçerken incelenecek belgeler." },
  { slug: "kullanim-ve-bakim", name: "Kullanım ve Bakım", intro: "İlk kullanımdan sezon sonuna; doğru yakıt, temizlik, bakım ve servis gerektiren durumlar." },
];

export const guideCategoryBySlug = (slug: string | null | undefined) => GUIDE_CATEGORIES.find((c) => c.slug === slug) ?? null;

/** "Size nasıl yardımcı olabiliriz?" — ihtiyaca göre ilgili kategoriler. */
export const GUIDE_PERSONAS: { label: string; categories: string[] }[] = [
  { label: "İlk kez alacağım", categories: ["somine-secimi", "fiyat-ve-satin-alma"] },
  { label: "Evimi yeniliyorum", categories: ["montaj-ve-baca", "tasarim-ve-modeller"] },
  { label: "Tasarım arıyorum", categories: ["tasarim-ve-modeller", "yalitim-ve-malzemeler"] },
  { label: "Mimarım", categories: ["montaj-ve-baca", "yalitim-ve-malzemeler"] },
  { label: "Destek arıyorum", categories: ["kullanim-ve-bakim"] },
];
