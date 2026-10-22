import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Star } from "lucide-react";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { AdminPagination, Badge, EmptyRow, ListToolbar, PageHeader, PAGE_SIZE, pageOf, Table } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { deletePost, togglePostFlag } from "./actions";

export const metadata = { title: "Blog" };

export default async function BlogAdminPage({ searchParams }: { searchParams: Promise<{ q?: string; durum?: string; sayfa?: string }> }) {
  const sp = await searchParams;
  const page = pageOf(sp.sayfa);
  const q = sp.q?.trim().slice(0, 80);
  const where: Prisma.BlogPostWhereInput = {
    AND: [
      q ? { title: { contains: q, mode: "insensitive" } } : {},
      sp.durum === "yayinda" ? { published: true } : sp.durum === "taslak" ? { published: false } : sp.durum === "one-cikan" ? { featured: true } : {},
    ],
  };
  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, title: true, slug: true, coverImage: true, published: true, featured: true, publishedAt: true, _count: { select: { tags: true } } },
    }),
    prisma.blogPost.count({ where }),
  ]);
  const now = new Date();

  return (
    <div>
      <PageHeader title="Blog" description={`${total} yazı`} action={{ label: "Yeni yazı", href: "/admin/blog/yeni" }} />
      <ListToolbar q={q} placeholder="Başlıkta ara…" filters={[{ name: "durum", label: "Durum", value: sp.durum, options: [{ value: "yayinda", label: "Yayında" }, { value: "taslak", label: "Taslak" }, { value: "one-cikan", label: "Öne çıkan" }] }]} />
      <Table head={["", "Başlık", "Yayın tarihi", "Öne çıkan", "Durum", ""]} empty={posts.length ? null : <EmptyRow text="Yazı bulunamadı." action={{ label: "Yazı ekle", href: "/admin/blog/yeni" }} />}>
        {posts.map((p) => (
          <tr key={p.id} className="hover:bg-neutral-50">
            <td className="w-16 px-4 py-3">
              <div className="relative h-12 w-16 bg-neutral-100">{p.coverImage ? <Image src={p.coverImage} alt="" fill sizes="64px" className="object-cover" /> : null}</div>
            </td>
            <td className="px-4 py-3">
              <Link href={`/admin/blog/${p.id}`} className="font-medium hover:underline">
                {p.title}
              </Link>
              <p className="text-xs text-neutral-400">/somine-rehberi/{p.slug}</p>
            </td>
            <td className="px-4 py-3 text-neutral-600">{p.publishedAt ? p.publishedAt.toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" }) : "—"}</td>
            <td className="px-4 py-3">
              <form action={togglePostFlag.bind(null, p.id, "featured")}>
                <button type="submit" aria-label={p.featured ? "Öne çıkarmayı kaldır" : "Öne çıkar"} className="flex h-9 w-9 items-center justify-center hover:bg-neutral-100">
                  <Star className={`h-4 w-4 ${p.featured ? "fill-ember text-ember" : "text-neutral-300"}`} />
                </button>
              </form>
            </td>
            <td className="px-4 py-3">
              <form action={togglePostFlag.bind(null, p.id, "published")}>
                <button type="submit" title="Yayın durumunu değiştir">
                  {!p.published ? <Badge>Taslak</Badge> : p.publishedAt && p.publishedAt > now ? <Badge tone="amber">Zamanlandı</Badge> : <Badge tone="green">Yayında</Badge>}
                </button>
              </form>
            </td>
            <td className="px-4 py-3 text-right">
              <ConfirmAction compact action={deletePost.bind(null, p.id)} title={`“${p.title}” silinsin mi?`} description="Yazı kalıcı olarak silinir." />
            </td>
          </tr>
        ))}
      </Table>
      <AdminPagination page={page} pages={Math.ceil(total / PAGE_SIZE)} params={{ q, durum: sp.durum }} />
    </div>
  );
}
