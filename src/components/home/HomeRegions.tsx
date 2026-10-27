import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Motion";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { PRIORITY_DISTRICTS } from "@/content/regions";
import { PROVINCE_NAMES } from "@/content/service-areas/names";
import { routes } from "@/lib/catalog";
import { RegionsMap } from "./RegionsMap";
import { StudioEyebrow } from "./studio";

/**
 * Ana sayfa yerel SEO bölümü: Tuzla merkezli animasyonlu rota haritası (tüm hizmet illeri) + öncelikli İstanbul ilçeleri.
 * Tüm bağlantılar gerçek <a> (il ve ilçe sayfaları), harita yalnızca görsel katmandır.
 */
export function HomeRegions() {
  const districtCount = PROVINCE_NAMES.reduce((n, p) => n + p.districts.length, 0);
  return (
    <section aria-labelledby="home-regions" className="section-pad relative overflow-hidden bg-bone">
      <div className="shell grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <Reveal>
            <StudioEyebrow no="05">Hizmet bölgeleri</StudioEyebrow>
            <h2 id="home-regions" className="studio-h2 mt-5 text-balance text-ink">
              Tuzla&apos;dan projenize, Marmara&apos;dan Ege&apos;ye, Akdeniz&apos;e.
            </h2>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-steel">
              Önceliğimiz Tuzla ve çevresi, Anadolu Yakası ve Sarıyer. Marmara’daki 10 il, Ankara, İzmir, Muğla, Aydın, Antalya, Bolu ve Düzce’deki projeleri de kapsam ve takvim uygunluğuyla birlikte değerlendiriyoruz.
            </p>
          </Reveal>
          <Stagger as="ul" className="mt-8 flex flex-wrap gap-2" gap={0.06}>
            {PRIORITY_DISTRICTS.map((d) => (
              <StaggerItem key={d.slug}>
                <Link
                  href={routes.region("istanbul", d.slug)}
                  title={d.hint}
                  className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-linen bg-paper px-4 text-[14px] font-semibold text-ink transition-[border-color,background-color] duration-300 hover:border-ember/50 hover:bg-white"
                >
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ember transition-transform duration-300 group-hover:scale-150" />
                  {d.name}
                  <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-ember-ink opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-8" delay={0.2}>
            <ArrowFillButton href={routes.regions} tone="ink">
              {`${PROVINCE_NAMES.length} il · ${districtCount} ilçe`}
            </ArrowFillButton>
          </Reveal>
        </div>
        <Reveal className="lg:col-span-7" delay={0.1} y={24}>
          <RegionsMap provinces={PROVINCE_NAMES.map((p) => ({ name: p.name, slug: p.slug, count: p.districts.length }))} />
        </Reveal>
      </div>
    </section>
  );
}
