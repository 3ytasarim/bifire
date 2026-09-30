import type { Metadata } from "next";
import { ProjectCard } from "@/components/site/Cards";
import { EmptyState } from "@/components/site/EmptyState";
import { FinalCta } from "@/components/site/FinalCta";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { routes } from "@/lib/catalog";
import { getProjects } from "@/lib/queries";
import { breadcrumbNode, graph, itemListNode, webPageNode } from "@/lib/seo/json-ld";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { STATIC_PAGES } from "@/lib/seo/static-pages";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("projeler");
}

const CRUMBS = [
  { name: "Ana Sayfa", path: "/" },
  { name: "Projeler", path: routes.projects },
];

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path: routes.projects, name: "Projeler", description: STATIC_PAGES.projeler.defaults.description, type: "CollectionPage", hasBreadcrumb: true }),
          breadcrumbNode(routes.projects, CRUMBS),
          projects.length ? itemListNode(routes.projects, projects.map((p) => ({ name: p.title, path: routes.project(p.slug) }))) : null,
        )}
      />
      <PageHero
        crumbs={CRUMBS}
        eyebrow="Uygulamalar"
        title="Projelerimiz"
        intro="Konut, villa ve ticari mekânlarda tamamlanan şömine uygulamaları. Her proje; mekânın mimarisine, ısıtma ihtiyacına ve kullanım alışkanlığına göre ayrı ayrı planlandı."
      />
      <section aria-label="Proje listesi" className="bg-paper py-16 sm:py-24">
        <div className="shell">
          {projects.length ? (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p, i) => (
                <li key={p.id} className={i === 0 ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : ""}>
                  <ProjectCard project={p} tall={i === 0} sizes={i === 0 ? "(min-width: 1024px) 66vw, 100vw" : undefined} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Projeler yakında burada" text="Tamamlanan uygulamalarımız kısa süre içinde yayınlanacak." action={{ label: "Projenizi konuşalım", href: routes.quote }} />
          )}
        </div>
      </section>
      <FinalCta />
    </>
  );
}
