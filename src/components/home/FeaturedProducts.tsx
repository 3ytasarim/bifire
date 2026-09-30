import { HOME } from "@/content/home";
import type { ProductCardData } from "@/lib/queries";
import { ProductCard } from "@/components/site/Cards";
import { SectionHeading } from "@/components/site/SectionHeading";

/** Admin'de "öne çıkan" işaretli ürünler. Mobilde yatay kaydırmalı (scroll-snap, JS yok), masaüstünde grid. */
export function FeaturedProducts({ products }: { products: ProductCardData[] }) {
  if (!products.length) return null;
  const f = HOME.featured;
  return (
    <section aria-labelledby="home-featured" className="bg-paper py-20 sm:py-28 lg:py-36">
      <div className="shell">
        <SectionHeading id="home-featured" eyebrow={f.eyebrow} title={f.title} intro={f.intro} action={{ label: "Tüm modeller", href: "/urunler" }} />
      </div>
      <ul className="shell mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] sm:mt-20 md:grid md:snap-none md:grid-cols-2 md:overflow-visible lg:grid-cols-4 lg:gap-6">
        {products.map((p) => (
          <li key={p.id} className="reveal w-[78%] shrink-0 snap-start sm:w-[46%] md:w-auto">
            <ProductCard product={p} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 80vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}
