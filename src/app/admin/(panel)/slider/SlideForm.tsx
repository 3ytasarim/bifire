"use client";

import type { HeroSlide } from "@prisma/client";
import { AdminForm, SaveBar } from "@/components/admin/AdminForm";
import { Checkbox, Section, SelectInput, TextArea, TextInput } from "@/components/admin/fields";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { VideoPicker } from "@/components/admin/VideoPicker";
import { TEXT_POSITION_LABELS } from "@/lib/catalog";
import { saveSlide } from "./actions";

export function SlideForm({ slide }: { slide?: HeroSlide | null }) {
  const s = slide;
  return (
    <AdminForm action={saveSlide}>
      {s ? <input type="hidden" name="id" value={s.id} /> : null}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section title="Görseller" description="Tam ekran görsel. Masaüstü için yatay (ör. 2560×1440), mobil için dikey (ör. 1080×1920) önerilir. Video kullanıyorsanız videonun ilk karesine benzeyen bir görsel kapak olarak seçin.">
            <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
              <ImagePicker name="desktopImage" label="Masaüstü görseli" defaultValue={s?.desktopImage} altName="imageAlt" altDefault={s?.imageAlt} aspect="aspect-[16/9]" nameHint={s?.title ?? "slider"} />
              <ImagePicker name="mobileImage" label="Mobil görsel (opsiyonel)" defaultValue={s?.mobileImage} aspect="aspect-[9/16] max-w-48" nameHint={`${s?.title ?? "slider"} mobil`} hint="Boşsa masaüstü görseli kullanılır." />
            </div>
          </Section>
          <Section
            title="Arka plan videosu (opsiyonel)"
            description="MP4 (H.264) veya WebM, sessiz, 8–20 sn döngü, en fazla 40 MB. Video varsa yukarıdaki görsel kapak olarak kullanılır: sayfa önce görselle hızlı açılır, video hazır olunca yumuşakça başlar. Hareketi azalt / veri tasarrufu modundaki ziyaretçilere yalnızca görsel gösterilir."
          >
            <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
              <VideoPicker name="desktopVideo" label="Masaüstü videosu" defaultValue={s?.desktopVideo} aspect="aspect-video" />
              <VideoPicker name="mobileVideo" label="Mobil video" defaultValue={s?.mobileVideo} aspect="aspect-[9/16] max-w-48" hint="Boşsa masaüstü videosu kullanılır (ortalanarak kırpılır)." />
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
            <TextInput
              name="focalX"
              label="Mobil kadraj odağı (%)"
              type="number"
              min={0}
              max={100}
              defaultValue={String(s?.focalX ?? 50)}
              hint="Yatay görsel/video telefonda kırpılırken ekranda kalacak nokta: 0 = sol, 50 = orta, 100 = sağ. Ayrı mobil görsel/video varsa genelde 50 bırakın."
            />
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
