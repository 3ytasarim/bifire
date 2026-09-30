import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { AdminPagination, Badge, EmptyRow, ListToolbar, PageHeader, pageOf, Table } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { deleteRedirect, toggleRedirect } from "../actions";
import { RedirectForm } from "./RedirectForm";

export const metadata = { title: "Yönlendirmeler" };

const SIZE = 50;

export default async function RedirectsPage({ searchParams }: { searchParams: Promise<{ q?: string; sayfa?: string }> }) {
  const sp = await searchParams;
  const page = pageOf(sp.sayfa);
  const q = sp.q?.trim().slice(0, 120);
  const where = q ? { OR: [{ sourcePath: { contains: q } }, { destinationPath: { contains: q } }] } : {};
  const [rows, total] = await Promise.all([
    prisma.redirect.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * SIZE, take: SIZE }),
    prisma.redirect.count({ where }),
  ]);
  return (
    <div>
      <PageHeader title="Yönlendirmeler" description="Eski adreslerin SEO değerini korumak için 301 yönlendirmeleri. Ürün/kategori/proje/blog slug'ı değiştiğinde otomatik eklenir." back={{ label: "SEO", href: "/admin/seo" }} />
      <div className="mb-6">
        <RedirectForm />
      </div>
      <ListToolbar q={q} placeholder="Adreste ara…" />
      <Table head={["Eski adres", "Yeni adres", "Kod", "Durum", "Not", ""]} empty={rows.length ? null : <EmptyRow text="Yönlendirme yok." />}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="px-4 py-3 font-mono text-xs break-all">{r.sourcePath}</td>
            <td className="px-4 py-3 font-mono text-xs break-all">{r.destinationPath}</td>
            <td className="px-4 py-3">{r.statusCode}</td>
            <td className="px-4 py-3">
              <form action={toggleRedirect.bind(null, r.id)}>
                <button type="submit">{r.active ? <Badge tone="green">Aktif</Badge> : <Badge>Pasif</Badge>}</button>
              </form>
            </td>
            <td className="px-4 py-3 text-xs text-neutral-500">{r.note}</td>
            <td className="px-4 py-3 text-right">
              <ConfirmAction compact action={deleteRedirect.bind(null, r.id)} title="Yönlendirme silinsin mi?" description={`${r.sourcePath} adresi artık yönlendirilmez (404 dönebilir).`} />
            </td>
          </tr>
        ))}
      </Table>
      <AdminPagination page={page} pages={Math.ceil(total / SIZE)} params={{ q }} />
    </div>
  );
}
