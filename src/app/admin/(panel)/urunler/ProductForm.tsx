"use client";

import { AdminForm, SaveBar } from "@/components/admin/AdminForm";
import { DocumentsEditor, type DocItem } from "@/components/admin/DocumentsEditor";
import { Checkbox, Section, SelectInput, TextArea, TextInput } from "@/components/admin/fields";
import { GalleryEditor, type GalleryItem } from "@/components/admin/GalleryEditor";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { RowsEditor } from "@/components/admin/RowsEditor";
import { SeoFields } from "@/components/admin/SeoFields";
import { SlugFields } from "@/components/admin/SlugFields";
import { FUEL_LABELS, VIEW_LABELS } from "@/lib/catalog";
import { saveProduct } from "./actions";

/** Sunucudan gelen ürün (Decimal alanlar string'e çevrilmiş halde). */
export type ProductFormData = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  modelCode: string | null;
  brand: string | null;
  shortDescription: string | null;
  description: string | null;
  coverImage: string | null;
  coverImageAlt: string | null;
  /** Ürünün site adresi (kategoriye göre: /urun/… veya /elektrikli-somineler/…/…). */
  path?: string;
  imageNote: string | null;
  conceptImage: string | null;
  conceptImageAlt: string | null;
  fuelType: string | null;
  viewType: string | null;
  powerKw: string;
  heatingArea: string | null;
  efficiency: string;
  widthMm: number | null;
  heightMm: number | null;
  depthMm: number | null;
  weightKg: string;
  flueDiameterMm: number | null;
  dimensionsNote: string | null;
  familyTitle: string | null;
  collectionTag: string | null;
  collectionLine: string | null;
  collectionDesc: string | null;
  viewText: string | null;
  placeText: string | null;
  focusText: string | null;
  detailIntro: string | null;
  specNote: string | null;
  detailNote: string | null;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  tags: string;
  gallery: GalleryItem[];
  drawings: GalleryItem[];
  specs: { group: string; label: string; value: string; unit: string; variant: string }[];
  features: { label: string; title: string; text: string; note: string }[];
  options: { group: string; value: string }[];
  faqs: { question: string; answer: string }[];
  documents: DocItem[];
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  noIndex: boolean;
};

const SPEC_SUGGESTIONS = {
  group: ["Performans", "Ölçüler", "Malzeme", "Cam", "Baca & hava", "Elektrik", "Sertifika"],
  label: ["Isıtma hacmi", "Hazne malzemesi", "Cam tipi", "Kapak tipi", "Harici hava girişi", "Yakıt tüketimi", "Tank kapasitesi", "Yanma süresi", "Elektrik bağlantısı", "Sertifika"],
  unit: ["kW", "m²", "m³", "mm", "kg", "%", "L", "saat", "V", "W"],
};

