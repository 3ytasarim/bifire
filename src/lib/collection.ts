/**
 * Koleksiyon ailesi şablon metinleri — ürün kaydından (Admin > Ürünler > "Koleksiyon ve şablon metinleri").
 * Alanların hiçbiri girilmemişse ürün koleksiyon ailesi gibi davranmaz (sade ürün sayfası).
 */
export type WoodFamily = {
  /** Model adlarında kullanılan kısa ad: "U Tipi Şömine 70'lik". */
  title: string;
  tag: string | null;
  line: string | null;
  desc: string | null;
  view: string | null;
  place: string | null;
  focus: string | null;
  detailIntro: string | null;
  specNote: string | null;
  detailNote: string | null;
};

type FamilyFields = {
  name: string;
  familyTitle?: string | null;
  collectionTag?: string | null;
  collectionLine?: string | null;
  collectionDesc?: string | null;
  viewText?: string | null;
  placeText?: string | null;
  focusText?: string | null;
  detailIntro?: string | null;
  specNote?: string | null;
  detailNote?: string | null;
};

export function familyOf(p: FamilyFields): WoodFamily | null {
  const any = p.familyTitle || p.collectionTag || p.collectionLine || p.viewText || p.placeText || p.focusText || p.detailIntro;
  if (!any) return null;
  return {
    title: p.familyTitle || p.name,
    tag: p.collectionTag || null,
    line: p.collectionLine || null,
    desc: p.collectionDesc || null,
    view: p.viewText || null,
    place: p.placeText || null,
    focus: p.focusText || null,
    detailIntro: p.detailIntro || null,
    specNote: p.specNote || null,
    detailNote: p.detailNote || null,
  };
}

/** Model sayfası/kartı adı: "U Tipi Şömine 70'lik", "Düz Şömine 80 × 55". */
export const modelName = (family: WoodFamily | null, productName: string, size: string) => `${family?.title ?? productName} ${size}`;

/** Koleksiyon kategori sayfası metinleri (Admin > Kategoriler). Boş alan → kategori adı/açıklamasından genel metin. */
export function collectionCopy(c: { name: string; description: string | null; heroTitle?: string | null; pickTitle?: string | null; pickText?: string | null; approachTitle?: string | null; approachText?: string | null; parent?: { name: string } | null }) {
  return {
    eyebrow: `Bifire · ${c.parent?.name ?? c.name}`,
    title: c.heroTitle || c.name,
    intro: c.description,
    pickTitle: c.pickTitle || "İhtiyacınıza uygun çözümü seçin.",
    pickText: c.pickText || "Ürünü kullanım alanınız ve beklentinizle birlikte değerlendirelim; ölçü, malzeme ve uygulama kapsamını projeniz üzerinden netleştirelim.",
    approachTitle: c.approachTitle || undefined,
    approach: c.approachText ? c.approachText.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean) : undefined,
  };
}
