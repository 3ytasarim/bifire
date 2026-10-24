"use client";

import type { ProductCategory } from "@prisma/client";
import { routes } from "@/lib/catalog";
import { AdminForm, SaveBar } from "@/components/admin/AdminForm";
import { Checkbox, Section, SelectInput, TextArea, TextInput } from "@/components/admin/fields";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SeoFields } from "@/components/admin/SeoFields";
import { SlugFields } from "@/components/admin/SlugFields";
import { saveCategory } from "./actions";

export function CategoryForm({ category, parents }: { category?: ProductCategory | null; parents: { id: string; name: string }[] }) {
  const c = category;
  return (
    <AdminForm action={saveCategory}>
      {c ? <input type="hidden" name="id" value={c.id} /> : null}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section title="Genel">
            <SlugFields nameLabel="Kategori adı" defaultName={c?.name} defaultSlug={c?.slug} prefix={routes.category(c?.slug || "x").replace(/x$/, "")} />
            <SelectInput
              name="parentId"
              label="Üst kategori"
              placeholder="— Ana kategori —"
              defaultValue={c?.parentId ?? ""}
              options={parents.filter((p) => p.id !== c?.id).map((p) => ({ value: p.id, label: p.name }))}
              hint="Alt kategori (ör. Şömine Hazneleri › Asansörlü) oluşturmak için seçin."
            />
            <TextArea name="description" label="Kısa açıklama" defaultValue={c?.description ?? ""} maxLength={600} rows={3} hint="Kategori sayfasının başlığı altında ve kartlarda görünür." />
          </Section>
          <Section
            title="Koleksiyon sayfası metinleri"
            description="Alt kategorisi olan ürün grubunda (ör. Odunlu Şömineler) sayfa koleksiyon düzeninde açılır: büyük başlık, aile kartları üstündeki başlık/metin ve koyu “yaklaşım” bandı. Boş bırakılan alanlarda genel metin kullanılır; yaklaşım metni boşsa bant gösterilmez."
          >
            <TextInput name="heroTitle" label="Sayfa başlığı (H1)" defaultValue={c?.heroTitle ?? ""} maxLength={160} hint="Boşsa kategori adı. Altında “Kısa açıklama” görünür." />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput name="pickTitle" label="Kartlar üstü başlık" defaultValue={c?.pickTitle ?? ""} maxLength={160} />
              <TextInput name="approachTitle" label="Yaklaşım bandı başlığı" defaultValue={c?.approachTitle ?? ""} maxLength={160} />
            </div>
            <TextArea name="pickText" label="Kartlar üstü metin" defaultValue={c?.pickText ?? ""} maxLength={600} rows={2} />
            <TextArea name="approachText" label="Yaklaşım bandı metni" defaultValue={c?.approachText ?? ""} maxLength={2000} rows={5} hint="Paragrafları boş bir satırla ayırın." />
          </Section>
          <Section title="SEO içeriği" description="Ürün listesinin altında yayınlanan açıklayıcı içerik (kategori hakkında rehber metin).">
            <RichTextEditor name="content" label="İçerik" defaultValue={c?.content} />
          </Section>
          <SeoFields defaults={c ?? {}} fallbackTitle={c?.name ?? ""} fallbackDescription={c?.description ?? undefined} urlPath={routes.category(c?.slug ?? "")} fallbackImage={c?.image} />
        </div>
        <div className="space-y-6">
          <Section title="Yayın">
            <Checkbox name="active" label="Aktif (sitede görünür)" defaultChecked={c?.active ?? true} />
            <TextInput name="sortOrder" label="Sıra" type="number" min={0} defaultValue={String(c?.sortOrder ?? 0)} hint="Küçük sayı önce gösterilir." />
          </Section>
          <Section title="Kategori görseli">
            <ImagePicker name="image" label="Görsel" defaultValue={c?.image} altName="imageAlt" altDefault={c?.imageAlt} aspect="aspect-[4/5]" nameHint={c?.name ?? "kategori"} hint="Menüde, ana sayfada ve kategori başlığında kullanılır." />
          </Section>
        </div>
      </div>
      <SaveBar />
    </AdminForm>
  );
}