export function ProductForm({ product, categories }: { product?: ProductFormData | null; categories: { id: string; name: string; parentName: string | null }[] }) {
  const p = product;
  return (
    <AdminForm action={saveProduct}>
      {p ? <input type="hidden" name="id" value={p.id} /> : null}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section title="Genel">
            <SlugFields nameLabel="Ürün adı" defaultName={p?.name} defaultSlug={p?.slug} prefix={p?.path ? p.path.slice(0, p.path.lastIndexOf("/") + 1) : "/urun/"} />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput name="modelCode" label="Model kodu" defaultValue={p?.modelCode ?? ""} maxLength={80} />
              <TextInput name="brand" label="Marka" defaultValue={p?.brand ?? ""} maxLength={80} hint="Bifire ya da ithal marka adı. Boşsa şemada marka yazılmaz." />
            </div>
            <TextArea name="shortDescription" label="Kısa açıklama" rows={3} maxLength={500} defaultValue={p?.shortDescription ?? ""} hint="Ürün başlığının altında ve kartlarda görünür; meta açıklama boşsa buradan üretilir." />
            <RichTextEditor name="description" label="Detaylı açıklama" defaultValue={p?.description} />
          </Section>

          <Section
            title="Koleksiyon ve şablon metinleri"
            description="Koleksiyon ailesi ürünlerinde (ör. U Tipi Odunlu Şömine) aile sayfası, model sayfaları ve koleksiyon kartlarında kullanılan metinler. Boş bırakılan alan sayfada gösterilmez. Modeller, teknik tablodaki “Model kodu” satırlarından oluşur."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput name="familyTitle" label="Model adı (kısa ad)" defaultValue={p?.familyTitle ?? ""} maxLength={80} hint="Model sayfası başlığı: “U Tipi Şömine 70'lik”." />
              <TextInput name="collectionTag" label="Kart etiketi" defaultValue={p?.collectionTag ?? ""} maxLength={80} hint="ör. Üç cephede ateş" />
            </div>
            <TextInput name="collectionLine" label="Vurgu cümlesi" defaultValue={p?.collectionLine ?? ""} maxLength={160} hint="ör. Ateşi farklı açılardan yaşayın." />
            <TextArea name="collectionDesc" label="Koleksiyon tanıtımı" defaultValue={p?.collectionDesc ?? ""} maxLength={600} rows={3} hint="Koleksiyon kartında ve aile sayfasının başında görünür." />
            <p className="text-sm font-medium text-neutral-800">Yerleşim yaklaşımı</p>
            <div className="grid gap-5 sm:grid-cols-3">
              <TextInput name="viewText" label="Ateş görünümü" defaultValue={p?.viewText ?? ""} maxLength={160} />
              <TextInput name="placeText" label="Yerleşim" defaultValue={p?.placeText ?? ""} maxLength={160} />
              <TextInput name="focusText" label="Seçimde odak" defaultValue={p?.focusText ?? ""} maxLength={160} />
            </div>
            <TextArea name="detailIntro" label="Üretim detayları girişi" defaultValue={p?.detailIntro ?? ""} maxLength={400} rows={2} hint="“Tasarımın arkasındaki ayrıntılar” bölümünün açıklaması." />
            <TextArea name="specNote" label="Teknik tablo notu" defaultValue={p?.specNote ?? ""} maxLength={400} rows={2} />
            <TextArea name="detailNote" label="Üretim detayları notu" defaultValue={p?.detailNote ?? ""} maxLength={400} rows={2} />
          </Section>

          <Section title="Görseller">
            <ImagePicker name="coverImage" label="Kapak görseli" defaultValue={p?.coverImage} altName="coverImageAlt" altDefault={p?.coverImageAlt} aspect="aspect-[4/5] max-w-xs" nameHint={p?.name ?? "urun"} />
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-800">Galeri</p>
              <GalleryEditor name="gallery" defaultValue={p?.gallery ?? []} nameHint={p?.name ?? "urun"} />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-neutral-800">Ölçü çizimleri</p>
              <p className="mb-2 text-xs text-neutral-500">Ürün sayfasında “Ölçü çizimleri” bölümünde büyütülebilir olarak gösterilir. Seçenek alanı, çizimin hangi model için geçerli olduğunu belirler (teknik tablodaki “Seçenek” değeriyle aynı yazın).</p>
              <GalleryEditor name="drawings" defaultValue={p?.drawings ?? []} nameHint={`${p?.name ?? "urun"}-olcu`} withVariant emptyText="Ölçü çizimi yok." />
            </div>
            <TextArea name="imageNote" label="Görsel notu" defaultValue={p?.imageNote ?? ""} maxLength={300} rows={2} hint="Görsellerin hemen altında görünür (ör. “Yapay zekâyla oluşturulmuş temsili mekân tasarımıdır; gerçek ürün fotoğrafı değildir.”)." />
            <ImagePicker name="conceptImage" label="Temsili tasarım görseli (galeri dışı)" defaultValue={p?.conceptImage} altName="conceptImageAlt" altDefault={p?.conceptImageAlt} aspect="aspect-[16/9] max-w-md" nameHint={`${p?.name ?? "urun"}-temsili`} hint="Gerçek ürün fotoğrafı olmayan modeller için: ana galeriye konmaz, sayfada “Temsili tasarım önerisi” bölümünde görsel notuyla gösterilir." />
          </Section>

          <Section title="Temel teknik bilgiler" description="Kartlarda ve ürün sayfasının üst kısmında gösterilir. Bilinmeyen alanları boş bırakın.">
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectInput name="fuelType" label="Yakıt türü" placeholder="—" defaultValue={p?.fuelType ?? ""} options={Object.entries(FUEL_LABELS).map(([value, label]) => ({ value, label }))} />
              <SelectInput name="viewType" label="Cam / görünüm tipi" placeholder="—" defaultValue={p?.viewType ?? ""} options={Object.entries(VIEW_LABELS).map(([value, label]) => ({ value, label }))} />
              <TextInput name="powerKw" label="Nominal güç (kW)" inputMode="decimal" defaultValue={p?.powerKw ?? ""} />
              <TextInput name="heatingArea" label="Isıtma alanı" placeholder="ör. 80–120 m²" defaultValue={p?.heatingArea ?? ""} maxLength={60} />
              <TextInput name="efficiency" label="Verim (%)" inputMode="decimal" defaultValue={p?.efficiency ?? ""} />
              <TextInput name="flueDiameterMm" label="Baca çapı (mm)" inputMode="numeric" defaultValue={p?.flueDiameterMm?.toString() ?? ""} />
              <TextInput name="widthMm" label="Genişlik (mm)" inputMode="numeric" defaultValue={p?.widthMm?.toString() ?? ""} />
              <TextInput name="heightMm" label="Yükseklik (mm)" inputMode="numeric" defaultValue={p?.heightMm?.toString() ?? ""} />
              <TextInput name="depthMm" label="Derinlik (mm)" inputMode="numeric" defaultValue={p?.depthMm?.toString() ?? ""} />
              <TextInput name="weightKg" label="Ağırlık (kg)" inputMode="decimal" defaultValue={p?.weightKg ?? ""} />
            </div>
            <TextInput name="dimensionsNote" label="Ölçü notu" placeholder="ör. Cam ölçüsü 90 × 45 cm" defaultValue={p?.dimensionsNote ?? ""} maxLength={250} />
          </Section>

          <Section
            title="Ek teknik özellikler"
            description="Şömine türüne özel değerler. Grup adı tabloyu bölümlere ayırır. Değer ölçüye göre değişiyorsa “Seçenek” alanına ilgili seçenek değerini yazın (ör. 70'lik) ve her ölçü için ayrı satır ekleyin. Değer birden fazla seçime bağlıysa (ör. Seri + Ölçü) değerleri seçenek grubu sırasıyla “ / ” ile birleştirin: “Seri 01 / 70'lik”: ürün sayfasında seçilen ölçünün değerleri gösterilir ve “Tüm ölçüleri karşılaştır” tablosu oluşur. Seçenek boşsa satır tüm ölçüler için geçerlidir."
          >
            <RowsEditor
              name="specs"
              addLabel="Özellik satırı ekle"
              defaultValue={p?.specs ?? []}
              suggestions={SPEC_SUGGESTIONS}
              columns={[
                { key: "group", label: "Grup", width: "w-full sm:w-36" },
                { key: "label", label: "Özellik" },
                { key: "value", label: "Değer" },
                { key: "unit", label: "Birim", width: "w-24" },
                { key: "variant", label: "Seçenek (ops.)", width: "w-full sm:w-32", maxLength: 80 },
              ]}
            />
          </Section>

          <Section
            title="Seçenekler"
            description="Müşterinin ürün sayfasında seçebileceği seçenekler. Aynı grup adı tek bir seçim satırı oluşturur (ör. Grup “Ölçü” → “70’lik”, “80’lik”; Grup “Cam yönü” → “Sağ açık”, “Sol açık”). Seçim teklif formuna otomatik aktarılır."
          >
            <RowsEditor
              name="options"
              addLabel="Seçenek ekle"
              defaultValue={p?.options ?? []}
              suggestions={{ group: ["Ölçü", "Cam yönü", "Kapak tipi", "Yakıt"] }}
              columns={[
                { key: "group", label: "Grup", width: "w-full sm:w-40", maxLength: 60 },
                { key: "value", label: "Seçenek", maxLength: 80 },
              ]}
            />
          </Section>

          <Section
            title="Öne çıkan özellikler ve teknik detaylar"
            description="Yalnızca “Açıklama” doluysa kısa madde olarak listelenir. “Başlık” da doluysa numaralı teknik detay kartı olur: Etiket (ör. “Yanma havası”), Başlık (ör. “Ateşi kontrollü yönetin”), Açıklama ve Alt not (ör. “Klepe sürgüsü · Ayarlanabilir alt hava girişi”)."
          >
            <RowsEditor
              name="features"
              addLabel="Özellik / detay ekle"
              defaultValue={p?.features ?? []}
              columns={[
                { key: "label", label: "Etiket (ops.)", width: "w-full sm:w-40", maxLength: 60 },
                { key: "title", label: "Başlık (ops.)", maxLength: 120 },
                { key: "note", label: "Alt not (ops.)", maxLength: 160 },
                { key: "text", label: "Açıklama", multiline: true, maxLength: 700 },
              ]}
            />
          </Section>

          <Section title="Sık sorulan sorular" description="Ürün sayfasının altında akordeon olarak gösterilir ve Google için FAQ şeması üretilir. Kısa, net ve doğrulanabilir cevaplar yazın.">
            <RowsEditor
              name="faqs"
              addLabel="Soru ekle"
              defaultValue={p?.faqs ?? []}
              columns={[
                { key: "question", label: "Soru", maxLength: 200 },
                { key: "answer", label: "Cevap", multiline: true, maxLength: 1200 },
              ]}
            />
          </Section>

          <Section title="Dokümanlar" description="Katalog, teknik çizim veya montaj kılavuzu (PDF, en fazla 20 MB).">
            <DocumentsEditor name="documents" defaultValue={p?.documents ?? []} />
          </Section>

          <SeoFields defaults={p ?? {}} fallbackTitle={p?.name ?? ""} fallbackDescription={p?.shortDescription ?? undefined} urlPath={p?.path ?? `/urun/${p?.slug ?? ""}`} fallbackImage={p?.coverImage} />
        </div>

        <div className="space-y-6">
          <Section title="Yayın">
            <SelectInput
              name="categoryId"
              label="Kategori"
              required
              placeholder="Seçiniz"
              defaultValue={p?.categoryId ?? ""}
              options={categories.map((c) => ({ value: c.id, label: c.parentName ? `${c.parentName} › ${c.name}` : c.name }))}
            />
            <Checkbox name="active" label="Aktif (sitede görünür)" defaultChecked={p?.active ?? true} />
            <Checkbox name="featured" label="Öne çıkan ürün" hint="Ana sayfadaki “Seçilmiş modeller” bölümünde gösterilir." defaultChecked={p?.featured} />
            <TextInput name="sortOrder" label="Sıra" type="number" min={0} defaultValue={String(p?.sortOrder ?? 0)} />
          </Section>
          <Section title="Etiketler">
            <TextInput name="tags" label="Etiketler" defaultValue={p?.tags ?? ""} hint="Virgülle ayırın: Modern, L tipi, Asansörlü…" maxLength={1000} />
          </Section>
        </div>
      </div>
      <SaveBar />
    </AdminForm>
  );
}
