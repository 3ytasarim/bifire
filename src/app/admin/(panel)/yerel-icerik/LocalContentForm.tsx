"use client";

import { AdminForm, SaveBar } from "@/components/admin/AdminForm";
import { Section } from "@/components/admin/fields";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { saveLocalContent } from "./actions";

type Row = { intro: string | null; note: string | null; image: string | null; imageAlt: string | null; image2: string | null; image2Alt: string | null } | null;

export function LocalContentForm({ targetKey, kind, label, row }: { targetKey: string; kind: "bolge" | "model"; label: string; row: Row }) {
  const isModel = kind === "model";
  return (
    <AdminForm action={saveLocalContent}>
      <input type="hidden" name="key" value={targetKey} />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section
            title={isModel ? "Bu modele özel açıklama" : "Bu bölgeye özel açıklama"}
            description={
              isModel
                ? "Yalnız bu ölçü/modelde geçerli bilgiler: hangi oda büyüklüğüne uygun olduğu, cam ve görüş açısı, yerleşim örneği, bu ölçüye özgü notlar. Aile sayfasındaki ortak metni tekrar etmeyin."
                : "Yalnız bu bölgeye ait doğrulanmış bilgiler: bu bölgede yapılan uygulamalar, mimari/konut tipi, keşif ve montaj süreci, ulaşım. Uydurma proje veya müşteri bilgisi yazmayın."
            }
          >
            <RichTextEditor name="intro" label="Açıklama" defaultValue={row?.intro} placeholder={isModel ? `${label} için modele özgü açıklama…` : `${label} için bölgeye özgü açıklama…`} />
          </Section>
          <Section title={isModel ? "Kullanım ve yerleşim notu" : "Bölgedeki hizmet bilgisi"} description="Kısa ve somut bir not (ör. keşif günü, teslim süresi, ölçü uyarısı). Boş bırakılabilir.">
            <RichTextEditor name="note" label="Not" defaultValue={row?.note} />
          </Section>
        </div>
        <div className="space-y-6">
          <Section title={isModel ? "Model fotoğrafı" : "Uygulama fotoğrafı"} description="Gerçek fotoğraf kullanın; tasarım/AI görselleri gerçek proje gibi sunulmamalı.">
            <ImagePicker name="image" label="Görsel" defaultValue={row?.image} altName="imageAlt" altDefault={row?.imageAlt} nameHint={label} aspect="aspect-[4/3]" />
          </Section>
          <Section title={isModel ? "Teknik çizim" : "İkinci uygulama fotoğrafı"}>
            <ImagePicker name="image2" label="Görsel" defaultValue={row?.image2} altName="image2Alt" altDefault={row?.image2Alt} nameHint={`${label} ${isModel ? "teknik cizim" : "uygulama"}`} aspect="aspect-[4/3]" />
          </Section>
          <p className="text-xs leading-relaxed text-neutral-500">Tüm alanları boşaltıp kaydederseniz bu sayfanın özel içeriği kaldırılır; sayfa ortak şablonla açılmaya devam eder.</p>
        </div>
      </div>
      <SaveBar />
    </AdminForm>
  );
}
