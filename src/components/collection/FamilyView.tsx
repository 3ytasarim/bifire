import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Motion";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FaqList } from "@/components/site/FaqList";
import { JsonLd } from "@/components/site/JsonLd";
import { MobileCta } from "@/components/site/MobileCta";
import { RequestForm } from "@/components/site/RequestForm";
import { RichText } from "@/components/site/RichText";
import { ShowroomBlock } from "@/components/site/ShowroomBlock";
import { TrustPoints } from "@/components/site/TrustPoints";
import { Button3D } from "@/components/ui/button-3d";
import { familyOf, modelName } from "@/lib/collection";
import { routes } from "@/lib/catalog";
import { extractFaq, splitHtmlSections } from "@/lib/html-sections";
import { SeoArticle } from "@/components/site/SeoArticle";
import { formatSpec, keyValues, modelPath, type CollectionModel } from "@/lib/models";
import type { ProductDetail } from "@/lib/queries";
import { breadcrumbNode, faqNode, graph, itemListNode, productNode, webPageNode, type Crumb } from "@/lib/seo/json-ld";
import { deriveDescription } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
import type { SiteSettings } from "@/lib/settings";
import { ModelGrid } from "./ModelGrid";
import { CollectionAside, ContactButtons, galleryOf, shortLabel } from "./parts";

const NOTE = "Ölçü etiketleri nominal model adlarıdır; gerçek ölçünün birimi, sırası ve cam veya gövde karşılığı teknik çizimle netleştirilir.";

/**
 * Koleksiyon ailesi sayfası (ör. U Tipi Odunlu Şömine): kısa tanıtım + seri/ölçü modelleri + planlama metni + SSS.
 * Ayrıntılı teknik bilgi, çizim ve üretim detayları her modelin kendi sayfasındadır (sade aile sayfası).
 */
