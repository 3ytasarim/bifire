import Link from "next/link";
import { ArrowRight, ArrowUpRight, Info } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Motion";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FaqList } from "@/components/site/FaqList";
import { JsonLd } from "@/components/site/JsonLd";
import { MobileCta } from "@/components/site/MobileCta";
import { ProductDrawings } from "@/components/site/ProductDrawings";
import { ProductOptions } from "@/components/site/ProductOptions";
import { RequestForm } from "@/components/site/RequestForm";
import { RichText } from "@/components/site/RichText";
import { TrustPoints } from "@/components/site/TrustPoints";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { Button3D } from "@/components/ui/button-3d";
import type { ModelPage } from "@/content/model-pages";
import { PROCESS } from "@/content/company";
import { familyOf, modelName } from "@/lib/collection";
import { routes } from "@/lib/catalog";
import { splitHtmlSections } from "@/lib/html-sections";
import { formatSpec, groupOptions, keyValues, modelPath, variantGroupsOf, type CollectionModel } from "@/lib/models";
import type { ProductDetail } from "@/lib/queries";
import { breadcrumbNode, faqNode, graph, productNode, webPageNode, type Crumb } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/seo/site";
import type { SiteSettings } from "@/lib/settings";
import { CODE_LABEL } from "@/lib/variants";
import { InfoTabs } from "./InfoTabs";
import { CollectionAside, ContactButtons, galleryOf, shortLabel } from "./parts";

const MISSING = "Bu modelin sayısal teknik tablosu tamamlanacak. Başka bir ölçünün değerleri kullanılmamıştır.";

/** Model seçici bağlantı hapı (sayfa geçişi; seçili olan vurgulu). */
function Pill({ href, on, children }: { href: string; on: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={on ? "page" : undefined}
      className={`inline-flex min-h-12 items-center rounded-full border px-5 text-[15px] font-semibold transition-colors duration-300 ${on ? "border-ink bg-ink text-white" : "border-sand bg-white text-ink hover:border-ink"}`}
    >
      {children}
    </Link>
  );
}

/**
 * Koleksiyon modeli sayfası (ör. U Tipi Şömine 70'lik · Seri 01 · BF-U-01-70): seri/ölçü geçişi, öne çıkan değerler,
 * üretim detayları, modelin teknik tablosu + ölçü çizimleri, sekmeli tasarım/teknik/süreç metinleri, SSS ve teklif.
 */
