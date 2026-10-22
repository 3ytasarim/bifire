import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { PRIORITY_DISTRICTS } from "@/content/regions";
import { PROVINCE_NAMES } from "@/content/service-areas/names";
import { routes } from "@/lib/catalog";

/** Ana sayfa yerel SEO bölümü: Tuzla merkezli öncelikli İstanbul ilçeleri + tüm hizmet bölgeleri (11 il) bağlantısı. */
export function HomeRegions() {
  const districtCount = PROVINCE_NAMES.reduce((n, p) => n + p.districts.length, 0);
  return (
    <section aria-labelledby="home-regions" className="bg-white py-20 sm:py-28">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="eyebrow reveal text-ember-ink">Hizmet bölgeleri</p>
          <h2 id="home-regions" className="display-2 reveal mt-5 text-balance text-ink">
            Tuzla&apos;dan projenize, Marmara&apos;dan Ankara&apos;ya.
          </h2>
          <p className="reveal mt-6 max-w-md text-[17px] leading-relaxed text-steel">
            Önceliğimiz Tuzla ve çevresi, Anadolu Yakası ve Sarıyer. Marmara’daki 10 il ve Ankara’daki projeleri de kapsam ve takvim uygunluğuyla birlikte değerlendiriyoruz.
          </p>
          <div className="reveal mt-10">
            <ArrowFillButton href={routes.regions} tone="ink">
              {`${PROVINCE_NAMES.length} il · ${districtCount} ilçe`}
            </ArrowFillButton>
          </div>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
          {PRIORITY_DISTRICTS.map((d) => (
            <li key={d.slug} className="reveal">
              <Link href={routes.region("istanbul", d.slug)} className="group flex h-full items-start justify-between gap-4 rounded-2xl border border-linen bg-paper p-6 transition-colors hover:border-ember/50">
                <span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] text-stone uppercase">
                    <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-ember" />
                    {d.side}
                  </span>
                  <span className="mt-3 block font-display text-2xl font-semibold text-ink">{d.name}</span>
                  <span className="mt-1 block text-[14px] leading-relaxed text-steel">{d.hint}</span>
                </span>
                <ArrowUpRight aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-ember-ink transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
