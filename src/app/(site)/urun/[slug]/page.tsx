import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, FileText, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProductCard, ProjectCard } from "@/components/site/Cards";
import { WhatsappIcon } from "@/components/site/Icons";
import { JsonLd } from "@/components/site/JsonLd";
import { ProductGallery } from "@/components/site/ProductGallery";
import { Button3D } from "@/components/ui/button-3d";
import { RequestForm } from "@/components/site/RequestForm";
import { RichText } from "@/components/site/RichText";
import { keyFacts, routes, technicalRows, type TechRow } from "@/lib/catalog";
import { getFormOptions, getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { getSiteSettings, telHref, whatsappHref } from "@/lib/settings";
import { getImageMeta } from "@/lib/seo/image-meta";
import { breadcrumbNode, graph, ids, imageNode, productNode, webPageNode, type Crumb } from "@/lib/seo/json-ld";
import { buildEntityMetadata, deriveDescription } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
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

  const baseAlt = product.coverImageAlt || product.name;
  const gallery = [
    ...(product.coverImage ? [{ url: product.coverImage, alt: baseAlt, width: null, height: null }] : []),
    ...product.images.filter((i) => i.url !== product.coverImage).map((i, n) => ({ url: i.url, alt: i.alt || `${product.name} — görsel ${n + 2}`, width: i.width, height: i.height })),
  ];
  const facts = keyFacts(product);
  const rows = technicalRows(product, product.specifications);
  const description = deriveDescription(product.shortDescription, product.description) || product.name;
  const primary = gallery[0];
  const primaryMeta = primary ? await getImageMeta(primary.url) : null;
  const wa = whatsappHref(settings, `Ürün: ${product.name} — ${absoluteUrl(path)}`);

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
            properties: rows.filter((r) => r.label !== "Marka" && r.label !== "Model kodu").map((r) => ({ name: r.label, value: r.raw ?? r.value, unitText: r.unit })),
          }),
        )}
      />

      <article className="bg-paper">
        <div className="shell pt-8 pb-16 sm:pt-10 lg:pb-24">
          <Breadcrumbs items={crumbs} />
          <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <ProductGallery images={gallery} name={product.name} />
            </div>

            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-32">
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

                <div className="mt-8 flex flex-col gap-3">
                  <Button3D href="#teklif" tone="ember" size="lg" fullWidth>
                    Bu ürün için teklif al <ArrowRight aria-hidden="true" className="h-4 w-4" />
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
              </div>
            </div>
          </div>
        </div>

        {product.description || product.features.length ? (
          <section aria-labelledby="urun-aciklama" className="border-t border-sand bg-bone py-16 sm:py-24">
            <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-7">
                <h2 id="urun-aciklama" className="display-3">
                  Ürün hakkında
                </h2>
                <RichText html={product.description} className="mt-8" />
              </div>
              {product.features.length ? (
                <div className="lg:col-span-5">
                  <h2 className="display-3">Öne çıkan özellikler</h2>
                  <ul className="mt-8 space-y-4">
                    {product.features.map((f) => (
                      <li key={f.id} className="flex gap-4 border-b border-sand pb-4 text-[16px] text-ink">
                        <Check aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-ember" />
                        {f.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {rows.length ? (
          <section aria-labelledby="teknik" className="py-16 sm:py-24">
            <div className="shell grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h2 id="teknik" className="display-3">
                  Teknik özellikler
                </h2>
                <p className="mt-4 max-w-sm text-[15px] text-steel">Değerler üretici verisidir; uygulama koşullarına göre farklılık gösterebilir.</p>
              </div>
              <div className="space-y-10 lg:col-span-8">
                {groupRows(rows).map(([group, items]) => (
                  <table key={group} className="w-full border-collapse text-left text-[15px]">
                    <caption className="pb-3 text-left text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">{group}</caption>
                    <tbody>
                      {items.map((r) => (
                        <tr key={`${group}-${r.label}`} className="border-t border-sand">
                          <th scope="row" className="w-1/2 py-4 pr-4 font-medium text-steel">
                            {r.label}
                          </th>
                          <td className="py-4 font-semibold text-ink">
                            {r.value}
                            {r.unit ? ` ${r.unit}` : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ))}
              </div>
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

      <section id="teklif" aria-labelledby="teklif-baslik" className="scroll-mt-28 border-t border-sand bg-bone py-16 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-ember-ink">Teklif</p>
            <h2 id="teklif-baslik" className="display-2 mt-5">
              {product.name} için teklif alın
            </h2>
            <p className="lead mt-6 text-steel">Mekân ölçülerinizi ve beklentinizi paylaşın; uygulama detaylarıyla birlikte size özel teklif hazırlayalım.</p>
          </div>
          <div className="lg:col-span-7">
            <RequestForm
              type="QUOTE"
              categories={formCategories}
              products={formProducts}
              defaultCategoryId={product.categoryId}
              defaultProductId={product.id}
              sourcePath={path}
              submitLabel="Teklif iste"
            />
          </div>
        </div>
      </section>

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
