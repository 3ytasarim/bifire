import { HOME } from "@/content/home";
import type { ProjectCardData } from "@/lib/queries";
import { ProjectCard } from "@/components/site/Cards";
import { SectionHeading } from "@/components/site/SectionHeading";

/** Editoryal düzen: ilk proje dikey büyük, diğerleri yanında. */
export function FeaturedProjects({ projects }: { projects: ProjectCardData[] }) {
  if (!projects.length) return null;
  const p = HOME.projects;
  const [lead, ...rest] = projects;
  return (
    <section aria-labelledby="home-projects" className="bg-anthracite py-20 text-white sm:py-28 lg:py-36">
      <div className="shell">
        <SectionHeading id="home-projects" tone="light" eyebrow={p.eyebrow} title={p.title} intro={p.intro} action={{ label: "Tüm projeler", href: "/projeler" }} />
        <div className="mt-14 grid gap-5 sm:mt-20 lg:grid-cols-12">
          {lead ? (
            <div className="reveal lg:col-span-5">
              <ProjectCard project={lead} tall sizes="(min-width: 1024px) 42vw, 100vw" />
            </div>
          ) : null}
          {rest.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-1 xl:grid-cols-2">
              {rest.slice(0, 4).map((x) => (
                <div key={x.id} className="reveal">
                  <ProjectCard project={x} sizes="(min-width: 1280px) 29vw, (min-width: 1024px) 58vw, (min-width: 640px) 50vw, 100vw" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
