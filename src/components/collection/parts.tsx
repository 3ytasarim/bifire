import { Phone } from "lucide-react";
import { DesignTogether } from "@/components/site/DesignTogether";
import { WhatsappIcon } from "@/components/site/Icons";
import { ProductGallery } from "@/components/site/ProductGallery";
import type { GalleryImage } from "@/components/site/Lightbox";
import type { WoodFamily } from "@/lib/collection";
import type { ProductDetail } from "@/lib/queries";
import { telHref, whatsappHref, type SiteSettings } from "@/lib/settings";

/** Kart ve hero'daki kısa değer etiketleri. */
const SHORT: Record<string, string> = { "Isıtma verimliliği": "Verim", "Baca çapı": "Baca" };
export const shortLabel = (label: string) => SHORT[label] ?? label;

type FormOptions = { categories: { id: string; name: string }[]; products: { id: string; name: string; categoryId: string }[] };

/**
 * Aile ve model sayfalarının sol sütunu: `part="gallery"` ürün görselleri (mevcut galeri); `part="extras"` yerleşim
 * yaklaşımı ve "Birlikte tasarlayalım". Mobilde sıra: galeri → başlık/seçimler → ekler (sayfa ızgarası belirler).
 */
export function CollectionAside({ part, product, family, gallery, form, path }: { part: "gallery" | "extras"; product: ProductDetail; family: WoodFamily | null; gallery: GalleryImage[]; form: FormOptions; path: string }) {
  if (part === "gallery") return <ProductGallery images={gallery} name={product.name} />;
  return (
    <>
      {family && (family.view || family.place || family.focus) ? (
        <dl className="mt-5 grid gap-3 rounded-[1.5rem] border border-linen bg-white p-5 sm:grid-cols-3 sm:p-6">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase sm:col-span-3">Yerleşim yaklaşımı</p>
          {[
            ["Ateş görünümü", family.view],
            ["Yerleşim", family.place],
            ["Seçimde odak", family.focus],
          ]
            .filter(([, v]) => v)
            .map(([k, v]) => (
            <div key={k} className="border-t border-sand pt-3">
              <dt className="text-[11px] font-semibold tracking-[0.14em] text-stone uppercase">{k}</dt>
              <dd className="mt-1 text-[14px] leading-snug font-semibold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <DesignTogether
        productName={product.name}
        categories={form.categories}
        products={form.products}
        defaultCategoryId={product.categoryId}
        defaultProductId={product.id}
        sourcePath={path}
        initial={{ fuel: "wood" }}
      />
    </>
  );
}

/** WhatsApp + telefon düğmeleri (ayarlarda tanımlıysa). */
export function ContactButtons({ settings, message }: { settings: SiteSettings; message: string }) {
  const wa = whatsappHref(settings, message);
  if (!wa && !settings.phone) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {wa ? (
        <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-sand bg-white px-6 text-sm font-semibold text-ink transition-colors hover:border-[#1f7a4a] hover:text-[#1f7a4a]">
          <WhatsappIcon className="h-4 w-4" /> WhatsApp
        </a>
      ) : null}
      {settings.phone ? (
        <a href={telHref(settings.phone)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-sand bg-white px-6 text-sm font-semibold text-ink transition-colors hover:border-ink">
          <Phone aria-hidden="true" className="h-4 w-4" /> Hemen ara
        </a>
      ) : null}
    </div>
  );
}

/** Ürünün galeri listesi: kapak + ek görseller (yeni görsel eklenmez, mevcutlar kullanılır). */
export function galleryOf(product: ProductDetail): GalleryImage[] {
  const baseAlt = product.coverImageAlt || product.name;
  return [
    ...(product.coverImage ? [{ url: product.coverImage, alt: baseAlt, width: null, height: null }] : []),
    ...product.images.filter((i) => i.url !== product.coverImage).map((i, n) => ({ url: i.url, alt: i.alt || `${product.name} — görsel ${n + 2}`, width: i.width, height: i.height })),
  ];
}
