import { slugify } from "@/lib/slug";
import { CODE_LABEL, splitVariant } from "@/lib/variants";

/**
 * Koleksiyon modelleri: bir ürün ailesinin (ör. U Tipi Odunlu Şömine) teknik satırlarındaki `variant`
 * anahtarlarından türetilir. "Model kodu" satırı olan her anahtar bir modeldir ("Seri 01 / 70'lik" → BF-U-01-70).
 * Ayrı tablo yok: admin'de ürünün teknik satırları düzenlendiğinde modeller ve sayfaları da güncellenir.
 */
type Spec = { label: string; value: string; unit: string | null; variant: string | null };
type Opt = { group: string; value: string };

export type ModelRow = { label: string; value: string; unit: string | null };
export type CollectionModel = {
  key: string;
  code: string;
  slug: string;
  parts: string[];
  /** Son seçim dışındaki parçalar (ör. "Seri 01"); tek gruplu ailede boş. */
  series: string | null;
  /** Son parça (ör. "70'lik", "80 × 55", "Dairesel"). */
  size: string;
  /** Modelin teknik satırları, veri sırasıyla: modele bağlı + tüm modeller için geçerli. */
  rows: ModelRow[];
  /** Model kodu dışında sayısal/teknik değeri var mı? */
  hasData: boolean;
};

export function groupOptions(options: Opt[]) {
  const groups = new Map<string, string[]>();
  for (const o of options) groups.set(o.group, [...(groups.get(o.group) ?? []), o.value]);
  return [...groups.entries()].map(([name, values]) => ({ name, values }));
}

/** Teknik değerlerin bağlı olduğu seçenek grupları (sırasıyla), ör. ["Seri", "Ölçü"]. */
export function variantGroupsOf(options: Opt[], specs: Spec[]) {
  const keys = [...new Set(specs.filter((s) => s.variant).map((s) => s.variant!))];
  return groupOptions(options)
    .filter((g) => g.values.some((v) => keys.some((k) => splitVariant(k).includes(v))))
    .map((g) => g.name);
}

export function buildModels(product: { specifications: Spec[]; options: Opt[] }): CollectionModel[] {
  const specs = product.specifications;
  const groups = variantGroupsOf(product.options, specs);
  const codes = specs.filter((s) => s.label === CODE_LABEL && s.variant);
  return codes.map((c) => {
    const key = c.variant!;
    const parts = splitVariant(key);
    const rows: ModelRow[] = [];
    for (const s of specs) {
      if (s.variant && s.variant !== key) continue;
      if (rows.some((r) => r.label === s.label)) continue;
      rows.push({ label: s.label, value: s.value, unit: s.unit });
    }
    return {
      key,
      code: c.value,
      slug: slugify(c.value),
      parts,
      series: groups.length > 1 ? parts.slice(0, -1).join(" · ") : null,
      size: parts.at(-1) ?? key,
      rows,
      hasData: specs.some((s) => s.variant === key && s.label !== CODE_LABEL),
    };
  });
}

/** Model kartı/hero için öne çıkan değerler (güç, verim, ağırlık, baca) — model kodu ve sabit metin satırları hariç. */
export function keyValues(model: CollectionModel, limit = 4) {
  return model.rows.filter((r) => r.label !== CODE_LABEL && /\d/.test(r.value)).slice(0, limit);
}

export const formatSpec = (value: string, unit: string | null | undefined) => (!unit ? value : unit === "%" ? `%${value}` : `${value} ${unit}`);

export const modelPath = (productSlug: string, modelSlug: string) => `/urun/${productSlug}/${modelSlug}`;
