import type { Metadata } from "next";
import Image from "next/image";
import { FinalCta } from "@/components/site/FinalCta";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { HOME } from "@/content/home";
import { routes } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/settings";
import { breadcrumbNode, graph, ids, webPageNode } from "@/lib/seo/json-ld";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { STATIC_PAGES } from "@/lib/seo/static-pages";

export const revalidate = 3600;

export function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("kurumsal");
}

const CRUMBS = [
  { name: "Ana Sayfa", path: "/" },
  { name: "Kurumsal", path: routes.about },
];

const PROCESS = [
  { title: "Keşif", text: "Mekânı yerinde görür; ölçü, baca imkânı, havalandırma ve yerleşimi birlikte değerlendiririz." },
  { title: "Ürün seçimi", text: "Isıtma ihtiyacı, yakıt tercihi ve mimari dile göre uygun hazne ve modelleri öneririz." },
  { title: "Projelendirme", text: "Cam tipi, giydirme malzemesi ve detay çözümleri iç mimari ile uyumlu biçimde netleştirilir." },
  { title: "Uygulama", text: "Montaj, baca bağlantısı ve devreye alma adımları planlanan takvimde tamamlanır." },
  { title: "Destek", text: "Kullanım, bakım ve servis konularında uygulama sonrasında da yanınızda oluruz." },
];

export default async function AboutPage() {
  const s = await getSiteSettings();
  const m = HOME.manifesto;
  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path: routes.about, name: "Kurumsal", description: STATIC_PAGES.kurumsal.defaults.description, type: "AboutPage", hasBreadcrumb: true, mainEntityId: ids.organization() }),
          breadcrumbNode(routes.about, CRUMBS),
        )}
      />
      <PageHero
        crumbs={CRUMBS}
        eyebrow="Kurumsal"
        title="Ateşi mimariyle buluşturuyoruz."
        intro="Bifire; mekânı anlayan, doğru ürünü seçen ve uygulamayı tek elden yürüten bir şömine markasıdır."
        image={s.aboutImage}
        imageAlt={s.aboutImageAlt}
      />

      <section aria-labelledby="yaklasim" className="bg-paper py-20 sm:py-28">
        <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <p className="eyebrow text-ember-ink">Yaklaşımımız</p>
            <h2 id="yaklasim" className="display-2 mt-5">
              {m.title}
            </h2>
          </div>
          <div className="space-y-6 text-[17px] leading-relaxed text-steel lg:col-span-7">
            {m.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <dl className="grid gap-8 border-t border-sand pt-10 sm:grid-cols-3">
              {m.pillars.map((p) => (
                <div key={p.title}>
                  <dt className="font-display text-lg font-semibold text-ink">{p.title}</dt>
                  <dd className="mt-2 text-[15px]">{p.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {s.featureImage ? (
        <div className="relative aspect-[21/9] min-h-72 bg-smoke">
          <Image src={s.featureImage} alt={s.featureImageAlt || ""} fill sizes="100vw" className="object-cover" />
        </div>
      ) : null}

      <section aria-labelledby="surec" className="bg-anthracite py-20 text-white sm:py-28">
        <div className="shell">
          <p className="eyebrow text-amber">Süreç</p>
          <h2 id="surec" className="display-2 mt-5 max-w-3xl">
            Keşiften ilk ateşe kadar tek elden.
          </h2>
          <ol className="mt-14 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
            {PROCESS.map((step, i) => (
              <li key={step.title} className="bg-anthracite p-8">
                <span className="font-display text-sm font-semibold text-ember tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-white/65">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
