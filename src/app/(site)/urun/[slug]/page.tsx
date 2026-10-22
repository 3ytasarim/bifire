import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, FileText, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PostCard, ProductCard, ProjectCard } from "@/components/site/Cards";
import { CountUp, ParallaxFrame, Reveal, Stagger, StaggerItem } from "@/components/motion/Motion";
import { FaqList } from "@/components/site/FaqList";
import { MobileCta } from "@/components/site/MobileCta";
import { ProcessSteps } from "@/components/site/ProcessSteps";
import { ProductOptions } from "@/components/site/ProductOptions";
import { ProductSpecs, VariantHighlights, type SpecItem, type VariantRow } from "@/components/site/ProductSpecs";
import { ProductDrawings } from "@/components/site/ProductDrawings";
import { DesignTogether } from "@/components/site/DesignTogether";
import { familyOf } from "@/lib/collection";
import { CODE_LABEL, splitVariant } from "@/lib/variants";
import { ShowroomBlock } from "@/components/site/ShowroomBlock";
import { TrustPoints } from "@/components/site/TrustPoints";
import { WhatsappIcon } from "@/components/site/Icons";
import { JsonLd } from "@/components/site/JsonLd";
import { ProductGallery } from "@/components/site/ProductGallery";
import { Button3D } from "@/components/ui/button-3d";
import { RequestForm } from "@/components/site/RequestForm";
import { RichText } from "@/components/site/RichText";
import { keyFacts, routes, technicalRows, type TechRow } from "@/lib/catalog";
import { getCollectionSiblings, getFormOptions, getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { getSiteSettings, telHref, whatsappHref } from "@/lib/settings";
import { getImageMeta } from "@/lib/seo/image-meta";
import { breadcrumbNode, faqNode, graph, ids, imageNode, productNode, webPageNode, type Crumb } from "@/lib/seo/json-ld";
import { buildEntityMetadata, deriveDescription } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
import { splitHtmlSections } from "@/lib/html-sections";
import { FamilyView } from "@/components/collection/FamilyView";
import { buildModels } from "@/lib/models";
import { FEATURES } from "@/lib/features";

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return {};
  return buildEntityMetadata({
    name: p.name,
    path: routes.product(p.slug),
    seo: p,
    fallbackDescription: [p.shortDescription, p.description],
    image: p.coverImage,
    imageAlt: p.coverImageAlt || p.name,
  });
}

/** Seçenek satırlarını grup adına göre toplar (sıra korunur). */
function groupOptions(options: { group: string; value: string }[]) {
  const groups = new Map<string, string[]>();
  for (const o of options) groups.set(o.group, [...(groups.get(o.group) ?? []), o.value]);
  return [...groups.entries()].map(([name, values]) => ({ name, values }));
}

