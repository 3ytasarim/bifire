import type { Metadata } from "next";
import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { FaqList } from "@/components/site/FaqList";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { RequestForm } from "@/components/site/RequestForm";
import { SHOWROOM } from "@/content/company";
import { routes } from "@/lib/catalog";
import { getFormOptions } from "@/lib/queries";
import { getSiteSettings, showroomImageOf, telHref } from "@/lib/settings";
import { breadcrumbNode, faqNode, graph, webPageNode } from "@/lib/seo/json-ld";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { STATIC_PAGES } from "@/lib/seo/static-pages";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("showroom");
}

const CRUMBS = [
  { name: "Ana Sayfa", path: "/" },
  { name: "Fabrika Showroom", path: routes.showroom },
];

export default async function ShowroomPage() {
  const [s, [categories, products]] = await Promise.all([getSiteSettings(), getFormOptions()]);
  const img = showroomImageOf(s);
  const faqs = SHOWROOM.faqs.map((f) => ({ q: f.q, a: f.a }));

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path: routes.showroom, name: "Tuzla Fabrika Showroom", description: STATIC_PAGES.showroom.defaults.description, hasBreadcrumb: true }),
          breadcrumbNode(routes.showroom, CRUMBS),
          faqNode(routes.showroom, faqs),
        )}
      />
      <PageHero crumbs={CRUMBS} eyebrow={SHOWROOM.eyebrow} title={SHOWROOM.title} intro={SHOWROOM.intro} image={img.url} imageAlt={img.alt} />

      <section aria-labelledby="ziyaret" className="bg-white py-16 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="eyebrow text-ember-ink">Ziyaretinizi planlayın</p>
            <h2 id="ziyaret" className="display-3 mt-5">
              Gelmeden önce, beklentinizi paylaşın.
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-steel">
              Özellikle görmek istediğiniz model, kapak mekanizması veya malzemeyi ekibimizle önceden teyit edin. Ziyaret günü ve saatini birlikte netleştirelim.
            </p>

            {s.address || s.workingHours || s.phone || s.mapsUrl ? (
              <dl className="mt-10 space-y-5 border-t border-linen pt-8">
                {s.address ? (
                  <div className="flex gap-4">
                    <MapPin aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-ember" />
                    <div>
                      <dt className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">Adres</dt>
                      <dd className="mt-1 text-[16px] text-ink">{s.address}</dd>
                    </div>
                  </div>
                ) : null}
                {s.workingHours ? (
                  <div className="flex gap-4">
                    <Clock aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-ember" />
                    <div>
                      <dt className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">Ziyaret saatleri</dt>
                      <dd className="mt-1 text-[16px] text-ink">{s.workingHours}</dd>
                    </div>
                  </div>
                ) : null}
                {s.phone ? (
                  <div className="flex gap-4">
                    <Phone aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-ember" />
                    <div>
                      <dt className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">Telefon</dt>
                      <dd className="mt-1 text-[16px]">
                        <a href={telHref(s.phone)} className="font-semibold text-ink underline-offset-4 hover:underline">
                          {s.phone}
                        </a>
                      </dd>
                    </div>
                  </div>
                ) : null}
                {s.mapsUrl ? (
                  <div className="flex gap-4">
                    <Navigation aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-ember" />
                    <div>
                      <dt className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">Yol tarifi</dt>
                      <dd className="mt-1 text-[16px]">
                        <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline-offset-4 hover:underline">
                          Google Haritalar&apos;da aç
                        </a>
                      </dd>
                    </div>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </div>

          <ol className="grid gap-4 self-start lg:col-span-7">
            {SHOWROOM.steps.map((st, i) => (
              <li key={st.title} className="flex gap-5 rounded-2xl border border-linen bg-paper p-6 sm:p-7">
                <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ember/10 font-display text-sm font-semibold text-ember-ink tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink">{st.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-steel">{st.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {s.mapsEmbedUrl?.startsWith("https://www.google.com/maps/embed") ? (
        <section aria-label="Showroom konumu" className="bg-white pb-16 sm:pb-24">
          <div className="shell">
            <iframe
              src={s.mapsEmbedUrl}
              title="Bifire Tuzla fabrika showroom konumu"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="aspect-[16/7] min-h-72 w-full rounded-[1.75rem] border border-linen"
            />
          </div>
        </section>
      ) : null}

      <section id="randevu" aria-labelledby="randevu-baslik" className="scroll-mt-28 border-t border-sand bg-bone py-16 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-ember-ink">Showroom randevusu</p>
            <h2 id="randevu-baslik" className="display-2 mt-5">
              Kararınızı yerinde somutlaştıralım.
            </h2>
            <p className="lead mt-6 text-steel">Planınızı ve beğendiğiniz örnekleri getirin. Cam yönü, kaplama ve kullanım ayrıntılarını birlikte görüşelim.</p>
          </div>
          <div className="lg:col-span-7">
            <RequestForm type="SHOWROOM" categories={categories} products={products} sourcePath={routes.showroom} submitLabel="Ziyaret talebimi gönder" showroomToggle district />
          </div>
        </div>
      </section>

      <section aria-labelledby="showroom-sss" className="bg-paper py-16 sm:py-24">
        <div className="shell grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow text-ember-ink">Sık sorulanlar</p>
            <h2 id="showroom-sss" className="display-3 mt-5">
              Showroom ziyareti hakkında.
            </h2>
          </div>
          <FaqList items={faqs} className="lg:col-span-8" />
        </div>
      </section>
    </>
  );
}
