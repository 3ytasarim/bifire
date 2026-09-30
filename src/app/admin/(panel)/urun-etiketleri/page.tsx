import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { EmptyRow, PageHeader, Table } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { deleteBlogTag } from "../blog/actions";
import { deleteProductTag } from "./actions";

export const metadata = { title: "Etiketler" };

export default async function TagsPage() {
  const [productTags, blogTags] = await Promise.all([
    prisma.productTag.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } }),
    prisma.blogTag.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { posts: true } } } }),
  ]);
  return (
    <div className="space-y-10">
      <div>
        <PageHeader title="Ürün etiketleri" description="Etiketler ürün formunda virgülle yazılarak oluşturulur. Kullanılmayanları buradan silebilirsiniz." />
        <Table head={["Etiket", "Slug", "Ürün", ""]} empty={productTags.length ? null : <EmptyRow text="Etiket yok." />}>
          {productTags.map((t) => (
            <tr key={t.id}>
              <td className="px-4 py-3 font-medium">{t.name}</td>
              <td className="px-4 py-3 text-neutral-500">{t.slug}</td>
              <td className="px-4 py-3 tabular-nums">{t._count.products}</td>
              <td className="px-4 py-3 text-right">
                <ConfirmAction compact action={deleteProductTag.bind(null, t.id)} title={`“${t.name}” silinsin mi?`} description="Etiket ürünlerden kaldırılır; ürünler silinmez." />
              </td>
            </tr>
          ))}
        </Table>
      </div>
      <div>
        <PageHeader title="Blog etiketleri" />
        <Table head={["Etiket", "Slug", "Yazı", ""]} empty={blogTags.length ? null : <EmptyRow text="Etiket yok." />}>
          {blogTags.map((t) => (
            <tr key={t.id}>
              <td className="px-4 py-3 font-medium">{t.name}</td>
              <td className="px-4 py-3 text-neutral-500">{t.slug}</td>
              <td className="px-4 py-3 tabular-nums">{t._count.posts}</td>
              <td className="px-4 py-3 text-right">
                <ConfirmAction compact action={deleteBlogTag.bind(null, t.id)} title={`“${t.name}” silinsin mi?`} description="Etiket yazılardan kaldırılır; yazılar silinmez." />
              </td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}
