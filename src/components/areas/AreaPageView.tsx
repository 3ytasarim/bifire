import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Factory, MapPin, Wrench } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Motion";
import { ProductCard } from "@/components/site/Cards";
import { FaqList } from "@/components/site/FaqList";
import { JsonLd } from "@/components/site/JsonLd";
import { MobileCta } from "@/components/site/MobileCta";
import { PageHero } from "@/components/site/PageHero";
import { RequestForm } from "@/components/site/RequestForm";
import { ShowroomBlock } from "@/components/site/ShowroomBlock";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { PRIORITY_DISTRICTS } from "@/content/regions";
import { districtOption, PROVINCES, SHOWROOM_AREA, type AreaPage, type Province } from "@/content/service-areas";
import { routes } from "@/lib/catalog";
import type { ProductCardData } from "@/lib/queries";
import { breadcrumbNode, faqNode, graph, serviceNode, webPageNode } from "@/lib/seo/json-ld";
import { AreaArticle } from "./AreaArticle";
import { DistrictGrid } from "./DistrictGrid";

type FormOptions = { categories: { id: string; name: string }[]; products: { id: string; name: string; categoryId: string }[] };

/**
 * İl ve ilçe hizmet sayfası (ortak görünüm). İl sayfasında ilçe kartları, ilçe sayfasında aynı ilin diğer ilçeleri
 * gösterilir. Metin: content/service-areas (Word paketi). Şube iddiası yok — fabrika showroom Tuzla'dadır.
 */
