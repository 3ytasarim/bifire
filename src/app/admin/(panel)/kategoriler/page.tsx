import Image from "next/image";
import Link from "next/link";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { Badge, EmptyRow, PageHeader, Table } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { deleteCategory, toggleCategoryActive } from "./actions";

export const metadata = { title: "Kategoriler" };

export default async function CategoriesPage() {
  const all = await prisma.productCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true, children: true } } },
  });
  // Ağaç sırası: ana kategori, hemen ardından alt kategorileri.
  const rows = all.filter((c) => !c.parentId).flatMap((p) => [p, ...all.filter((c) => c.parentId === p.id)]);

  return (
    <div>
      <PageHeader title="Kategoriler" description="Ürün kategorileri ve alt kategoriler. Silme, içinde ürün veya alt kategori varsa engellenir." action={{ label: "Yeni kategori", href: "/admin/kategoriler/yeni" }} />
      <Table
        head={["", "Kategori", "Ürün", "Sıra", "Durum", ""]}
        empty={rows.length ? null : <EmptyRow text="Henüz kategori yok." action={{ label: "İlk kategoriyi ekle", href: "/admin/kategoriler/yeni" }} />}
      >
        {rows.map((c) => (
          <tr key={c.id} className="hover:bg-neutral-50">
            <td className="w-16 px-4 py-3">
              <div className="relative h-12 w-12 bg-neutral-100">{c.image ? <Image src={c.image} alt="" fill sizes="48px" className="object-cover" /> : null}</div>
            </td>
            <td className="px-4 py-3">
              <Link href={`/admin/kategoriler/${c.id}`} className={`font-medium hover:underline ${c.parentId ? "pl-6 before:mr-2 before:text-neutral-400 before:content-['↳']" : ""}`}>
                {c.name}
              </Link>
              <p className={`text-xs text-neutral-400 ${c.parentId ? "pl-6" : ""}`}>/urunler/{c.slug}</p>
            </td>
            <td className="px-4 py-3 tabular-nums">{c._count.products}</td>
            <td className="px-4 py-3 tabular-nums">{c.sortOrder}</td>
            <td className="px-4 py-3">
              <form action={toggleCategoryActive.bind(null, c.id)}>
                <button type="submit" title="Durumu değiştir">
                  {c.active ? <Badge tone="green">Aktif</Badge> : <Badge>Pasif</Badge>}
                </button>
              </form>
            </td>
            <td className="px-4 py-3 text-right">
              <ConfirmAction compact action={deleteCategory.bind(null, c.id)} title={`“${c.name}” silinsin mi?`} description="Bu işlem geri alınamaz. İçinde ürün veya alt kategori varsa silme engellenir." />
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
