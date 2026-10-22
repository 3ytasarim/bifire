import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { Flash, PageHeader } from "@/components/admin/ui";
import { routes } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { deleteCategory } from "../actions";
import { CategoryForm } from "../CategoryForm";

export const metadata = { title: "Kategori düzenle" };

export default async function EditCategoryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ kaydedildi?: string }> }) {
  const [{ id }, { kaydedildi }] = await Promise.all([params, searchParams]);
  const [category, parents] = await Promise.all([
    prisma.productCategory.findUnique({ where: { id } }),
    prisma.productCategory.findMany({ where: { parentId: null }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!category) notFound();
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title={category.name} back={{ label: "Kategoriler", href: "/admin/kategoriler" }} />
        <div className="flex gap-2">
          <a href={routes.category(category.slug)} target="_blank" className="inline-flex min-h-11 items-center border border-neutral-300 bg-white px-4 text-sm hover:border-ink">Sitede gör</a>
          <ConfirmAction action={deleteCategory.bind(null, category.id)} redirectTo="/admin/kategoriler" title={`“${category.name}” silinsin mi?`} description="Bu işlem geri alınamaz. İçinde ürün veya alt kategori varsa silme engellenir." />
        </div>
      </div>
      <Flash message={kaydedildi ? "Kategori kaydedildi." : null} />
      <CategoryForm key={category.updatedAt.toISOString()} category={category} parents={parents} />
    </div>
  );
}