export function AreaPageView({ province, district, products, form }: { province: Province; district: AreaPage | null; products: ProductCardData[]; form: FormOptions }) {
  const page = district ?? province.page;
  const isProvince = !district;
  const path = district ? routes.region(province.slug, district.slug) : routes.province(province.slug);
  const crumbs = [
    { name: "Ana Sayfa", path: "/" },
    { name: "Hizmet Bölgeleri", path: routes.regions },
    { name: province.name, path: routes.province(province.slug) },
    ...(district ? [{ name: district.name, path }] : []),
  ];
  const place = district ? `${district.name}, ${province.name}` : province.name;
  const isShowroom = province.slug === SHOWROOM_AREA.province && district?.slug === SHOWROOM_AREA.district;
  const priority = province.slug === "istanbul" ? PRIORITY_DISTRICTS.map((d) => d.slug) : [];
  const siblings = district ? province.districts.filter((d) => d.slug !== district.slug) : [];
  const otherProvinces = PROVINCES.filter((p) => p.slug !== province.slug);
  const cta = page.cta || `${district?.name ?? province.name} projem için görüşme talep et`;

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path, name: page.h1, description: page.meta, hasBreadcrumb: true }),
          breadcrumbNode(path, crumbs),
          serviceNode({ path, name: page.h1, description: page.meta, serviceType: "Şömine tasarımı, üretimi ve montajı", areaServed: [place] }),
          faqNode(path, page.faqs),
        )}
      />

      <PageHero crumbs={crumbs} eyebrow={district ? `${province.name} · ${district.name}` : `Hizmet bölgesi · ${province.name}`} title={page.h1} intro={page.intro[0]}>
        {page.intro.slice(1).map((p) => (
          <p key={p.slice(0, 40)} className="-mt-2 mb-6 max-w-2xl text-[16px] leading-relaxed text-steel">
            {p}
          </p>
        ))}
        <div className="flex flex-wrap items-center gap-3">
          <ArrowFillButton href="#basvuru" tone="ember">
            {cta}
          </ArrowFillButton>
          {isProvince ? (
            <ArrowFillButton href="#ilceler" tone="ink">
              {`${province.districts.length} ilçeyi inceleyin`}
            </ArrowFillButton>
          ) : (
            <Link href={routes.province(province.slug)} className="inline-flex min-h-12 items-center gap-2 px-2 text-[14px] font-semibold text-ink underline-offset-4 hover:underline">
              <ArrowLeft aria-hidden="true" className="h-4 w-4" /> {province.name} hizmet sayfası
            </Link>
          )}
        </div>
        <ul className="mt-6 flex flex-wrap gap-2.5">
          {[
            { Icon: Factory, text: isShowroom ? "Fabrika showroom bu ilçede" : `Fabrika showroom: İstanbul ${SHOWROOM_AREA.name}` },
            { Icon: Wrench, text: "Kendi üretim ve montaj ekibi" },
            { Icon: MapPin, text: `${district?.name ?? province.name} için proje görüşmesi` },
          ].map(({ Icon, text }) => (
            <li key={text} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-linen bg-white px-4 text-[13px] font-semibold text-ink">
              <Icon aria-hidden="true" className="h-4 w-4 text-ember" /> {text}
            </li>
          ))}
        </ul>
      </PageHero>

      <section aria-labelledby="bolge-icerik" className="relative overflow-hidden bg-paper pb-16 sm:pb-24">
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.12),transparent_65%)]" />
        <div className="shell relative">
          <h2 id="bolge-icerik" className="sr-only">
            {place} şömine projesi
          </h2>
          <AreaArticle
            sections={page.sections}
            labelledBy="bolge-icerik"
            aside={
              <dl className="space-y-5 rounded-2xl border border-linen bg-white p-6">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">Görüşmeye hazırlık</p>
                <div>
                  <dt className="text-[12px] text-stone">Projenizin konumu</dt>
                  <dd className="mt-0.5 font-semibold text-ink">{place}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-stone">Üretim ve showroom merkezimiz</dt>
                  <dd className="mt-0.5 font-semibold text-ink">İstanbul {SHOWROOM_AREA.name}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-stone">Paylaşabileceğiniz bilgiler</dt>
                  <dd className="mt-0.5 text-[14px] leading-relaxed text-ink">Mekân fotoğrafları, varsa plan, yaklaşık ölçüler ve kullanım beklentisi.</dd>
                </div>
                <Link href={routes.design} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ember-ink underline-offset-4 hover:underline">
                  Fotoğrafınızla başlayın <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                </Link>
              </dl>
            }
          />
        </div>
      </section>

      {isProvince ? (
        <section id="ilceler" aria-labelledby="ilceler-baslik" className="scroll-mt-28 border-y border-sand bg-white py-16 sm:py-24">
          <div className="shell">
            <Reveal className="mb-10 grid gap-4 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <p className="eyebrow text-ember-ink">{province.name} ilçeleri</p>
                <h2 id="ilceler-baslik" className="display-3 mt-5">
                  İlçenizi seçin.
                </h2>
              </div>
              <p className="text-[16px] leading-relaxed text-steel lg:col-span-5">Her ilçe sayfası, o bölgedeki projelerde öne çıkan hazırlık konularını anlatır. Hizmet kapsamı adres ve proje bilgisine göre netleşir.</p>
            </Reveal>
            <DistrictGrid provinceSlug={province.slug} districts={province.districts.map((d) => ({ name: d.name, slug: d.slug, focus: d.focus }))} highlight={priority} />
          </div>
        </section>
      ) : null}

      {products.length ? (
        <section aria-labelledby="bolge-urunler" className="bg-paper py-16 sm:py-24">
          <div className="shell">
            <Reveal className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow text-ember-ink">Karşılaştırabileceğiniz ürünler</p>
                <h2 id="bolge-urunler" className="display-3 mt-5">
                  Şömine tipleri
                </h2>
              </div>
              <Link href={routes.products} className="link-underline text-[13px] font-semibold tracking-[0.16em] text-ember-ink uppercase">
                Tüm ürünler
              </Link>
            </Reveal>
            <Stagger className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <StaggerItem key={p.id}>
                  <ProductCard product={p} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {page.faqs.length ? (
        <section aria-labelledby="bolge-sss" className="bg-white py-16 sm:py-24">
          <div className="shell grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow text-ember-ink">Sık sorulan sorular</p>
              <h2 id="bolge-sss" className="display-3 mt-5">
                {district?.name ?? province.name} için sorular.
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-8" delay={0.1}>
              <FaqList items={page.faqs} />
            </Reveal>
          </div>
        </section>
      ) : null}

      <section id="basvuru" aria-labelledby="bolge-basvuru" className="scroll-mt-28 border-t border-sand bg-bone py-16 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow text-ember-ink">İlk adımı birlikte belirleyelim</p>
            <h2 id="bolge-basvuru" className="display-2 mt-5 text-balance">
              {district?.name ?? province.name} için görüşme planlayın
            </h2>
            <p className="lead mt-6 text-steel">Mekân fotoğraflarınız, varsa planınız ve kullanım beklentinizle başlayın; showroom ziyaretinizi de birlikte planlayalım.</p>
          </Reveal>
          <div className="lg:col-span-7">
            <RequestForm type="QUOTE" categories={form.categories} products={form.products} sourcePath={path} submitLabel="Görüşme talebimi gönder" showroomToggle district defaultDistrict={districtOption(province.name, district?.name)} />
          </div>
        </div>
      </section>

      <ShowroomBlock title={page.closing?.title ?? "Kararınızı Tuzla fabrika showroomunda somutlaştıralım"} intro={page.closing?.paras.join(" ") || undefined} />

      <nav aria-labelledby="diger-bolgeler" className="bg-white py-14 sm:py-20">
        <div className="shell space-y-8">
          {siblings.length ? (
            <div>
              <h2 id="diger-bolgeler" className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">
                {province.name} ilçeleri
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {siblings.map((o) => (
                  <li key={o.slug}>
                    <Link
                      href={routes.region(province.slug, o.slug)}
                      className={`inline-flex min-h-11 items-center rounded-full border px-4 text-[14px] font-semibold text-ink transition-colors hover:border-ink ${priority.includes(o.slug) ? "border-ember/30 bg-ember/[0.04]" : "border-linen bg-paper"}`}
                    >
                      {o.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div>
            <p id={siblings.length ? undefined : "diger-bolgeler"} className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">
              Diğer hizmet bölgeleri
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {otherProvinces.map((p) => (
                <li key={p.slug}>
                  <Link href={routes.province(p.slug)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-linen bg-paper px-4 text-[14px] font-semibold text-ink transition-colors hover:border-ink">
                    {p.name} <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-ember-ink" />
                  </Link>
                </li>
              ))}
              <li>
                <Link href={routes.regions} className="inline-flex min-h-11 items-center px-4 text-[14px] font-semibold text-ember-ink underline-offset-4 hover:underline">
                  Tüm bölgeler
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <MobileCta label="Görüşme talep et" targetId="basvuru" />
    </>
  );
}
