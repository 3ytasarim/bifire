"use client";

import { useState } from "react";
import { publicUrl } from "@/lib/seo/public-origin";
import { Checkbox, CountedInput, DefaultedInput, TextInput } from "./fields";
import { ImagePicker } from "./ImagePicker";
import { Section } from "./fields";

/**
 * İçerik SEO alanları + Google sonuç önizlemesi. Boş bırakılan alanlar için site otomatik
 * değer üretir (başlık: "{Ad} | Bifire", açıklama: kısa açıklama/içerikten).
 */
export function SeoFields({
  defaults,
  fallbackTitle,
  fallbackDescription,
  urlPath,
  fallbackImage,
}: {
  defaults: { metaTitle?: string | null; metaDescription?: string | null; metaKeywords?: string | null; canonicalUrl?: string | null; ogImage?: string | null; noIndex?: boolean };
  fallbackTitle: string;
  fallbackDescription?: string;
  urlPath: string;
  /** Paylaşım görseli boşsa kullanılan görsel (kapak). */
  fallbackImage?: string | null;
}) {
  const [title, setTitle] = useState(defaults.metaTitle ?? "");
  const [desc, setDesc] = useState(defaults.metaDescription ?? "");
  const shownTitle = title.trim() ? (/bifire/i.test(title) ? title : `${title} | Bifire`) : fallbackTitle ? `${fallbackTitle} | Bifire` : "Başlık";
  const shownDesc = desc.trim() || fallbackDescription || "Açıklama boşsa içerikten otomatik üretilir.";

  return (
    <Section title="SEO" description="Boş bıraktığınız alanlar otomatik doldurulur; elle yazılan metin arama sonuçlarında daha iyi tıklanma sağlar.">
      <div className="border border-neutral-200 bg-neutral-50 p-4" aria-label="Google önizlemesi">
        <p className="truncate text-xs text-neutral-600">bifiresomine.com{urlPath}</p>
        <p className="mt-1 line-clamp-1 text-lg text-[#1a0dab]">{shownTitle}</p>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-700">{shownDesc}</p>
      </div>
      <CountedInput name="metaTitle" label="Meta başlık" hint="Boşsa ad kullanılır." defaultValue={defaults.metaTitle} recommended={[30, 60]} value={title} onValue={setTitle} />
      <CountedInput name="metaDescription" label="Meta açıklama" multiline defaultValue={defaults.metaDescription} recommended={[70, 160]} value={desc} onValue={setDesc} />
      <TextInput name="metaKeywords" label="Anahtar kelimeler" hint="Virgülle ayırın. (Google sıralamada kullanmaz; iç arama ve diğer motorlar için.)" defaultValue={defaults.metaKeywords ?? ""} maxLength={300} />
      <DefaultedInput name="canonicalUrl" label="Canonical URL" hint="Sayfanın kendi adresi (adres değişirse otomatik güncellenir). Yalnızca aynı site içindeki bir adres kabul edilir." stored={defaults.canonicalUrl} fallback={publicUrl(urlPath)} maxLength={500} />
      <ImagePicker name="ogImage" label="Paylaşım görseli (og:image)" defaultValue={defaults.ogImage} fallback={fallbackImage} hint="Otomatik: kapak görseli. Önerilen 1200×630." aspect="aspect-[1200/630]" />
      <Checkbox name="noIndex" label="Arama motorlarında gösterme (noindex)" hint="İşaretlenirse sayfa sitemap'ten de çıkar." defaultChecked={defaults.noIndex} />
    </Section>
  );
}
