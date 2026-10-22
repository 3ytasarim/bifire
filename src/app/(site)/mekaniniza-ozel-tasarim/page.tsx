import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDown, ArrowRight, ImageUp } from "lucide-react";
import { ParallaxFrame, Reveal, Stagger, StaggerItem } from "@/components/motion/Motion";
import { BeforeAfter } from "@/components/site/BeforeAfter";
import { FaqList } from "@/components/site/FaqList";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { TrustPoints } from "@/components/site/TrustPoints";
import { Button3D } from "@/components/ui/button-3d";
import { DESIGN_FAQS, DESIGN_STEPS } from "@/content/design-service";
import { routes } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/settings";
import { breadcrumbNode, faqNode, graph, serviceNode, webPageNode } from "@/lib/seo/json-ld";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { STATIC_PAGES } from "@/lib/seo/static-pages";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("mekan-tasarim");
}

const PATH = routes.design;
const CRUMBS = [
  { name: "Ana Sayfa", path: "/" },
  { name: "Mekânınıza Özel Tasarım", path: PATH },
];

/** Pencereyi açan düğme (DesignRequest, `data-design-open` tıklamalarını dinler). JS yoksa #paylas bağlantısı gibi davranır. */
function ShareButton({ label = "Mekân fotoğrafımı paylaş", tone = "ember" }: { label?: string; tone?: "ember" | "ink" | "light" }) {
  return (
    <Button3D type="button" tone={tone} size="lg" data-design-open="">
      <ImageUp aria-hidden="true" className="h-4 w-4" /> {label}
    </Button3D>
  );
}

/**
 * Mekânınıza özel tasarım: müşteri mekân fotoğrafını ve tercihlerini paylaşır, görsel yerleşim önerisini Bifire
 * ekibi hazırlar. Örnek (önce/sonra) ve malzeme görselleri Admin > Ayarlar'dan seçilir; yoksa o bölüm gizlenir.
 */
