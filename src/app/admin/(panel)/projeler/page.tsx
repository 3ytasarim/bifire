import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Star } from "lucide-react";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { AdminPagination, Badge, EmptyRow, ListToolbar, PageHeader, PAGE_SIZE, pageOf, Table } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { deleteProject, toggleProjectFlag } from "./actions";

export const metadata = { title: "Projeler" };

export default async function ProjectsAdminPage({ searchParams }: { searchParams: Promise<{ q?: string; durum?: string; sayfa?: string }> }) {
  const sp = await searchParams;
  const page = pageOf(sp.sayfa);
  const q = sp.q?.trim().slice(0, 80);
  const where: Prisma.ProjectWhereInput = {
    AND: [
      q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { location: { contains: q, mode: "insensitive" } }] } : {},
      sp.durum === "aktif" ? { active: true } : sp.durum === "pasif" ? { active: false } : sp.durum === "one-cikan" ? { featured: true } : {},
    ],
  };
  const [projects, total] = await Promise.all([
    prisma.project.findMany({ where, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.project.count({ where }),
  ]);

  return (
    <div>
      <PageHeader title="Projeler" description={`${total} proje`} action={{ label: "Yeni proje", href: "/admin/projeler/yeni" }} />
      <ListToolbar q={q} placeholder="Proje adı veya lokasyon…" filters={[{ name: "durum", label: "Durum", value: sp.durum, options: [{ value: "aktif", label: "Aktif" }, { value: "pasif", label: "Pasif" }, { value: "one-cikan", label: "Öne çıkan" }] }]} />
      <Table head={["", "Proje", "Lokasyon", "Öne çıkan", "Durum", "Sıra", ""]} empty={projects.length ? null : <EmptyRow text="Proje bulunamadı." action={{ label: "Proje ekle", href: "/admin/projeler/yeni" }} />}>
        {projects.map((p) => (
          <tr key={p.id} className="hover:bg-neutral-50">
            <td className="w-16 px-4 py-3">
              <div className="relative h-12 w-12 bg-neutral-100">{p.coverImage ? <Image src={p.coverImage} alt="" fill sizes="48px" className="object-cover" /> : null}</div>
            </td>
            <td className="px-4 py-3">
              <Link href={`/admin/projeler/${p.id}`} className="font-medium hover:underline">
                {p.title}
              </Link>
              <p className="text-xs text-neutral-400">/projeler/{p.slug}</p>
            </td>
            <td className="px-4 py-3 text-neutral-600">{p.location ?? "—"}</td>
            <td className="px-4 py-3">
              <form action={toggleProjectFlag.bind(null, p.id, "featured")}>
                <button type="submit" aria-label={p.featured ? "Öne çıkarmayı kaldır" : "Öne çıkar"} className="flex h-9 w-9 items-center justify-center hover:bg-neutral-100">
                  <Star className={`h-4 w-4 ${p.featured ? "fill-ember text-ember" : "text-neutral-300"}`} />
                </button>
              </form>
            </td>
            <td className="px-4 py-3">
              <form action={toggleProjectFlag.bind(null, p.id, "active")}>
                <button type="submit" title="Durumu değiştir">{p.active ? <Badge tone="green">Aktif</Badge> : <Badge>Pasif</Badge>}</button>
              </form>
            </td>
            <td className="px-4 py-3 tabular-nums">{p.sortOrder}</td>
            <td className="px-4 py-3 text-right">
              <ConfirmAction compact action={deleteProject.bind(null, p.id)} title={`“${p.title}” silinsin mi?`} description="Proje ve galeri kayıtları silinir. İlişkili ürünler etkilenmez." />
            </td>
          </tr>
        ))}
      </Table>
      <AdminPagination page={page} pages={Math.ceil(total / PAGE_SIZE)} params={{ q, durum: sp.durum }} />
    </div>
  );
}
