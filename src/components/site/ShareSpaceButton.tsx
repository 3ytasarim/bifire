import { ArrowUpRight, ImageUp } from "lucide-react";

/**
 * Ürün fotoğrafı altındaki "Mekân fotoğrafınızı paylaşın" düğmesi. Site genelindeki başvuru penceresini
 * (DesignRequest) doğrudan fotoğraf adımıyla açar; talep bu ürünle ilişkilendirilir.
 */
export function ShareSpaceButton({ productName, productSlug }: { productName: string; productSlug: string }) {
  return (
    <button
      type="button"
      data-design-open=""
      data-design-product={productName}
      data-design-product-slug={productSlug}
      aria-haspopup="dialog"
      className="group relative mt-4 flex w-full items-center gap-4 overflow-hidden rounded-[1.4rem] border border-ember/30 bg-gradient-to-r from-ember/[0.08] via-white to-white p-4 text-left transition-[border-color,box-shadow] duration-500 hover:border-ember hover:shadow-[0_20px_40px_-26px_rgb(224_105_31/0.6)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember sm:p-5"
    >
      <span aria-hidden="true" className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ember text-ink transition-transform duration-500 group-hover:-rotate-6">
        <span className="absolute inset-0 rounded-full bg-ember/50 motion-safe:animate-ping [animation-duration:2.4s]" />
        <ImageUp className="relative h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg leading-tight font-semibold text-ink">Mekân fotoğrafınızı paylaşın</span>
        <span className="mt-0.5 block text-[13px] leading-relaxed text-steel">Fotoğrafınızla başlayın; bu ürünün mekânınızdaki yerleşimini birlikte tasarlayalım.</span>
      </span>
      <ArrowUpRight aria-hidden="true" className="h-5 w-5 shrink-0 text-ember-ink transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </button>
  );
}
