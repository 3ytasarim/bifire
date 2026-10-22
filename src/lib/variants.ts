/**
 * Seçeneğe bağlı (variant) teknik değerlerin anahtarı. Tek seçime bağlı değerde anahtar seçenek değerinin
 * kendisidir ("70'lik"); birden fazla seçime bağlıysa değerler seçenek grubu sırasıyla " / " ile birleşir
 * ("Seri 01 / 70'lik"). Hem sunucu (sayfa verisi) hem istemci (seçim bileşenleri) bu yardımcıları kullanır.
 */
export const VARIANT_SEP = " / ";

/** Seçili modelin kodunu taşıyan teknik satır; sayısal değer sayılmaz (öne çıkan değerlerde ve veri eksikliği kontrolünde dışarıda kalır). */
export const CODE_LABEL = "Model kodu";

export const splitVariant = (key: string) => key.split(VARIANT_SEP);

/** Seçili değerlerden anahtar üretir; seçilmemiş grup için `fallback` anahtarının ilgili parçası kullanılır. */
export function variantKeyOf(groups: string[], picked: Record<string, string>, fallback: string) {
  const fb = splitVariant(fallback);
  return groups.map((g, i) => picked[g] || fb[i] || "").join(VARIANT_SEP);
}

/** `key`, verilen önek parçalarıyla başlayan bir model mi? (ör. "Seri 01" seçiliyken hangi ölçüler var) */
export function hasPrefix(key: string, prefix: string[]) {
  const parts = splitVariant(key);
  return prefix.every((p, i) => parts[i] === p);
}

/** Ölçü çizimi gibi bir öğenin `variant` alanı mevcut modele uyuyor mu? Boş → tüm modeller; tam anahtar veya tek parça eşleşmesi. */
export function variantMatches(itemVariant: string | null | undefined, key: string) {
  if (!itemVariant) return true;
  if (itemVariant === key) return true;
  const want = splitVariant(itemVariant);
  const parts = splitVariant(key);
  return want.every((w) => parts.includes(w));
}
