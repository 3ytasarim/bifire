import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Star } from "lucide-react";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { AdminPagination, Badge, EmptyRow, ListToolbar, PageHeader, PAGE_SIZE, pageOf, Table } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { deleteProduct, toggleProductFlag } from "./actions";
import { getCategoryOptions } from "./data";

export const metadata = { title: "Ürünler" };

type SP = { q?: string; kategori?: string; durum?: string; sirala?: string; sayfa?: string };

const SORTS: Record<string, Prisma.ProductOrderByWithRelationInput[]> = {
  sira: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  yeni: [{ createdAt: "desc" }],
  guncel: [{ updatedAt: "desc" }],
  ad: [{ name: "asc" }],
};

export default async function ProductsAdminPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = pageOf(sp.sayfa);
  const q = sp.q?.trim().slice(0, 80);
  const where: Prisma.ProductWhereInput = {
    AND: [
      q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { modelCode: { contains: q, mode: "insensitive" } }, { slug: { contains: q } }] } : {},
      sp.kategori ? { OR: [{ categoryId: sp.kategori }, { category: { parentId: sp.kategori } }] } : {},
      sp.durum === "aktif" ? { active: true } : sp.durum === "pasif" ? { active: false } : sp.durum === "one-cikan" ? { featured: true } : {},
    ],
  };
  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: SORTS[sp.sirala ?? "sira"] ?? SORTS.sira,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, name: true, slug: true, coverImage: true, active: true, featured: true, sortOrder: true, updatedAt: true, category: { select: { name: true } } },
    }),
    prisma.product.count({ where }),
    getCategoryOptions(),
  ]);

  return (
    <div>
      <PageHeader title="Ürünler" description={`${total} ürün`} action={{ label: "Yeni ürün", href: "/admin/urunler/yeni" }} />
      <ListToolbar
        q={q}
        placeholder="Ürün adı veya model kodu…"
        filters={[
          { name: "kategori", label: "Kategori", value: sp.kategori, options: categories.map((c) => ({ value: c.id, label: c.parentName ? `${c.parentName} › ${c.name}` : c.name })) },
          { name: "durum", label: "Durum", value: sp.durum, options: [{ value: "aktif", label: "Aktif" }, { value: "pasif", label: "Pasif" }, { value: "one-cikan", label: "Öne çıkan" }] },
          { name: "sirala", label: "Sıralama", value: sp.sirala, options: [{ value: "yeni", label: "En yeni" }, { value: "guncel", label: "Son güncellenen" }, { value: "ad", label: "Ada göre" }] },
        ]}
      />
      <Table
        head={["", "Ürün", "Kategori", "Öne çıkan", "Durum", "Sıra", ""]}
        empty={products.length ? null : <EmptyRow text={q || sp.kategori || sp.durum ? "Filtreye uyan ürün yok." : "Henüz ürün yok."} action={{ label: "Ürün ekle", href: "/admin/urunler/yeni" }} />}
      >
        {products.map((p) => (
          <tr key={p.id} className="hover:bg-neutral-50">
            <td className="w-16 px-4 py-3">
              <div className="relative h-12 w-12 bg-neutral-100">{p.coverImage ? <Image src={p.coverImage} alt="" fill sizes="48px" className="object-cover" /> : null}</div>
            </td>
            <td className="px-4 py-3">
              <Link href={`/admin/urunler/${p.id}`} className="font-medium hover:underline">
                {p.name}
              </Link>
              <p className="text-xs text-neutral-400">/urun/{p.slug}</p>
            </td>
            <td className="px-4 py-3 text-neutral-600">{p.category.name}</td>
            <td className="px-4 py-3">
              <form action={toggleProductFlag.bind(null, p.id, "featured")}>
                <button type="submit" aria-label={p.featured ? "Öne çıkarmayı kaldır" : "Öne çıkar"} className="flex h-9 w-9 items-center justify-center hover:bg-neutral-100">
                  <Star className={`h-4 w-4 ${p.featured ? "fill-ember text-ember" : "text-neutral-300"}`} />
                </button>
              </form>
            </td>
            <td className="px-4 py-3">
              <form action={toggleProductFlag.bind(null, p.id, "active")}>
                <button type="submit" title="Durumu değiştir">
                  {p.active ? <Badge tone="green">Aktif</Badge> : <Badge>Pasif</Badge>}
                </button>
              </form>
            </td>
            <td className="px-4 py-3 tabular-nums">{p.sortOrder}</td>
            <td className="px-4 py-3 text-right">
              <ConfirmAction compact action={deleteProduct.bind(null, p.id)} title={`“${p.name}” silinsin mi?`} description="Ürün, görsel kayıtları, teknik özellikleri ve dokümanlarıyla birlikte silinir. Bu ürüne ait talepler korunur." />
            </td>
          </tr>
        ))}
      </Table>
      <AdminPagination page={page} pages={Math.ceil(total / PAGE_SIZE)} params={{ q, kategori: sp.kategori, durum: sp.durum, sirala: sp.sirala }} />
    </div>
  );
}
