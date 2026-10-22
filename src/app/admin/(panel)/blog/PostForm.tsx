"use client";

import { AdminForm, SaveBar } from "@/components/admin/AdminForm";
import { Checkbox, Section, SelectInput, TextArea, TextInput } from "@/components/admin/fields";
import { GUIDE_CATEGORIES } from "@/content/guide";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { MultiPicker } from "@/components/admin/MultiPicker";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SeoFields } from "@/components/admin/SeoFields";
import { SlugFields } from "@/components/admin/SlugFields";
import { savePost } from "./actions";

export type PostFormData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
  coverImageAlt: string | null;
  author: string | null;
  published: boolean;
  featured: boolean;
  publishedAt: string;
  tags: string;
  category: string | null;
  productIds: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  noIndex: boolean;
};

export function PostForm({ post, products, knownTags }: { post?: PostFormData | null; products: { id: string; label: string; hint?: string }[]; knownTags: string[] }) {
  const p = post;
  return (
    <AdminForm action={savePost}>
      {p ? <input type="hidden" name="id" value={p.id} /> : null}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section title="Yazı">
            <SlugFields nameField="title" nameLabel="Başlık" defaultName={p?.title} defaultSlug={p?.slug} prefix="/somine-rehberi/" />
            <TextArea name="excerpt" label="Özet" rows={3} maxLength={500} defaultValue={p?.excerpt ?? ""} hint="Blog kartlarında ve yazı başında gösterilir; meta açıklama boşsa buradan üretilir." />
            <RichTextEditor name="content" label="İçerik" defaultValue={p?.content} placeholder="Yazınızı buraya yazın. Ara başlıklar için H2/H3 kullanın." />
          </Section>
          <Section title="İlgili ürünler" description="Yazının altında “Yazıda bahsi geçen ürünler” olarak gösterilir (iç linkleme).">
            <MultiPicker name="productIds" label="Ürünler" options={products} defaultValue={p?.productIds ?? []} />
          </Section>
          <SeoFields defaults={p ?? {}} fallbackTitle={p?.title ?? ""} fallbackDescription={p?.excerpt ?? undefined} urlPath={`/somine-rehberi/${p?.slug ?? ""}`} />
        </div>
        <div className="space-y-6">
          <Section title="Yayın">
            <Checkbox name="published" label="Yayında" hint="İşaretli değilse taslak olarak kalır (sitede görünmez)." defaultChecked={p?.published} />
            <Checkbox name="featured" label="Öne çıkan yazı" hint="Ana sayfada önce gösterilir." defaultChecked={p?.featured} />
            <TextInput name="publishedAt" label="Yayın tarihi" type="datetime-local" defaultValue={p?.publishedAt ?? ""} hint="Boşsa yayınlandığı an. İleri bir tarih seçilirse yazı o zaman görünür." />
            <TextInput name="author" label="Yazar" defaultValue={p?.author ?? ""} maxLength={120} hint="Boşsa sizin adınız yazılır." />
          </Section>
          <Section title="Kapak görseli">
            <ImagePicker name="coverImage" label="Kapak" defaultValue={p?.coverImage} altName="coverImageAlt" altDefault={p?.coverImageAlt} nameHint={p?.title ?? "blog"} aspect="aspect-[3/2]" />
          </Section>
          <Section title="Rehber kategorisi">
            <SelectInput name="category" label="Kategori" placeholder="— Kategorisiz —" defaultValue={p?.category ?? ""} options={GUIDE_CATEGORIES.map((c) => ({ value: c.slug, label: c.name }))} hint="Şömine Rehberi ana sayfasında ve kategori sayfasında bu başlık altında listelenir." />
          </Section>
          <Section title="Etiketler">
            <TextInput name="tags" label="Etiketler" defaultValue={p?.tags ?? ""} list="blog-tags" hint="Virgülle ayırın." maxLength={1000} />
            <datalist id="blog-tags">
              {knownTags.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </Section>
        </div>
      </div>
      <SaveBar />
    </AdminForm>
  );
}
