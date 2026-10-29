import { HOME } from "@/content/home";
import { CategoryCard } from "@/components/site/Cards";
import { SectionHeading } from "@/components/site/SectionHeading";

type Category = { id: string; name: string; slug: string; href: string; image: string | null; imageAlt: string | null; description: string | null; _count: { products: number } };

/**
 * Ürün grupları — asimetrik mimari grid: ilk iki kategori büyük, diğerleri üçlü sıra.
 * Mobilde tek sütun, her kart kendi oranında.
 */
export function CategoryShowcase({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;
  const [first, second, ...rest] = categories;
  const c = HOME.categories;
  const toCard = (x: Category) => ({ ...x, count: x._count.products });

  return (
    <section aria-labelledby="home-categories" className="bg-white py-20 sm:py-28 lg:py-36">
      <div className="shell">
        <SectionHeading id="home-categories" eyebrow={c.eyebrow} title={c.title} intro={c.intro} action={{ label: "Tüm ürünler", href: "/somine-modelleri" }} />
        <div className="mt-14 grid gap-4 sm:mt-20 sm:gap-5 lg:grid-cols-12">
          {first ? (
            // Tek kategori varken tam genişlik (yarım boş satır kalmasın).
            <div className={`reveal ${second ? "lg:col-span-7" : "lg:col-span-12"}`}>
              <CategoryCard
                category={toCard(first)}
                aspect={second ? "aspect-[4/5] sm:aspect-[16/11]" : "aspect-[4/5] sm:aspect-[21/9]"}
                sizes={second ? "(min-width: 1024px) 58vw, 100vw" : "100vw"}
              />
            </div>
          ) : null}
          {second ? (
            <div className="reveal lg:col-span-5">
              <CategoryCard category={toCard(second)} aspect="aspect-[4/5] sm:aspect-[16/11] lg:aspect-auto lg:h-full" sizes="(min-width: 1024px) 42vw, 100vw" />
            </div>
          ) : null}
          {rest.length ? (
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:col-span-12 lg:grid-cols-3">
              {rest.map((cat) => (
                <div key={cat.id} className="reveal">
                  <CategoryCard category={toCard(cat)} aspect="aspect-[4/5] sm:aspect-[4/3]" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