export function ModelView({
  product,
  models,
  model,
  crumbs,
  settings,
  form,
  siblings,
  page,
}: {
  /** Modelin kendi içeriği (başlık, görsel, tanıtım, yerleşim); yoksa aile metniyle genel model sayfası. */
  page?: ModelPage | null;
  product: ProductDetail;
  models: CollectionModel[];
  model: CollectionModel;
  siblings: { slug: string; name: string; familyTitle: string | null }[];
  crumbs: Crumb[];
  settings: SiteSettings;
  form: { categories: { id: string; name: string }[]; products: { id: string; name: string; categoryId: string }[] };
}) {
  const family = familyOf(product);
  const name = page?.h1 ?? modelName(family, product.name, model.size);
  const path = modelPath(product.slug, model.slug);
  // Kendi görseli olan model yalnız kendi görselini gösterir (başka modelin görseli galeride yer almaz).
  const gallery = page ? [{ url: page.image.url, alt: page.image.alt, width: page.image.width, height: page.image.height }] : galleryOf(product);
  const values = keyValues(model);
  const story = splitHtmlSections(product.description);
  const section = (t: string) => story.sections.find((s) => s.title === t)?.html ?? "";
  const faqs = product.faqs.map((f) => ({ q: f.question, a: f.answer }));
  const details = product.features.filter((f) => f.title);
  const groups = variantGroupsOf(product.options, product.specifications);
  // Teknik değere bağlı olmayan seçenekler (Kaplama, Cam yönü) model sayfasında seçilebilir kalır.
  const extraOptions = groupOptions(product.options).filter((g) => !groups.includes(g.name));
  const seriesList = [...new Set(models.map((m) => m.series).filter(Boolean))] as string[];
  const sameSeries = models.filter((m) => m.series === model.series);
  const seriesTarget = (s: string) => models.find((m) => m.series === s && m.size === model.size) ?? models.find((m) => m.series === s)!;
  const label = [model.series, model.size].filter(Boolean).join(" · ");
  const description = page?.metaDescription ?? `${name} (${model.code}) — ${family?.desc ?? product.shortDescription ?? product.name}`;
  const drawings = product.drawings.map((d, n) => ({ url: d.url, alt: d.alt || `${name} — ölçü çizimi ${n + 1}`, variant: d.variant, width: d.width, height: d.height }));
  const tableRows = model.rows.filter((r) => r.label !== CODE_LABEL);

  const tabs = [
    section("Tasarım ve kullanım") ? { label: "Tasarım ve kullanım", content: <RichText html={section("Tasarım ve kullanım")} className="max-w-3xl text-[17px]" /> } : null,
    section("Teknik değerlendirme") ? { label: "Teknik değerlendirme", content: <RichText html={section("Teknik değerlendirme")} className="max-w-3xl text-[17px]" /> } : null,
    {
      label: "Proje süreci",
      content: (
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((p, i) => (
            <li key={p.key} className="rounded-2xl border border-linen bg-white p-5">
              <span className="font-display text-sm font-semibold text-ember-ink tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-ink">{p.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-steel">{p.text}</p>
            </li>
          ))}
        </ol>
      ),
    },
  ].filter((t): t is { label: string; content: React.ReactElement } => Boolean(t));

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path, name, description, type: "ItemPage", hasBreadcrumb: true, mainEntityId: undefined, dateModified: product.updatedAt }),
          breadcrumbNode(path, crumbs),
          productNode({
            path,
            name,
            description,
            images: gallery.map((g) => g.url),
            category: product.category.name,
            modelCode: model.code,
            brand: /bifire/i.test(product.brand ?? "") ? product.brand : null,
            properties: tableRows.map((r) => ({ name: r.label, value: r.value, unitText: r.unit })),
          }),
          faqNode(path, faqs),
        )}
      />

      <article className="bg-paper">
        <div className="shell pt-8 pb-16 sm:pt-10 lg:pb-24">
          <Breadcrumbs items={crumbs} />
          <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-0">
            <Reveal className="lg:col-span-7 lg:col-start-1 lg:row-start-1" y={20}>
              <CollectionAside part="gallery" product={product} family={family} gallery={gallery} form={form} path={path} />
            </Reveal>
            <div className="lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
              <Reveal className="lg:sticky lg:top-32" delay={0.12} y={20}>
                <Link href={routes.product(product.slug)} className="eyebrow text-ember-ink hover:text-ink">
                  {product.name}
                  {model.series ? ` · ${model.series}` : ""}
                </Link>
                <h1 className="display-2 mt-5">{name}</h1>
                {page ? (
                  <p className="lead mt-5 text-steel">{page.lead}</p>
                ) : (
                  <>
                    <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-sand bg-white px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-stone uppercase">
                      Katalog kodu <span className="text-ink tabular-nums">{model.code}</span>
                    </p>
                    {family ? <p className="lead mt-5 text-steel">{family.line} Hazne, kaplama, baca ve montaj kapsamı projenize özel olarak netleştirilir.</p> : null}
                  </>
                )}

                <div className="mt-8 space-y-6">
                  {seriesList.length > 1 ? (
                    <nav aria-label="Seri">
                      <p className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">01 / Seri</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {seriesList.map((s) => (
                          <Pill key={s} href={modelPath(product.slug, seriesTarget(s).slug)} on={s === model.series}>
                            {s}
                          </Pill>
                        ))}
                      </div>
                    </nav>
                  ) : null}
                  <nav aria-label={groups.at(-1) ?? "Model"}>
                    <p className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">
                      {seriesList.length > 1 ? "02" : "01"} / {groups.at(-1) ?? "Model"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {sameSeries.map((m) => (
                        <Pill key={m.slug} href={modelPath(product.slug, m.slug)} on={m.slug === model.slug}>
                          {m.size}
                        </Pill>
                      ))}
                    </div>
                  </nav>
                </div>
                <ProductOptions groups={extraOptions} prefix={page ? `Model: ${name}` : `Model: ${model.code} (${label})`} numberFrom={seriesList.length > 1 ? 3 : 2} />

                {values.length ? (
                  <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 border-y border-sand py-5 sm:grid-cols-4 sm:gap-x-3">
                    {values.map((r) => (
                      <div key={r.label} className="flex min-w-0 flex-col-reverse justify-end">
                        <dt className="mt-1.5 text-[10px] font-semibold tracking-[0.1em] text-stone uppercase">{shortLabel(r.label)}</dt>
                        <dd className="font-display text-[1.6rem] leading-none font-semibold tracking-[-0.03em] whitespace-nowrap text-ink tabular-nums xl:text-[1.75rem]">
                          {r.unit === "%" ? <span className="text-ember">%</span> : null}
                          {r.value}
                          {r.unit && r.unit !== "%" ? <span className="ml-0.5 text-xs font-semibold tracking-normal text-ember">{r.unit}</span> : null}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-8 flex gap-2 border-y border-sand py-5 text-[14px] leading-relaxed text-steel">
                    <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ember" /> Modele ait teknik bilgiler tamamlanacak. Değerlendirme için ekibimizle görüşebilirsiniz.
                  </p>
                )}

                <div className="mt-8 flex flex-col gap-3">
                  <Button3D href="#teklif" tone="ember" size="lg" fullWidth>
                    Bu model için teklif al <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Button3D>
                  <ContactButtons settings={settings} message={page ? `Model: ${name} — ${absoluteUrl(path)}` : `Model: ${name} (${model.code}) — ${absoluteUrl(path)}`} />
                </div>
                <div className="mt-8 border-t border-sand pt-6">
                  <TrustPoints compact />
                </div>
              </Reveal>
            </div>
            <Reveal className="lg:col-span-7 lg:col-start-1 lg:row-start-2 lg:self-start" y={20}>
              <CollectionAside part="extras" product={product} family={family} gallery={gallery} form={form} path={path} />
            </Reveal>
          </div>
        </div>
      </article>

      {page ? (
        <section aria-labelledby="model-tanitim" className="border-t border-sand bg-white py-16 sm:py-24">
          <div className="shell grid gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <p className="eyebrow text-ember-ink">Modeli tanıyın</p>
              <h2 id="model-tanitim" className="display-3 mt-5 text-balance">
                {name}
              </h2>
              <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-steel">
                {page.intro.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="eyebrow text-ember-ink">Mekânda yerleşim</p>
              <h2 className="display-3 mt-5 text-balance">Mekânınızda nasıl konumlanır?</h2>
              <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-steel">
                {page.placement.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="teknik" className="border-y border-sand bg-white py-16 sm:py-24">
        <div className="shell grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow text-ember-ink">Bifire ürün bilgileri</p>
            <h2 id="teknik" className="display-3 mt-5 text-balance">
              Teknik özellikler ve ölçüler.
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-steel">
              Seçili model: <span className="font-semibold text-ink">{name}</span>
              {model.series ? ` · ${model.series}` : ""}
            </p>
          </Reveal>
          <Reveal className="lg:col-span-8" delay={0.1}>
            {!model.hasData ? (
              <p role="note" className="mb-4 flex gap-2.5 rounded-2xl border border-ember/30 bg-ember/5 px-4 py-3 text-[14px] leading-relaxed text-ink">
                <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ember" /> {MISSING}
              </p>
            ) : null}
            <table className="w-full border-collapse text-left text-[15px]">
              <caption className="sr-only">
                {name} ({model.code}) teknik özellikleri
              </caption>
              <tbody>
                <tr className="border-t border-sand">
                  <th scope="row" className="w-1/2 py-4 pr-4 font-medium text-steel">
                    Model kodu
                  </th>
                  <td className="py-4 font-semibold text-ink tabular-nums">{model.code}</td>
                </tr>
                {tableRows.map((r) => (
                  <tr key={r.label} className="border-t border-sand">
                    <th scope="row" className="w-1/2 py-4 pr-4 font-medium text-steel">
                      {r.label}
                    </th>
                    <td className="py-4 font-semibold text-ink tabular-nums">{formatSpec(r.value, r.unit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {family?.specNote ? <p className="mt-4 border-t border-sand pt-4 text-[13px] leading-relaxed text-stone">{family.specNote}</p> : null}
            <ProductDrawings drawings={drawings} groups={[]} fallback={model.key} />
          </Reveal>
        </div>
      </section>

      {details.length ? (
        <section aria-labelledby="detaylar" className="bg-ink py-16 text-white sm:py-24">
          <div className="shell">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <p className="eyebrow text-ember">Bifire üretim detayları</p>
                <h2 id="detaylar" className="display-3 mt-5 text-balance text-white">
                  Tasarımın arkasındaki ayrıntılar.
                </h2>
              </div>
              {family ? <p className="text-[16px] leading-relaxed text-white/70 lg:col-span-5">{family.detailIntro}</p> : null}
            </div>
            <Stagger as="ol" className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {details.map((f, i) => (
                <StaggerItem key={f.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors duration-500 hover:border-ember/50 hover:bg-white/[0.07]">
                  <span aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-ember/0 blur-3xl transition-colors duration-700 group-hover:bg-ember/25" />
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-ember uppercase tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                    {f.label ? ` / ${f.label}` : ""}
                  </p>
                  <h3 className="mt-3 font-display text-lg font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/70">{f.text}</p>
                  {f.note ? <p className="mt-auto border-t border-white/10 pt-3 text-[12px] font-medium text-white/55">{f.note}</p> : null}
                </StaggerItem>
              ))}
            </Stagger>
            {family?.detailNote ? <p className="mt-8 max-w-3xl text-[13px] leading-relaxed text-white/50">{family.detailNote}</p> : null}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="secim" className="bg-paper py-16 sm:py-24">
        <div className="shell">
          <Reveal>
            <h2 id="secim" className="display-3 text-balance">
              Mekânınızla birlikte düşünülen bir seçim.
            </h2>
          </Reveal>
          <Reveal className="mt-10" delay={0.1}>
            <InfoTabs tabs={tabs} />
          </Reveal>
        </div>
      </section>

      {faqs.length ? (
        <section aria-labelledby="model-sss" className="bg-white py-16 sm:py-24">
          <div className="shell grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow text-ember-ink">Seçiminizi netleştirin</p>
              <h2 id="model-sss" className="display-3 mt-5">
                Merak ettikleriniz.
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-8" delay={0.1}>
              <FaqList items={faqs} />
            </Reveal>
          </div>
        </section>
      ) : null}

      {page ? (
        <section aria-labelledby="model-davet" className="bg-paper py-14 sm:py-20">
          <div className="shell flex flex-col items-start gap-6 border-y border-sand py-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-ember-ink">Projenizin ilk adımı</p>
              <h2 id="model-davet" className="display-3 mt-4 text-balance">
                Size Uygun Şömineyi Birlikte Bulalım.
              </h2>
              <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-steel">Mekânınızın planını ve fotoğraflarını paylaşın; {name} için yerleşim ve uygulama seçeneklerini birlikte değerlendirelim.</p>
            </div>
            <ArrowFillButton href="#teklif" tone="ember" size="lg">
              Projenizi Paylaşın
            </ArrowFillButton>
          </div>
        </section>
      ) : null}

      <section id="teklif" aria-labelledby="teklif-baslik" className="scroll-mt-28 border-t border-sand bg-bone py-16 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow text-ember-ink">Teklif</p>
            <h2 id="teklif-baslik" className="display-2 mt-5">
              {name} için teklif alın
            </h2>
            <p className="lead mt-6 text-steel">Mekân ölçülerinizi ve beklentinizi paylaşın; uygulama detaylarıyla birlikte size özel teklif hazırlayalım ya da Tuzla fabrika showroomumuzda görüşelim.</p>
            {page ? <p className="mt-4 text-[14px] text-stone">Seçtiğiniz model ({name}) talebinize otomatik olarak eklenir.</p> : null}
          </Reveal>
          <div className="lg:col-span-7">
            <RequestForm type="QUOTE" categories={form.categories} products={form.products} defaultCategoryId={product.categoryId} defaultProductId={product.id} sourcePath={path} submitLabel="Talebimi gönder" showroomToggle district />
          </div>
        </div>
      </section>

      <nav aria-labelledby="diger-modeller" className="bg-white py-14 sm:py-20">
        <div className="shell space-y-8">
          <div>
            <p id="diger-modeller" className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">
              {product.name} modelleri
            </p>
            <Link href={`${routes.product(product.slug)}#modeller`} className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-ember-ink underline-offset-4 hover:underline">
              {page ? "Tüm modelleri karşılaştırın" : "Tüm ölçü ve serileri karşılaştırın"} <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">Farklı formları da keşfedin</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {siblings
                .map((x) => [x.slug, { title: x.familyTitle || x.name }] as const)
                .map(([slug, f]) => (
                  <li key={slug}>
                    <Link href={routes.product(slug)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-linen bg-paper px-4 text-[14px] font-semibold text-ink transition-colors hover:border-ink">
                      {f.title} <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-ember-ink" />
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </nav>

      <MobileCta label="Bu model için teklif al" />
    </>
  );
}
