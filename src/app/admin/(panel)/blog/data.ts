import "server-only";
import { prisma } from "@/lib/db";
import type { PostFormData } from "./PostForm";

export function getProductOptions() {
  return prisma.product
    .findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, category: { select: { name: true } } } })
    .then((rows) => rows.map((r) => ({ id: r.id, label: r.name, hint: r.category.name })));
}

export function getKnownTags() {
  return prisma.blogTag.findMany({ orderBy: { name: "asc" }, select: { name: true } }).then((r) => r.map((t) => t.name));
}

/** datetime-local için Türkiye saatiyle "YYYY-MM-DDTHH:mm". */
function toLocalInput(d: Date | null): string {
  if (!d) return "";
  return new Date(d.getTime() + 3 * 3600_000).toISOString().slice(0, 16);
}

export async function getPostForm(id: string): Promise<(PostFormData & { updatedAt: Date }) | null> {
  const p = await prisma.blogPost.findUnique({ where: { id }, include: { tags: { select: { name: true } }, products: { select: { id: true } } } });
  if (!p) return null;
  const { tags, products, publishedAt, ...rest } = p;
  return { ...rest, publishedAt: toLocalInput(publishedAt), tags: tags.map((t) => t.name).join(", "), productIds: products.map((x) => x.id) };
}