export function FamilyView({
  product,
  models,
  crumbs,
  settings,
  form,
  siblings,
  categoryArticle,
}: {
  product: ProductDetail;
  models: CollectionModel[];
  crumbs: Crumb[];
  siblings: { slug: string; name: string; familyTitle: string | null }[];
  /** Tek ürünlü kategorinin uzun SEO metni (getSoleProductCategory); Showroom bandının üstünde gösterilir. */
  categoryArticle?: { name: string; content: string | null } | null;
  settings: SiteSettings;
  form: { categories: { id: string; name: string }[]; products: { id: string; name: string; categoryId: string }[] };
}) {
  const path = routes.product(product.slug);
  const family = familyOf(product);
  const gallery = galleryOf(product);
  const story = splitHtmlSections(product.description);
  const collection = product.category.parent ?? product.category;
  const planning = story.sections.filter((s) => s.title === "Tasarım ve kullanım" || s.title === "Teknik değerlendirme");
  const faqs = product.faqs.map((f) => ({ q: f.question, a: f.answer }));
  // Tek ürünlü kategorinin SEO metninin SSS'leri de aynı FAQPage şemasına girer (sayfada görünür).
  const schemaFaqs = [...faqs, ...extractFaq(categoryArticle?.content)];
  const description = deriveDescription(product.shortDescription, product.description) || product.name;
  const grid = models.map((m) => ({
    href: modelPath(product.slug, m.slug),
    code: m.code,
    series: m.series,
    size: m.size,
    name: modelName(family, product.name, m.size),
    values: keyValues(m).map((r) => ({ label: shortLabel(r.label), text: formatSpec(r.value, r.unit) })),
    hasData: m.hasData,
  }));
  const others = siblings.map((x) => [x.slug, { title: x.familyTitle || x.name }] as const);

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path, name: product.name, description, type: "CollectionPage", hasBreadcrumb: true, dateModified: product.updatedAt }),
          breadcrumbNode(path, crumbs),
          productNode({
            path,
            name: product.name,
            description,
            images: gallery.map((g) => g.url),
            category: product.category.name,
            brand: product.brand,
            properties: models.flatMap((m) => keyValues(m, 3).map((r) => ({ name: `${r.label} (${m.code})`, value: r.value, unitText: r.unit }))),
          }),
          itemListNode(path, grid.map((g) => ({ name: `${g.name} (${g.code})`, path: g.href }))),
          faqNode(path, schemaFaqs),
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
                <p className="eyebrow text-ember-ink">Bifire · {family?.tag ?? product.category.name}</p>
                <h1 className="display-2 mt-5">{product.name}</h1>
                {family ? <p className="mt-4 font-display text-2xl leading-snug font-semibold text-balance text-ink">{family.line}</p> : null}
                <p className="lead mt-5 text-steel">{family?.desc ?? product.shortDescription}</p>
                <p className="mt-6 text-[13px] font-semibold tracking-[0.14em] text-stone uppercase">
                  {models.length} model{grid.some((g) => g.series) ? ` · ${new Set(grid.map((g) => g.series)).size} seri` : ""}
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <Button3D href="#modeller" tone="ember" size="lg" fullWidth>
                    Ölçü ve modelleri inceleyin <ArrowDown aria-hidden="true" className="h-4 w-4" />
                  </Button3D>
                  <ContactButtons settings={settings} message={`Ürün: ${product.name} — ${absoluteUrl(path)}`} />
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

      <section id="modeller" aria-labelledby="modeller-baslik" className="scroll-mt-28 border-y border-sand bg-white py-16 sm:py-24">
        <div className="shell">
          <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="eyebrow text-ember-ink">Ölçü ve seri seçenekleri</p>
              <h2 id="modeller-baslik" className="display-3 mt-5">
                Modelinizi yakından tanıyın.
              </h2>
            </div>
            <p className="text-[16px] leading-relaxed text-steel lg:col-span-5">Modeli açın; teknik bilgileri, ölçü çizimlerini ve üretim detaylarını inceleyin.</p>
          </Reveal>
          <div className="mt-10">
            <ModelGrid models={grid} note={NOTE} />
          </div>
        </div>
      </section>

      {planning.length ? (
        <section aria-labelledby="planlama" className="relative overflow-hidden bg-bone py-16 sm:py-24">
          <span aria-hidden="true" className="pointer-events-none absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.14),transparent_65%)]" />
          <div className="shell relative grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow text-ember-ink">{family ? `${family.title} tasarımını planlarken` : "Planlarken"}</p>
              <h2 id="planlama" className="display-3 mt-5 text-balance">
                {family?.line ?? product.name}
              </h2>
            </Reveal>
            <Reveal className="space-y-6 lg:col-span-7" delay={0.1}>
              {planning.map((s) => (
                <RichText key={s.title} html={s.html} className="text-[17px]" />
              ))}
            </Reveal>
          </div>
        </section>
      ) : null}

      {faqs.length ? (
        <section aria-labelledby="aile-sss" className="bg-paper py-16 sm:py-24">
          <div className="shell grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow text-ember-ink">Seçiminizi netleştirin</p>
              <h2 id="aile-sss" className="display-3 mt-5">
                Merak ettikleriniz.
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-8" delay={0.1}>
              <FaqList items={faqs} />
            </Reveal>
          </div>
        </section>
      ) : null}

      <section id="teklif" aria-labelledby="teklif-baslik" className="scroll-mt-28 border-t border-sand bg-bone py-16 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow text-ember-ink">Teklif</p>
            <h2 id="teklif-baslik" className="display-2 mt-5">
              {product.name} için teklif alın
            </h2>
            <p className="lead mt-6 text-steel">Model kararınız netleşmediyse sorun değil. Mekânınızı ve beklentinizi paylaşın; seçimi birlikte yapalım.</p>
          </Reveal>
          <div className="lg:col-span-7">
            <RequestForm type="QUOTE" categories={form.categories} products={form.products} defaultCategoryId={product.categoryId} defaultProductId={product.id} sourcePath={path} submitLabel="Talebimi gönder" showroomToggle district />
          </div>
        </div>
      </section>

      <nav aria-labelledby="diger-aileler" className="bg-white py-14 sm:py-20">
        <div className="shell">
          <p id="diger-aileler" className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">
            Farklı formları da keşfedin
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {others.map(([slug, f]) => (
              <li key={slug}>
                <Link href={routes.product(slug)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-linen bg-paper px-4 text-[14px] font-semibold text-ink transition-colors hover:border-ink">
                  {f.title} <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-ember-ink" />
                </Link>
              </li>
            ))}
            <li>
              <Link href={routes.category(collection.slug)} className="inline-flex min-h-11 items-center px-4 text-[14px] font-semibold text-ember-ink underline-offset-4 hover:underline">
                Tüm koleksiyon
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {categoryArticle ? <SeoArticle html={categoryArticle.content} name={categoryArticle.name} /> : null}

      <ShowroomBlock />
      <MobileCta label="Teklif al" />
    </>
  );
}
