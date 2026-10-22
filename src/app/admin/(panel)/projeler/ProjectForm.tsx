"use client";

import { AdminForm, SaveBar } from "@/components/admin/AdminForm";
import { Checkbox, Section, TextArea, TextInput } from "@/components/admin/fields";
import { GalleryEditor, type GalleryItem } from "@/components/admin/GalleryEditor";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { MultiPicker } from "@/components/admin/MultiPicker";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SeoFields } from "@/components/admin/SeoFields";
import { SlugFields } from "@/components/admin/SlugFields";
import { saveProject } from "./actions";

export type ProjectFormData = {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  projectType: string | null;
  shortDescription: string | null;
  content: string | null;
  coverImage: string | null;
  coverImageAlt: string | null;
  completedAt: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  gallery: GalleryItem[];
  productIds: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  noIndex: boolean;
};

export function ProjectForm({ project, products }: { project?: ProjectFormData | null; products: { id: string; label: string; hint?: string }[] }) {
  const p = project;
  return (
    <AdminForm action={saveProject}>
      {p ? <input type="hidden" name="id" value={p.id} /> : null}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section title="Genel">
            <SlugFields nameField="title" nameLabel="Proje adı" defaultName={p?.title} defaultSlug={p?.slug} prefix="/projeler/" />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput name="location" label="Lokasyon" placeholder="ör. Zekeriyaköy, İstanbul" defaultValue={p?.location ?? ""} maxLength={120} />
              <TextInput name="projectType" label="Proje tipi" placeholder="ör. Villa, Otel lobisi" defaultValue={p?.projectType ?? ""} maxLength={120} />
            </div>
            <TextArea name="shortDescription" label="Kısa açıklama" rows={3} maxLength={500} defaultValue={p?.shortDescription ?? ""} />
            <RichTextEditor name="content" label="Proje içeriği" defaultValue={p?.content} />
          </Section>
          <Section title="Görseller">
            <ImagePicker name="coverImage" label="Kapak görseli" defaultValue={p?.coverImage} altName="coverImageAlt" altDefault={p?.coverImageAlt} nameHint={p?.title ?? "proje"} />
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-800">Galeri</p>
              <GalleryEditor name="gallery" defaultValue={p?.gallery ?? []} nameHint={p?.title ?? "proje"} />
            </div>
          </Section>
          <Section title="Kullanılan ürünler" description="Proje sayfasında listelenir; ürün sayfasında da bu proje gösterilir (iç linkleme).">
            <MultiPicker name="productIds" label="Ürünler" options={products} defaultValue={p?.productIds ?? []} />
          </Section>
          <SeoFields defaults={p ?? {}} fallbackTitle={p?.title ?? ""} fallbackDescription={p?.shortDescription ?? undefined} urlPath={`/projeler/${p?.slug ?? ""}`} fallbackImage={p?.coverImage} />
        </div>
        <div className="space-y-6">
          <Section title="Yayın">
            <Checkbox name="active" label="Aktif (sitede görünür)" defaultChecked={p?.active ?? true} />
            <Checkbox name="featured" label="Öne çıkan proje" hint="Ana sayfadaki projeler bölümünde gösterilir." defaultChecked={p?.featured} />
            <TextInput name="completedAt" label="Tamamlanma tarihi" type="date" defaultValue={p?.completedAt ?? ""} />
            <TextInput name="sortOrder" label="Sıra" type="number" min={0} defaultValue={String(p?.sortOrder ?? 0)} />
          </Section>
        </div>
      </div>
      <SaveBar />
    </AdminForm>
  );
}
