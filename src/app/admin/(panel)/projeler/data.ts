import "server-only";
import { prisma } from "@/lib/db";
import type { ProjectFormData } from "./ProjectForm";

export function getProductOptions() {
  return prisma.product
    .findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, category: { select: { name: true } } } })
    .then((rows) => rows.map((r) => ({ id: r.id, label: r.name, hint: r.category.name })));
}

export async function getProjectForm(id: string): Promise<(ProjectFormData & { updatedAt: Date }) | null> {
  const p = await prisma.project.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } }, products: { select: { id: true } } } });
  if (!p) return null;
  const { images, products, completedAt, ...rest } = p;
  return {
    ...rest,
    completedAt: completedAt ? completedAt.toISOString().slice(0, 10) : "",
    gallery: images.map((i) => ({ url: i.url, alt: i.alt ?? "" })),
    productIds: products.map((x) => x.id),
  };
}
