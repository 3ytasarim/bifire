import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { Flash, PageHeader } from "@/components/admin/ui";
import { deleteProject } from "../actions";
import { getProductOptions, getProjectForm } from "../data";
import { ProjectForm } from "../ProjectForm";

export const metadata = { title: "Proje düzenle" };

export default async function EditProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ kaydedildi?: string }> }) {
  const [{ id }, { kaydedildi }] = await Promise.all([params, searchParams]);
  const [project, products] = await Promise.all([getProjectForm(id), getProductOptions()]);
  if (!project) notFound();
  const { updatedAt, ...form } = project;
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title={project.title} back={{ label: "Projeler", href: "/admin/projeler" }} />
        <div className="flex gap-2">
          <a href={`/projeler/${project.slug}`} target="_blank" className="inline-flex min-h-11 items-center border border-neutral-300 bg-white px-4 text-sm hover:border-ink">Sitede gör</a>
          <ConfirmAction action={deleteProject.bind(null, project.id)} redirectTo="/admin/projeler" title={`“${project.title}” silinsin mi?`} description="Proje ve galeri kayıtları silinir. İlişkili ürünler etkilenmez." />
        </div>
      </div>
      <Flash message={kaydedildi ? "Proje kaydedildi." : null} />
      <ProjectForm key={updatedAt.toISOString()} project={form} products={products} />
    </div>
  );
}
