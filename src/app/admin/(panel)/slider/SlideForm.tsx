"use client";

import type { HeroSlide } from "@prisma/client";
import { AdminForm, SaveBar } from "@/components/admin/AdminForm";
import { Checkbox, Section, SelectInput, TextArea, TextInput } from "@/components/admin/fields";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { TEXT_POSITION_LABELS } from "@/lib/catalog";
import { saveSlide } from "./actions";

export function SlideForm({ slide }: { slide?: HeroSlide | null }) {
  const s = slide;
  return (
    <AdminForm action={saveSlide}>
      {s ? <input type="hidden" name="id" value={s.id} /> : null}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section title="Görseller" description="Tam ekran görsel. Masaüstü için yatay (ör. 2560×1440), mobil için dikey (ör. 1080×1920) önerilir.">
            <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
              <ImagePicker name="desktopImage" label="Masaüstü görseli" required defaultValue={s?.desktopImage} altName="imageAlt" altDefault={s?.imageAlt} aspect="aspect-[16/9]" nameHint={s?.title ?? "slider"} />
              <ImagePicker name="mobileImage" label="Mobil görsel (opsiyonel)" defaultValue={s?.mobileImage} aspect="aspect-[9/16] max-w-48" nameHint={`${s?.title ?? "slider"} mobil`} hint="Boşsa masaüstü görseli kullanılır." />
            </div>
          </Section>
          <Section title="Metin">
            <TextInput name="eyebrow" label="Üst başlık (eyebrow)" placeholder="ör. Mimari şömine çözümleri" defaultValue={s?.eyebrow ?? ""} maxLength={80} />
            <TextInput name="title" label="Başlık" required defaultValue={s?.title ?? ""} maxLength={160} />
            <TextArea name="description" label="Açıklama" rows={3} maxLength={400} defaultValue={s?.description ?? ""} />
          </Section>
          <Section title="Butonlar">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput name="ctaText" label="Birincil buton metni" placeholder="Ürünleri Keşfet" defaultValue={s?.ctaText ?? ""} maxLength={40} />
              <TextInput name="ctaUrl" label="Birincil buton bağlantısı" placeholder="/urunler" defaultValue={s?.ctaUrl ?? ""} maxLength={500} />
              <TextInput name="secondaryCtaText" label="İkincil buton metni" placeholder="Projenizi Konuşalım" defaultValue={s?.secondaryCtaText ?? ""} maxLength={40} />
              <TextInput name="secondaryCtaUrl" label="İkincil buton bağlantısı" placeholder="/teklif-al" defaultValue={s?.secondaryCtaUrl ?? ""} maxLength={500} />
            </div>
          </Section>
        </div>
        <div className="space-y-6">
          <Section title="Görünüm">
            <SelectInput name="textPosition" label="Metin konumu" defaultValue={s?.textPosition ?? "LEFT"} options={Object.entries(TEXT_POSITION_LABELS).map(([value, label]) => ({ value, label }))} />
            <TextInput name="overlay" label="Karartma (%)" type="number" min={0} max={90} defaultValue={String(s?.overlay ?? 45)} hint="Metnin okunaklılığı için görselin üzerine eklenen karartma (0–90)." />
          </Section>
          <Section title="Yayın">
            <Checkbox name="active" label="Aktif" defaultChecked={s?.active ?? true} />
            <TextInput name="sortOrder" label="Sıra" type="number" min={0} defaultValue={String(s?.sortOrder ?? 0)} />
          </Section>
        </div>
      </div>
      <SaveBar />
    </AdminForm>
  );
}
