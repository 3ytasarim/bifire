import type { Metadata } from "next";
import Image from "next/image";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/motion/Motion";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
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
  { name: "Bifire & Biwool", path: routes.about },
];

const U = "/uploads/2026/10/";

/**
 * Marka hikâyesi bölümleri — kaynak: "Bifire Marka Hikâyesi ve Neden Bifire" Word metni (2026-10-31).
 * Sıra Word'deki alt başlıklarla aynı: odunlu üretim, Biwool yalıtım uzmanlığı, keşif ve montaj ekibi, Tuzla showroom.
 */
const CHAPTERS = [
  {
    id: "uretim",
    label: "Odunlu şömine üretimi",
    title: "Tasarımın arkasında üretim bilgisi var",
    paras: [
      "Kendi ürettiğimiz odunlu şömine hazneleri ve mekanizmaları sayesinde, tasarım kararlarını ürünün yapısını bilen bir ekiple şekillendiriyoruz. Camın biçiminden kaplamanın dokusuna, ölçülerden yerleşime kadar her tercihi mekânınızın mimarisi ve kullanım beklentilerinizle birlikte değerlendiriyoruz.",
      "Standart modellerimizin yanında özel ölçü ve tasarım üretimiyle, şöminenin bulunduğu alanla bütünleşmesini hedefliyoruz. Salonunuzun oranları, görüş açıları ve malzeme dili, projenin başlangıcından itibaren tasarıma yön veriyor.",
    ],
    image: `${U}bifire-rehber-033_ozel-tasarim-somine-uretimi-bifireda-nasil-ilerler-595c2f.webp`,
    alt: "Atölyede cam kapaklı odunlu şömine haznesinin işçilik kontrolü",
    link: { label: "Odunlu şömineleri inceleyin", href: routes.category("odunlu-somineler") },
  },
  {
    id: "biwool",
    label: "Biwool yalıtım uzmanlığı",
    title: "Özenimiz kaplamanın arkasında da devam ediyor",
    paras: [
      "Biwool’un yalıtım üretimindeki uzmanlığı, Bifire’ın malzeme seçimine ve ısı odası uygulamalarına yaklaşımını besliyor. Hazne çevresindeki hava dolaşımı, yalıtım katmanları, birleşim noktaları ve bakım erişimi, projenin ayrılmaz parçaları olarak ele alınıyor.",
      "Görünen yüzeylerde aradığımız inceliği, görünmeyen uygulama detaylarında da sürdürüyoruz. Çünkü tamamlanmış bir şöminenin değeri, tasarımıyla teknik yapısının birlikte düşünülmesinde yatıyor.",
    ],
    image: `${U}bifire-rehber-125_somine-isi-odasinda-levha-birlesimleri-sabitleme-ve-gecis-detaylar-30df45.webp`,
    alt: "Folyo yüzeyli taş yünü yalıtım levhaları ve sabitleme elemanları",
    link: null,
  },
  {
    id: "ekip",
    label: "Kendi keşif ve montaj ekibimiz",
    title: "Projenizi bilen ekip uygulamanızın da başında",
    paras: [
      "Keşif ve montaj çalışmalarını kendi ekibimizle gerçekleştiriyoruz. Mekânınızda belirlenen ihtiyaçları üretime ve sahadaki uygulamaya taşıyor; ilk görüşmeden montaja kadar doğrudan iletişim kurabileceğiniz bir süreç sunuyoruz.",
      "Böylece tasarım aşamasında konuşulan bir detay, üretimde karşılığını buluyor; üretimde alınan bir karar, montajda aynı anlayışla uygulanıyor.",
    ],
    image: `${U}bifire-rehber-016_somine-montaji-ne-kadar-surer-uretim-ve-uygulama-takvimini-etkiley-403265.webp`,
    alt: "Montaj öncesi uygulama alanında konumlandırılmış şömine haznesi ve ölçüm araçları",
    link: { label: "Tasarım ve montaj sürecimiz", href: routes.services },
  },
  {
    id: "showroom",
    label: "Tuzla fabrika showroom",
    title: "Bifire’ı üretildiği yerde tanıyın",
    paras: [
      "İstanbul Tuzla’daki fabrika showroomumuz, tasarım beklentileriyle üretim bilgisinin buluştuğu yer. Burada modelleri yakından inceleyebilir, malzemelerin dokusunu görebilir ve projenizi doğrudan üretici ekibimizle değerlendirebilirsiniz.",
      "Sizi, yaşam alanınıza gelecek şöminenin her ayrıntısını birlikte düşünmeye davet ediyoruz.",
    ],
    image: `${U}bifire-rehber-034_tuzla-fabrika-showroomda-somine-projesini-nasil-degerlendiriyoruz-87d2b4.webp`,
    alt: "Sergilenen odunlu şömine modelleri ve görüşme masasının bulunduğu showroom alanı",
    link: null,
  },
];