export default async function DesignPage() {
  const s = await getSiteSettings();
  const before = s.designBeforeImage ? { url: s.designBeforeImage, alt: "Şömine yerleşimi öncesi örnek mekân" } : null;
  const after = s.designAfterImage ? { url: s.designAfterImage, alt: "Örnek mekân için şömine yerleşim önerisi" } : null;
  const faqs = DESIGN_FAQS;
  const description = STATIC_PAGES["mekan-tasarim"].defaults.description;

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path: PATH, name: "Mekânınıza Özel Şömine Tasarımı", description, hasBreadcrumb: true }),
          breadcrumbNode(PATH, CRUMBS),
          serviceNode({ path: PATH, name: "Mekâna özel şömine tasarım önerisi", description, serviceType: "Şömine tasarımı ve yerleşim önerisi", areaServed: ["İstanbul"] }),
          faqNode(PATH, faqs),
        )}
      />

      <PageHero
        crumbs={CRUMBS}
        eyebrow="Bifire ile mekânınıza özel"
        title="Mekânınızın fotoğrafını paylaşın, şöminenizi birlikte tasarlayalım."
        intro="Mekânınız ve tercihleriniz doğrultusunda hazırlayacağımız görsel yerleşim önerisiyle şöminenizin evinizde oluşturacağı etkiyi değerlendirin."
        image={after?.url}
        imageAlt={after?.alt}
      >
        <div className="flex flex-wrap items-center gap-3">
          <ShareButton />
          <a href={before && after ? "#ornek" : "#surec"} className="inline-flex min-h-12 items-center gap-2 px-2 text-[14px] font-semibold text-ink underline-offset-4 hover:underline">
            {before && after ? "Örnek çalışmayı inceleyin" : "Nasıl ilerlediğimizi görün"} <ArrowDown aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
        <p className="mt-5 text-[14px] text-stone">Size özel bir fikir. Mekânınızla bütünleşen bir tasarım.</p>
      </PageHero>

      <section aria-label="Tasarım, üretim ve montaj" className="bg-paper pb-10">
        <div className="shell">
          <TrustPoints />
        </div>
      </section>

      <section aria-labelledby="adim-otesi" className="relative overflow-hidden bg-white py-16 sm:py-24">
        <span aria-hidden="true" className="pointer-events-none absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.12),transparent_65%)]" />
        <div className="shell relative grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow text-ember-ink">Mekânınızdan başlayan tasarım</p>
            <h2 id="adim-otesi" className="display-3 mt-5 text-balance">
              Şömineyi seçmenin bir adım ötesi.
            </h2>
          </Reveal>
          <Reveal className="space-y-5 text-[17px] leading-relaxed text-steel lg:col-span-7" delay={0.1}>
            <p>Bir şöminenin mekândaki etkisi; konumuyla, çevresindeki malzemelerle ve yaşam alanınızın düzeniyle birlikte ortaya çıkar.</p>
            <p>Fotoğrafınızı ve tercihlerinizi birlikte değerlendirerek size özel bir görsel öneri hazırlarız. Böylece showroom görüşmenize daha somut fikirlerle başlayabiliriz.</p>
            <p className="border-l-2 border-ember pl-4 text-[14px] text-stone">Görsel çalışma tasarım önerisidir. Kesin ölçüler ve uygulama detayları keşif ve teknik değerlendirmeyle netleştirilir.</p>
          </Reveal>
        </div>
      </section>

      {before && after ? (
        <section id="ornek" aria-labelledby="donusum" className="scroll-mt-28 bg-paper py-16 sm:py-24">
          <div className="shell">
            <Reveal className="max-w-2xl">
              <p className="eyebrow text-ember-ink">Bir mekânın dönüşümü</p>
              <h2 id="donusum" className="display-3 mt-5">
                Fikri, mekânın içinde görün.
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-steel">Çizgiyi hareket ettirerek örnek mekânı ve görsel yerleşim önerisini karşılaştırın.</p>
            </Reveal>
            <Reveal className="mt-10" delay={0.1}>
              <BeforeAfter before={before} after={after} beforeLabel="Örnek mekân" afterLabel="Tasarım önerisi" />
              <p className="mt-3 text-[13px] text-stone">Temsili görsellerdir; gerçek müşteri projesi veya uygulanmış Bifire ürünü değildir.</p>
            </Reveal>
            <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:items-end">
              <Reveal className="lg:col-span-7">
                <p className="eyebrow text-ember-ink">Örnek tasarım yaklaşımı</p>
                <h3 className="mt-4 font-display text-3xl font-semibold text-balance text-ink">Doğal taşın sakinliği, ateşin sıcaklığı.</h3>
                <p className="mt-4 text-[16px] leading-relaxed text-steel">
                  Açık taş tonları, ince antrasit çerçeve ve iki yönden ateş görünümü bu örneğin tasarım dilini oluşturuyor. Gerçek projenizde ürün, kaplama ve yerleşim; ihtiyaçlarınız ve teknik koşullarla birlikte ele alınır.
                </p>
              </Reveal>
              <Reveal className="lg:col-span-5 lg:text-right" delay={0.1}>
                <ShareButton label="Benim mekânım için de değerlendirelim" tone="ink" />
              </Reveal>
            </div>
          </div>
        </section>
      ) : null}

      <section id="surec" aria-labelledby="surec-baslik" className="scroll-mt-28 bg-white py-16 sm:py-24">
        <div className="shell">
          <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="eyebrow text-ember-ink">Birlikte nasıl ilerleriz?</p>
              <h2 id="surec-baslik" className="display-3 mt-5">
                Fotoğraftan görüşmeye.
              </h2>
            </div>
            <p className="text-[16px] leading-relaxed text-steel lg:col-span-5">Fotoğrafı siz paylaşırsınız. Görsel öneriyi Bifire ekibi hazırlar.</p>
          </Reveal>
          <Stagger as="ol" className="mt-12 grid gap-4 md:grid-cols-3" gap={0.12}>
            {DESIGN_STEPS.map((st, i) => (
              <StaggerItem key={st.title} className="group relative overflow-hidden rounded-[1.5rem] border border-linen bg-paper p-7 transition-shadow duration-500 hover:shadow-[0_24px_48px_-28px_rgb(12_12_13/0.35)] sm:p-8">
                <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full border border-ember/30 bg-white font-display text-sm font-semibold text-ember-ink tabular-nums transition-colors duration-500 group-hover:bg-ember group-hover:text-ink">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-ember transition-transform duration-700 ease-(--ease-premium) group-hover:scale-x-100" />
                <h3 className="mt-5 font-display text-xl font-semibold text-ink">{st.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-steel">{st.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section aria-labelledby="ozel-olcu" className="bg-ink py-16 text-white sm:py-24">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <Reveal className={s.designMaterialImage ? "lg:col-span-6" : "lg:col-span-8"}>
            <p className="eyebrow text-ember">Özel ölçü tasarım</p>
            <h2 id="ozel-olcu" className="display-3 mt-5 text-balance text-white">
              Hazır bir kalıptan önce, sizin yaşam alanınız.
            </h2>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/70">Üretici bakışımızı mekânınızın karakteriyle bir araya getiriyoruz. Formu, dokuyu ve yerleşimi birlikte düşünerek başlayalım.</p>
            <div className="mt-8">
              <ShareButton label="Mekânımı paylaşmak istiyorum" />
            </div>
          </Reveal>
          {s.designMaterialImage ? (
            <ParallaxFrame className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] lg:col-span-6">
              <Image src={s.designMaterialImage} alt="Şömine kaplamasında kullanılabilecek doğal taş ve malzeme dokuları" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </ParallaxFrame>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="tasarim-sss" className="bg-paper py-16 sm:py-24">
        <div className="shell grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow text-ember-ink">Aklınızdaki sorular</p>
            <h2 id="tasarim-sss" className="display-3 mt-5">
              Başlamadan önce.
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-8" delay={0.1}>
            <FaqList items={faqs} />
          </Reveal>
        </div>
      </section>

      <section id="paylas" aria-labelledby="ilk-adim" className="scroll-mt-28 border-t border-sand bg-bone py-16 sm:py-24">
        <Reveal className="shell flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-ember-ink">Şöminenizi birlikte tasarlayalım</p>
            <h2 id="ilk-adim" className="display-2 mt-5 text-balance">
              İlk adım, mekânınızı tanımak.
            </h2>
            <p className="mt-4 text-[16px] text-steel">Tasarım önerisinden teknik değerlendirmeye, birlikte.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ShareButton />
            <a href={routes.quote} className="inline-flex min-h-12 items-center gap-2 px-2 text-[14px] font-semibold text-ink underline-offset-4 hover:underline">
              Fotoğrafsız proje başvurusu <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </section>

    </>
  );
}
