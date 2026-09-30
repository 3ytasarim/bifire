import { PageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { CategoryForm } from "../CategoryForm";

export const metadata = { title: "Yeni kategori" };

export default async function NewCategoryPage() {
  const parents = await prisma.productCategory.findMany({ where: { parentId: null }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } });
  return (
    <div>
      <PageHeader title="Yeni kategori" back={{ label: "Kategoriler", href: "/admin/kategoriler" }} />
      <CategoryForm parents={parents} />
    </div>
  );
}