/**
 * Bifire & Biwool (Kurumsal): marka hikâyesi. Girişte ana slogan; dört bölüm (üretim, Biwool, ekip, showroom)
 * açık taş tonlarında dönüşümlü görsel/metin düzeninde; sonda showroom ve proje başvurusu daveti.
 */
export default async function AboutPage() {
  const s = await getSiteSettings();
  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path: routes.about, name: "Bifire Şömine Marka Hikâyesi", description: STATIC_PAGES.kurumsal.defaults.description, type: "AboutPage", hasBreadcrumb: true, mainEntityId: ids.organization() }),
          breadcrumbNode(routes.about, CRUMBS),
        )}
      />
      <PageHero
        crumbs={CRUMBS}
        eyebrow="Bifire Şömine Marka Hikâyesi"
        title="Şöminenin Görünen Güzelliği, Görünmeyen Detayların Uzmanlığıyla Buluşuyor."
        intro="Bir şöminenin karakteri, ateş yandığında ortaya çıkar. Kalitesi ise tasarım çizgilerinde, seçilen malzemelerde ve kaplamanın arkasında kalan ayrıntılarda şekillenir."
        image={s.aboutImage}
        imageAlt={s.aboutImageAlt}
      />

      <section aria-label="Bifire’ın doğuşu" className="border-y border-sand bg-white">
        <div className="shell grid gap-8 py-14 lg:grid-cols-12 lg:gap-14 lg:py-20">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow text-ember-ink">Bifire &amp; Biwool</p>
            <p className="mt-5 font-display text-[1.35rem] leading-snug tracking-[-0.02em] text-ink sm:text-[1.6rem]">Bifire Şömine, bu bütüne hâkim olma düşüncesinden doğdu.</p>
          </Reveal>
          <Reveal className="lg:col-span-8" delay={0.08}>
            <p className="text-[18px] leading-relaxed text-steel sm:text-[20px]">
              Biwool’un yalıtım üretiminden gelen bilgi birikimini; şömine tasarımı, üretimi ve uygulamasıyla buluşturduk. Yaşam alanında güçlü bir iz bırakan tasarımlar geliştirirken, o görünümü taşıyan teknik detaylara da aynı özeni gösteriyoruz.
            </p>
            {/* Bölüm içindekiler: dört unsur tek bakışta, her biri bölümüne atlar */}
            <ol className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-sand bg-sand sm:grid-cols-2 lg:grid-cols-4">
              {CHAPTERS.map((c, i) => (
                <li key={c.id}>
                  <a href={`#${c.id}`} className="group flex h-full min-h-[92px] flex-col justify-between gap-3 bg-paper p-4 transition-colors duration-500 hover:bg-white">
                    <span className="text-[11px] font-semibold tracking-[0.18em] text-ember-ink tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[14px] leading-snug font-medium text-ink transition-colors group-hover:text-ember-ink">{c.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {CHAPTERS.map((c, i) => (
        <section key={c.id} id={c.id} aria-labelledby={`${c.id}-baslik`} className={`section-pad scroll-mt-28 ${i % 2 ? "bg-bone" : "bg-paper"}`}>
          <div className="shell grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal className={i % 2 ? "lg:order-2" : ""} y={24}>
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-sand">
                <Image src={c.image} alt={c.alt} fill sizes="(min-width: 1360px) 640px, (min-width: 1024px) 50vw, 100vw" className="object-cover" />
              </div>
            </Reveal>
            <Reveal className={i % 2 ? "lg:order-1" : ""} delay={0.08}>
              <p className="studio-eyebrow text-ember-ink">
                <span className="tabular-nums">{String(i + 1).padStart(2, "0")} / </span>
                {c.label}
              </p>
              <h2 id={`${c.id}-baslik`} className="studio-h2 mt-4 text-balance text-ink">
                {c.title}
              </h2>
              <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-steel">
                {c.paras.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              {c.link ? (
                <div className="mt-8">
                  <ArrowFillButton href={c.link.href} tone="light" size="sm">
                    {c.link.label}
                  </ArrowFillButton>
                </div>
              ) : null}
            </Reveal>
          </div>
        </section>
      ))}

      <section aria-labelledby="kurumsal-davet" className="section-pad border-t border-sand bg-white">
        <Reveal className="shell flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-ember-ink">Projenizin ilk adımı</p>
            <h2 id="kurumsal-davet" className="studio-h2 mt-4 text-balance text-ink">
              Size uygun şömineyi birlikte bulalım.
            </h2>
            <p className="mt-4 text-[18px] leading-relaxed text-steel">Mekânınıza ait tasarımı, üretildiği yerde şekillendirelim.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ArrowFillButton href={routes.showroom} tone="light" size="lg">
              Fabrika Showroomunu Keşfedin
            </ArrowFillButton>
            <ArrowFillButton href={routes.quote} tone="ember" size="lg">
              Projenizi Bizimle Paylaşın
            </ArrowFillButton>
          </div>
        </Reveal>
      </section>
    </>
  );
}
