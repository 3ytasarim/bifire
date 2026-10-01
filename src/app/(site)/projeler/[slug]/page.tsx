import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard, ProjectCard } from "@/components/site/Cards";
import { FinalCta } from "@/components/site/FinalCta";
import { ImageGrid } from "@/components/site/ImageGrid";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/site/RichText";
import { formatDate, routes } from "@/lib/catalog";
import { getOtherProjects, getProjectBySlug } from "@/lib/queries";
import { getImageMeta } from "@/lib/seo/image-meta";
import { breadcrumbNode, graph, imageNode, webPageNode, type Crumb } from "@/lib/seo/json-ld";
import { buildEntityMetadata, deriveDescription } from "@/lib/seo/metadata";

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) return {};
  return buildEntityMetadata({
    name: p.title,
    path: routes.project(p.slug),
    seo: p,
    fallbackDescription: [p.shortDescription, p.content],
    image: p.coverImage,
    imageAlt: p.coverImageAlt || p.title,
  });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const others = await getOtherProjects(project.id);
  const path = routes.project(project.slug);
  const crumbs: Crumb[] = [
    { name: "Ana Sayfa", path: "/" },
    { name: "Projeler", path: routes.projects },
    { name: project.title, path },
  ];
  const images = project.images.map((i, n) => ({ url: i.url, alt: i.alt || `${project.title} — görsel ${n + 1}`, width: i.width, height: i.height }));
  const coverMeta = project.coverImage ? await getImageMeta(project.coverImage) : null;
  const facts = [
    { label: "Lokasyon", value: project.location },
    { label: "Proje tipi", value: project.projectType },
    { label: "Tamamlanma", value: project.completedAt ? formatDate(project.completedAt) : null },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value));

  return (
    <>
      <JsonLd
        data={graph(
          project.coverImage ? imageNode(path, { url: project.coverImage, alt: project.coverImageAlt || project.title, meta: coverMeta }) : null,
          webPageNode({
            path,
            name: project.title,
            description: deriveDescription(project.shortDescription, project.content),
            hasBreadcrumb: true,
            hasPrimaryImage: Boolean(project.coverImage),
            dateModified: project.updatedAt,
          }),
          breadcrumbNode(path, crumbs),
        )}
      />
      <PageHero crumbs={crumbs} eyebrow={project.location ?? "Proje"} title={project.title} intro={project.shortDescription} image={project.coverImage} imageAlt={project.coverImageAlt || project.title} />

      <article className="bg-paper py-16 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          {facts.length ? (
            <aside className="lg:col-span-4">
              <dl className="border-t border-sand lg:sticky lg:top-32">
                {facts.map((f) => (
                  <div key={f.label} className="flex justify-between gap-6 border-b border-sand py-5">
                    <dt className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">{f.label}</dt>
                    <dd className="text-right font-semibold text-ink">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          ) : null}
          <div className={facts.length ? "lg:col-span-8" : "lg:col-span-8 lg:col-start-3"}>
            <RichText html={project.content} />
          </div>
        </div>
        {images.length ? (
          <div className="shell mt-16 sm:mt-24">
            <h2 className="display-3 mb-8">Proje galerisi</h2>
            <ImageGrid images={images} />
          </div>
        ) : null}
      </article>

      {project.products.length ? (
        <section aria-labelledby="kullanilan-urunler" className="border-t border-sand bg-bone py-16 sm:py-24">
          <div className="shell">
            <h2 id="kullanilan-urunler" className="display-3">
              Bu projede kullanılan ürünler
            </h2>
            <ul className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
              {project.products.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {others.length ? (
        <section aria-labelledby="diger-projeler" className="bg-paper py-16 sm:py-24">
          <div className="shell">
            <h2 id="diger-projeler" className="display-3">
              Diğer projeler
            </h2>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <li key={p.id}>
                  <ProjectCard project={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
      <FinalCta title="Benzer bir proje mi planlıyorsunuz?" context={`Proje: ${project.title}`} />
    </>
  );
}
