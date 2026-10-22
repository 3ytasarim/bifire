"use client";

import { useState } from "react";
import type { SeoPage } from "@prisma/client";
import { AdminForm, SaveBar } from "@/components/admin/AdminForm";
import { Checkbox, CountedInput, DefaultedInput, Section, TextInput } from "@/components/admin/fields";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { publicUrl } from "@/lib/seo/public-origin";
import { saveSeoPage } from "../actions";

export function SeoPageForm({ pageKey, path, row, defaults }: { pageKey: string; path: string; row: SeoPage | null; defaults: { title: string; description: string; keywords: string; ogImage: string } }) {
  // Alanlar sayfada şu an kullanılan değerle dolu gelir (kayıt yoksa içerik dosyasındaki varsayılan).
  const [title, setTitle] = useState(row?.title?.trim() || defaults.title);
  const [desc, setDesc] = useState(row?.description?.trim() || defaults.description);
  const shownTitle = title.trim() ? (/bifire/i.test(title) ? title : `${title} | Bifire`) : defaults.title;
  return (
    <AdminForm action={saveSeoPage}>
      <input type="hidden" name="key" value={pageKey} />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section title="Arama sonucu">
            <div className="border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs text-neutral-600">bifiresomine.com{path === "/" ? "" : path}</p>
              <p className="mt-1 line-clamp-1 text-lg text-[#1a0dab]">{shownTitle}</p>
              <p className="mt-1 line-clamp-2 text-sm text-neutral-700">{desc.trim() || defaults.description}</p>
            </div>
            <CountedInput name="title" label="Sayfa başlığı (title)" hint={`Silinip boş kaydedilirse varsayılan kullanılır: “${defaults.title}”.`} defaultValue={title} recommended={[30, 60]} value={title} onValue={setTitle} />
            <CountedInput name="description" label="Meta açıklama" multiline hint="Silinip boş kaydedilirse varsayılan açıklama kullanılır." defaultValue={desc} recommended={[70, 160]} value={desc} onValue={setDesc} />
            <TextInput name="keywords" label="Anahtar kelimeler" hint="Virgülle ayırın." defaultValue={row?.keywords?.trim() || defaults.keywords} maxLength={300} />
            <DefaultedInput name="canonicalUrl" label="Canonical URL" hint="Sayfanın kendi adresi. Yalnızca aynı site içindeki bir adres kabul edilir." stored={row?.canonicalUrl} fallback={publicUrl(path)} maxLength={500} />
          </Section>
          <Section title="Sosyal paylaşım (Open Graph / Twitter)">
            <DefaultedInput name="ogTitle" label="Paylaşım başlığı (og:title)" hint="Otomatik: sayfa başlığı." stored={row?.ogTitle} fallback={title} maxLength={120} />
            <DefaultedInput name="ogDescription" label="Paylaşım açıklaması (og:description)" hint="Otomatik: meta açıklama." stored={row?.ogDescription} fallback={desc} multiline maxLength={320} />
            <ImagePicker name="ogImage" label="Paylaşım görseli (og:image)" defaultValue={row?.ogImage} fallback={defaults.ogImage} aspect="aspect-[1200/630]" hint="1200×630 önerilir. Otomatik: site paylaşım görseli." />
          </Section>
        </div>
        <div>
          <Section title="Robots">
            <Checkbox name="robotsIndex" label="Arama motorlarında indexlensin (index)" defaultChecked={row?.robotsIndex ?? true} hint="Kapatılırsa sayfa sitemap'ten de çıkar." />
            <Checkbox name="robotsFollow" label="Bağlantılar takip edilsin (follow)" defaultChecked={row?.robotsFollow ?? true} />
          </Section>
        </div>
      </div>
      <SaveBar />
    </AdminForm>
  );
}
