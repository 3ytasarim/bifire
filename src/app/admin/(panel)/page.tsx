import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/admin/ui";
import { REQUEST_STATUS, REQUEST_TYPE } from "@/lib/admin/labels";
import { prisma } from "@/lib/db";

export const metadata = { title: "Panel" };

function when(d: Date) {
  return d.toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ yetki?: string }> }) {
  const { yetki } = await searchParams;
  const [products, categories, projects, posts, requests, unread, latestRequests, latestProducts, latestPosts, latestProjects] = await Promise.all([
    prisma.product.count(),
    prisma.productCategory.count(),
    prisma.project.count(),
    prisma.blogPost.count(),
    prisma.contactRequest.count(),
    prisma.contactRequest.count({ where: { isRead: false } }),
    prisma.contactRequest.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.product.findMany({ orderBy: { updatedAt: "desc" }, take: 4, select: { id: true, name: true, updatedAt: true } }),
    prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" }, take: 4, select: { id: true, title: true, updatedAt: true, published: true } }),
    prisma.project.findMany({ orderBy: { updatedAt: "desc" }, take: 4, select: { id: true, title: true, updatedAt: true } }),
  ]);

  const stats = [
    { label: "Ürün", value: products, href: "/admin/urunler" },
    { label: "Kategori", value: categories, href: "/admin/kategoriler" },
    { label: "Proje", value: projects, href: "/admin/projeler" },
    { label: "Blog yazısı", value: posts, href: "/admin/blog" },
    { label: "Talep", value: requests, href: "/admin/talepler", note: unread ? `${unread} okunmamış` : undefined },
  ];
  const recent = [
    ...latestProducts.map((x) => ({ type: "Ürün", title: x.name, at: x.updatedAt, href: `/admin/urunler/${x.id}` })),
    ...latestPosts.map((x) => ({ type: x.published ? "Blog" : "Blog (taslak)", title: x.title, at: x.updatedAt, href: `/admin/blog/${x.id}` })),
    ...latestProjects.map((x) => ({ type: "Proje", title: x.title, at: x.updatedAt, href: `/admin/projeler/${x.id}` })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 8);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Panel</h1>
      {yetki ? <p className="mt-4 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Bu sayfaya erişim yetkiniz yok.</p> : null}
      <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="block border border-neutral-200 bg-white p-5 transition-colors hover:border-ink">
              <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">{s.label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{s.value}</p>
              {s.note ? <p className="mt-1 text-xs font-semibold text-ember-ink">{s.note}</p> : null}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <h2 className="font-semibold">Son talepler</h2>
            <Link href="/admin/talepler" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-ink">
              Tümü <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          {latestRequests.length ? (
            <ul className="divide-y divide-neutral-100">
              {latestRequests.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/talepler/${r.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50">
                    {!r.isRead ? <span aria-label="Okunmamış" className="h-2 w-2 shrink-0 rounded-full bg-ember" /> : <span className="h-2 w-2 shrink-0" />}
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm ${r.isRead ? "" : "font-semibold"}`}>{r.name}</span>
                      <span className="block truncate text-xs text-neutral-500">{r.productName || r.topic || r.categoryName || REQUEST_TYPE[r.type].label}</span>
                    </span>
                    <Badge tone={REQUEST_STATUS[r.status].tone}>{REQUEST_STATUS[r.status].label}</Badge>
                    <span className="hidden text-xs text-neutral-400 sm:inline">{when(r.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-neutral-500">Henüz talep yok.</p>
          )}
        </section>

        <section className="border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="font-semibold">Son güncellenen içerikler</h2>
          </div>
          {recent.length ? (
            <ul className="divide-y divide-neutral-100">
              {recent.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50">
                    <Badge>{r.type}</Badge>
                    <span className="min-w-0 flex-1 truncate text-sm">{r.title}</span>
                    <span className="text-xs text-neutral-400">{when(r.at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-neutral-500">Henüz içerik yok. Kategori ekleyerek başlayın.</p>
          )}
        </section>
      </div>
    </div>
  );
}