function groupRows(rows: TechRow[]) {
  const groups = new Map<string, TechRow[]>();
  for (const r of rows) {
    const g = r.group || "Teknik özellikler";
    groups.set(g, [...(groups.get(g) ?? []), r]);
  }
  return [...groups.entries()];
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, [formCategories, formProducts], settings] = await Promise.all([getRelatedProducts(product), getFormOptions(), getSiteSettings()]);

  const path = routes.product(product.slug);
  const category = product.category;
  const parent = category.parent?.active ? category.parent : null;
  const crumbs: Crumb[] = [
    { name: "Ana Sayfa", path: "/" },
    { name: "Ürünler", path: routes.products },
    ...(parent ? [{ name: parent.name, path: routes.category(parent.slug) }] : []),
    { name: category.name, path: routes.category(category.slug) },
    { name: product.name, path },
  ];

  // Koleksiyon ailesi (modelleri olan ürün, ör. U Tipi): sade aile sayfası; ayrıntı her modelin kendi sayfasında.
  const models = buildModels(product);
  if (models.length) return <FamilyView product={product} models={models} crumbs={crumbs} settings={settings} form={{ categories: formCategories, products: formProducts }} siblings={await getCollectionSiblings(product)} />;

  const baseAlt = product.coverImageAlt || product.name;
  const gallery = [
    ...(product.coverImage ? [{ url: product.coverImage, alt: baseAlt, width: null, height: null }] : []),
    ...product.images.filter((i) => i.url !== product.coverImage).map((i, n) => ({ url: i.url, alt: i.alt || `${product.name} — görsel ${n + 2}`, width: i.width, height: i.height })),
  ];
  const facts = keyFacts(product);
  // Seçeneğe bağlı (variant) satırlar ölçüye göre değişen değerlerdir; diğerleri tüm ölçüler için geçerlidir.
  const rows = technicalRows(product, product.specifications.filter((sp) => !sp.variant));
  const variantSpecs = product.specifications.filter((sp) => sp.variant);
  const variantRows: VariantRow[] = [];
  for (const sp of variantSpecs) {
    let row = variantRows.find((r) => r.label === sp.label);
    if (!row) variantRows.push((row = { label: sp.label, unit: sp.unit, values: {} }));
    row.values[sp.variant!] = sp.value;
  }
  const description = deriveDescription(product.shortDescription, product.description) || product.name;
  const primary = gallery[0];
  const primaryMeta = primary ? await getImageMeta(primary.url) : null;
  const wa = whatsappHref(settings, `Ürün: ${product.name} — ${absoluteUrl(path)}`);
  const optionGroups = groupOptions(product.options);
  // Modeller: seçeneğe bağlı satırların anahtarları, veri sırasıyla ("70'lik" veya "Seri 01 / 70'lik").
  // Anahtarın parçaları hangi seçenek gruplarında geçiyorsa model o grupların (sırasıyla) birleşimidir.
  const variants = [...new Set(variantSpecs.map((sp) => sp.variant!))];
  const variantGroups = optionGroups.filter((g) => g.values.some((v) => variants.some((k) => splitVariant(k).includes(v)))).map((g) => g.name);
  const variantGroup = variantGroups.length ? variantGroups : null;
  const codeRow = variantRows.find((r) => r.label === CODE_LABEL) ?? null;
  const highlightRows = variantRows.filter((r) => r.label !== CODE_LABEL);
  const family = familyOf(product);
  const drawings = product.drawings.map((d, n) => ({ url: d.url, alt: d.alt || `${product.name} — ölçü çizimi ${n + 1}`, variant: d.variant, width: d.width, height: d.height }));
  // Ölçü seçimi olan üründe teknik tablo tek parça ve veri sırasıyla: ölçüye bağlı + sabit satırlar karışık.
  // Marka/Yakıt gibi ürün alanları ayrıca küçük "Genel" tablosunda kalır.
  const specItems: SpecItem[] = [];
  if (variantGroup) {
    for (const sp of product.specifications) {
      if (sp.variant) {
        const row = variantRows.find((r) => r.label === sp.label);
        if (row && !specItems.some((it) => it.kind === "v" && it.label === sp.label)) specItems.push({ kind: "v", ...row });
      } else {
        specItems.push({ kind: "c", label: sp.label, value: sp.value, unit: sp.unit });
      }
    }
  }
  const specCommon = variantGroup ? groupRows(technicalRows(product, [])) : groupRows(rows);
  const bullets = product.features.filter((f) => !f.title);
  const details = product.features.filter((f) => f.title);
  const faqs = product.faqs.map((f) => ({ q: f.question, a: f.answer }));
  const story = splitHtmlSections(product.description);
  // Açıklamanın yanında gösterilecek ikinci görsel (kapaktan farklı ilk galeri görseli).
  const bandImage = gallery.find((g, i) => i > 0) ?? null;
  // Sayfadaki gerçek veriden türetilen sayılar (uydurma istatistik yok).
  const stats = [
    ...optionGroups.map((g) => ({ value: g.values.length, label: `${g.name} seçeneği` })),
    ...(details.length ? [{ value: details.length, label: "Teknik detay" }] : []),
  ].slice(0, 4);

  return (
    <>
      <JsonLd
        data={graph(
          primary ? imageNode(path, { url: primary.url, alt: primary.alt, meta: primaryMeta }) : null,
          webPageNode({ path, name: product.name, description, type: "ItemPage", hasBreadcrumb: true, hasPrimaryImage: Boolean(primary), mainEntityId: ids.product(path), dateModified: product.updatedAt }),
          breadcrumbNode(path, crumbs),
          productNode({
            path,
            name: product.name,
            description,
            images: gallery.map((g) => g.url),
            category: category.name,
            modelCode: product.modelCode,
            brand: product.brand,
            properties: [
              ...rows.filter((r) => r.label !== "Marka" && r.label !== "Model kodu").map((r) => ({ name: r.label, value: r.raw ?? r.value, unitText: r.unit })),
              ...variantRows.flatMap((r) => variants.map((v) => ({ name: `${r.label} (${v})`, value: r.values[v] ?? "", unitText: r.unit }))).filter((x) => x.value),
            ],
          }),
          faqNode(path, faqs),
        )}
      />

      <article className="bg-paper">
        <div className="shell pt-8 pb-16 sm:pt-10 lg:pb-24">
          <Breadcrumbs items={crumbs} />
          <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-7" y={20}>
              <ProductGallery images={gallery} name={product.name} />
              {family ? (
                <dl className="mt-5 grid gap-3 rounded-[1.5rem] border border-linen bg-white p-5 sm:grid-cols-3 sm:p-6">
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase sm:col-span-3">Yerleşim yaklaşımı</p>
                  {[
                    ["Görünüm", family.view],
                    ["Yerleşim", family.place],
                    ["Tasarım odağı", family.focus],
                  ].map(([k, v]) => (
                    <div key={k} className="border-t border-sand pt-3">
                      <dt className="text-[11px] font-semibold tracking-[0.14em] text-stone uppercase">{k}</dt>
                      <dd className="mt-1 text-[14px] leading-snug font-semibold text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              <DesignTogether
                productName={product.name}
                categories={formCategories}
                products={formProducts}
                defaultCategoryId={product.categoryId}
                defaultProductId={product.id}
                sourcePath={path}
                initial={product.fuelType === "WOOD" ? { fuel: "wood" } : product.fuelType === "ELECTRIC" ? { fuel: "electric" } : product.fuelType === "BIOETHANOL" ? { fuel: "bio" } : undefined}
              />
            </Reveal>

            <div className="lg:col-span-5">
              <Reveal className="lg:sticky lg:top-32" delay={0.12} y={20}>
                <Link href={routes.category(category.slug)} className="eyebrow text-ember-ink hover:text-ink">
                  {category.name}
                </Link>
                <h1 className="display-2 mt-5">{product.name}</h1>
                {product.modelCode ? <p className="mt-3 text-sm tracking-[0.14em] text-stone uppercase">Model: {product.modelCode}</p> : null}
                {product.shortDescription ? <p className="lead mt-6 text-steel">{product.shortDescription}</p> : null}

                {facts.length ? (
                  <dl className="mt-8 grid grid-cols-2 gap-3">
                    {facts.map((f) => (
                      <div key={f.label} className="rounded-2xl bg-paper p-5">
                        <dt className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">{f.label}</dt>
                        <dd className="mt-2 font-display text-xl font-semibold text-ink">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                {optionGroups.length ? <ProductOptions groups={optionGroups} combo={variantGroups.length > 1 ? { groups: variantGroups, keys: variants } : undefined} /> : null}
                {variantGroup && variantRows.length ? <VariantHighlights groups={variantGroups} fallback={variants[0] ?? ""} rows={highlightRows} code={codeRow} /> : null}

                <div className="mt-8 flex flex-col gap-3">
                  <Button3D href="#teklif" tone="ember" size="lg" fullWidth>
                    {optionGroups.length ? "Seçtiğim model için teklif al" : "Bu ürün için teklif al"} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Button3D>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {wa ? (
                      <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-sand bg-white px-6 text-sm font-semibold text-ink transition-colors hover:border-[#1f7a4a] hover:text-[#1f7a4a]">
                        <WhatsappIcon className="h-4 w-4" /> WhatsApp
                      </a>
                    ) : null}
                    {settings.phone ? (
                      <a href={telHref(settings.phone)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-sand bg-white px-6 text-sm font-semibold text-ink transition-colors hover:border-ink">
                        <Phone aria-hidden="true" className="h-4 w-4" /> Hemen ara
                      </a>
                    ) : null}
                  </div>
                  <p className="text-[13px] leading-relaxed text-stone">Hazne, kaplama, baca ve montaj kapsamı projenize göre birlikte netleştirilir.</p>
                </div>

                <div className="mt-8 border-t border-sand pt-6">
                  <TrustPoints compact />
                </div>

                {product.documents.length ? (
                  <div className="mt-10">
                    <h2 className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">Dokümanlar</h2>
                    <ul className="mt-3 divide-y divide-sand border-y border-sand">
                      {product.documents.map((d) => (
                        <li key={d.id}>
                          <a href={d.url} target="_blank" rel="noopener" className="flex min-h-14 items-center gap-3 text-[15px] font-medium text-ink hover:text-ember-ink">
                            <FileText aria-hidden="true" className="h-5 w-5 text-ember" />
                            <span className="flex-1">{d.title}</span>
                            <span className="text-xs text-stone">PDF · {(d.size / 1024 / 1024).toFixed(1)} MB</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </Reveal>
            </div>
          </div>
        </div>

        {/* Ölçüye göre değişen değerler hero'da gösterildiği için sayaç şeridi yalnızca diğer ürünlerde. */}
        {!variantRows.length && stats.length >= 2 ? (
          <section aria-label="Model özeti" className="border-y border-sand bg-white">
            <div className="shell">
              <dl className={`grid grid-cols-2 divide-sand sm:divide-x ${stats.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
                {stats.map((st, i) => (
                  <Reveal key={st.label} delay={i * 0.08} y={16} className="px-2 py-8 sm:px-8 sm:py-10">
                    <dt className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">{st.label}</dt>
                    <dd className="mt-3 font-display text-5xl leading-none font-semibold tracking-[-0.03em] text-ink sm:text-6xl">
                      <CountUp value={st.value} />
                      <span className="text-ember">.</span>
                    </dd>
                  </Reveal>
                ))}
              </dl>
            </div>
          </section>
        ) : null}

        {rows.length || variantRows.length || drawings.length ? (
          <section aria-labelledby="teknik" className="bg-paper py-16 sm:py-24">
            <div className="shell grid gap-10 lg:grid-cols-12">
              <Reveal className="lg:col-span-4">
                <p className="eyebrow text-ember-ink">{variantGroup ? "Bifire ürün bilgileri" : "Teknik bilgiler"}</p>
                <h2 id="teknik" className="display-3 mt-5 text-balance">
                  {variantGroup ? "Seçiminizin teknik karşılığı." : "Teknik özellikler"}
                </h2>
                <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-steel">
                  {variantGroup
                    ? "Bir modelin görünümü kadar, projenize nasıl yerleşeceği de önemlidir. Seri ve ölçüyü değiştirerek teknik bilgileri ve ölçü çizimlerini inceleyebilirsiniz."
                    : "Değerler üretici verisidir; uygulama koşullarına göre farklılık gösterebilir."}
                </p>
              </Reveal>
              <div className="lg:col-span-8">
                <ProductSpecs groups={variantGroups} variants={variants} rows={variantRows} items={specItems} common={specCommon} note={variantGroup ? (family?.specNote ?? undefined) : undefined} />
                {variantGroup || drawings.length ? <ProductDrawings drawings={drawings} groups={variantGroups} fallback={variants[0] ?? ""} /> : null}
              </div>
            </div>
          </section>
        ) : null}

        {product.description || bullets.length ? (
          <section aria-labelledby="urun-aciklama" className="relative overflow-hidden bg-bone py-20 sm:py-28">
            <span aria-hidden="true" className="pointer-events-none absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.14),transparent_65%)]" />
            <div className="shell relative">
              <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
                <Reveal className={bandImage ? "lg:col-span-5" : "lg:col-span-8"}>
                  <p className="eyebrow text-ember-ink">Ürün hakkında</p>
                  <h2 id="urun-aciklama" className="display-2 mt-5 text-balance">
                    {product.name}
                  </h2>
                  {story.lead ? <RichText html={story.lead} className="lead mt-6 text-steel" /> : null}
                </Reveal>
                {bandImage ? (
                  <ParallaxFrame className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-[0_30px_60px_-30px_rgb(12_12_13/0.35)] lg:col-span-7">
                    <Image src={bandImage.url} alt={bandImage.alt} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
                  </ParallaxFrame>
                ) : null}
              </div>

              {story.sections.length ? (
                <Stagger className="mt-16 grid gap-4 md:grid-cols-2" as="ol">
                  {story.sections.map((sec, i) => (
                    <StaggerItem key={sec.title} className="group relative overflow-hidden rounded-[1.5rem] border border-linen bg-white p-7 transition-shadow duration-500 hover:shadow-[0_24px_48px_-28px_rgb(12_12_13/0.35)] sm:p-9">
                      <span aria-hidden="true" className="absolute top-5 right-6 font-display text-6xl leading-none font-semibold tracking-[-0.04em] text-sand transition-colors duration-500 group-hover:text-ember/40">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-ember transition-transform duration-700 ease-(--ease-premium) group-hover:scale-x-100" />
                      <h3 className="max-w-[80%] font-display text-2xl font-semibold text-ink">{sec.title}</h3>
                      <RichText html={sec.html} className="mt-4 text-[15px]" />
                    </StaggerItem>
                  ))}
                </Stagger>
              ) : null}

              {bullets.length ? (
                <div className="mt-16">
                  <h2 className="display-3">Öne çıkan özellikler</h2>
                  <Stagger className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {bullets.map((f) => (
                      <StaggerItem key={f.id} className="flex gap-3 rounded-2xl border border-linen bg-white p-5 text-[15px] font-medium text-ink">
                        <Check aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-ember" />
                        {f.text}
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {details.length ? (
          <section aria-labelledby="detaylar" className="bg-ink py-16 text-white sm:py-24">
            <div className="shell">
              <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-7">
                  <p className="eyebrow text-ember">{family ? "Bifire üretim detayları" : "Detayların uzmanlığı"}</p>
                  <h2 id="detaylar" className="display-3 mt-5 text-balance text-white">
                    {family ? "Tasarımın arkasındaki ayrıntılar." : "Ateşin ardında, düşünülmüş bir yapı."}
                  </h2>
                </div>
                <p className="text-[16px] leading-relaxed text-white/70 lg:col-span-5">
                  {family?.detailIntro ?? "Şöminenin karakterini yalnızca dış görünümü belirlemez. Seçimden uygulamaya kadar her detay, kullanım deneyiminin bir parçasıdır."}
                </p>
              </div>
              <Stagger as="ol" className="mt-12 grid gap-4 md:grid-cols-2">
                {details.map((f, i) => (
                  <StaggerItem
                    key={f.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors duration-500 hover:border-ember/50 hover:bg-white/[0.07] sm:p-8"
                  >
                    <span aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-ember/0 blur-3xl transition-colors duration-700 group-hover:bg-ember/25" />
                    <p className="text-[11px] font-semibold tracking-[0.2em] text-ember uppercase tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                      {f.label ? ` / ${f.label}` : ""}
                    </p>
                    <h3 className="mt-4 font-display text-xl font-semibold text-white sm:text-2xl">{f.title}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-white/70">{f.text}</p>
                    {f.note ? <p className="mt-auto border-t border-white/10 pt-4 text-[13px] font-medium text-white/55">{f.note}</p> : null}
                  </StaggerItem>
                ))}
              </Stagger>
              {family?.detailNote ? <p className="mt-8 max-w-3xl text-[13px] leading-relaxed text-white/50">{family.detailNote}</p> : null}
            </div>
          </section>
        ) : null}
      </article>

      {FEATURES.projects && product.projects.length ? (
        <section aria-labelledby="uygulamalar" className="bg-paper py-16 sm:py-24">
          <div className="shell">
            <h2 id="uygulamalar" className="display-3">
              Bu ürünün kullanıldığı projeler
            </h2>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {product.projects.map((pr) => (
                <li key={pr.id}>
                  <ProjectCard project={{ ...pr, shortDescription: null, completedAt: null }} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <ProcessSteps />

      {faqs.length ? (
        <section aria-labelledby="urun-sss" className="bg-paper py-16 sm:py-24">
          <div className="shell grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow text-ember-ink">Seçim yaparken</p>
              <h2 id="urun-sss" className="display-3 mt-5">
                Aklınızdaki sorular.
              </h2>
            </div>
            <FaqList items={faqs} className="lg:col-span-8" />
          </div>
        </section>
      ) : null}

      <section id="teklif" aria-labelledby="teklif-baslik" className="scroll-mt-28 border-t border-sand bg-bone py-16 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-ember-ink">Teklif</p>
            <h2 id="teklif-baslik" className="display-2 mt-5">
              {product.name} için teklif alın
            </h2>
            <p className="lead mt-6 text-steel">Mekân ölçülerinizi ve beklentinizi paylaşın; uygulama detaylarıyla birlikte size özel teklif hazırlayalım ya da Tuzla fabrika showroomumuzda görüşelim.</p>
          </div>
          <div className="lg:col-span-7">
            <RequestForm
              type="QUOTE"
              categories={formCategories}
              products={formProducts}
              defaultCategoryId={product.categoryId}
              defaultProductId={product.id}
              sourcePath={path}
              submitLabel="Talebimi gönder"
              showroomToggle
              district
            />
          </div>
        </div>
      </section>

      <ShowroomBlock />

      {product.blogPosts.length ? (
        <section aria-labelledby="rehber" className="bg-white py-16 sm:py-24">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow text-ember-ink">Bifire Şömine Rehberi</p>
                <h2 id="rehber" className="display-3 mt-5">
                  Kararınızı bilgiyle destekleyin.
                </h2>
              </div>
              <Link href={routes.blog} className="link-underline text-[13px] font-semibold tracking-[0.16em] text-ember-ink uppercase">
                Tüm rehberler
              </Link>
            </div>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {product.blogPosts.map((post) => (
                <li key={post.id}>
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <MobileCta label={optionGroups.length ? "Seçtiğim model için teklif al" : "Bu ürün için teklif al"} />

      {related.length ? (
        <section aria-labelledby="benzer" className="bg-paper py-16 sm:py-24">
          <div className="shell">
            <div className="flex items-end justify-between gap-6">
              <h2 id="benzer" className="display-3">
                Benzer modeller
              </h2>
              <Link href={routes.category(category.slug)} className="link-underline text-[13px] font-semibold tracking-[0.16em] text-ember-ink uppercase">
                Tümü
              </Link>
            </div>
            <ul className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
