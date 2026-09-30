import { PageHeader } from "@/components/admin/ui";
import { getProductOptions } from "../data";
import { ProjectForm } from "../ProjectForm";

export const metadata = { title: "Yeni proje" };

export default async function NewProjectPage() {
  return (
    <div>
      <PageHeader title="Yeni proje" back={{ label: "Projeler", href: "/admin/projeler" }} />
      <ProjectForm products={await getProductOptions()} />
    </div>
  );
}
