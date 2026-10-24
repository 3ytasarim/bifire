import type { Prisma } from "@prisma/client";
import { AdminPagination, EmptyRow, ListToolbar, PageHeader, PAGE_SIZE, pageOf, Table } from "@/components/admin/ui";
import { CrmTabs, DueBadge, OpenLink, ProjectCell, StageBadge } from "@/components/admin/crm/CrmParts";
import { CRM_SOURCES, CRM_STAGES, customerCode } from "@/lib/crm/labels";
import { ownerOptions, projectListInclude, stageOptions } from "@/lib/crm/queries";
import { prisma } from "@/lib/db";

export const metadata = { title: "CRM · Müşteriler" };

type SP = { q?: string; asama?: string; sorumlu?: string; kanal?: string; sayfa?: string };

export default async function CrmCustomersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = pageOf(sp.sayfa);
  const q = sp.q?.trim().slice(0, 80);
  const code = q?.match(/^(?:bf|p)-?0*(\d+)$/i)?.[1];
  const where: Prisma.CrmProjectWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { location: { contains: q, mode: "insensitive" } },
              { customer: { name: { contains: q, mode: "insensitive" } } },
              { customer: { phone: { contains: q } } },
              { customer: { email: { contains: q, mode: "insensitive" } } },
              ...(code ? [{ code: Number(code) }, { customer: { code: Number(code) } }] : []),
            ],
          }
        : {},
      sp.asama && sp.asama in CRM_STAGES ? { stage: sp.asama as keyof typeof CRM_STAGES } : {},
      sp.sorumlu === "yok" ? { ownerId: null } : sp.sorumlu ? { ownerId: sp.sorumlu } : {},
      sp.kanal && sp.kanal in CRM_SOURCES ? { source: sp.kanal as keyof typeof CRM_SOURCES } : {},
    ],
  };
  const [rows, total, owners] = await Promise.all([
    prisma.crmProject.findMany({ where, orderBy: [{ updatedAt: "desc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, include: projectListInclude }),
    prisma.crmProject.count({ where }),
    ownerOptions(),
  ]);

  return (
    <div>
      <PageHeader title="Müşteriler ve projeler" description={`${total} proje — bir müşterinin her projesi ayrı kayıtla izlenir`} action={{ label: "Yeni müşteri", href: "/admin/crm/musteriler/yeni" }} />
      <CrmTabs active="musteriler" />
      <ListToolbar
        q={q}
        placeholder="Ad, telefon, proje no (BF-0001), ilçe veya ürün…"
        filters={[
          { name: "asama", label: "Aşama", value: sp.asama, options: stageOptions },
          { name: "sorumlu", label: "Sorumlu", value: sp.sorumlu, options: [...owners, { value: "yok", label: "Atanmadı" }] },
          { name: "kanal", label: "Kanal", value: sp.kanal, options: Object.entries(CRM_SOURCES).map(([value, label]) => ({ value, label })) },
        ]}
      />
      <Table head={["Müşteri / proje", "Aşama", "Sorumlu", "Kanal", "Takip", ""]} empty={rows.length ? null : <EmptyRow text="Kayıt bulunamadı." action={{ label: "Yeni müşteri", href: "/admin/crm/musteriler/yeni" }} />}>
        {rows.map((p) => (
          <tr key={p.id} className="hover:bg-neutral-50">
            <td className="px-4 py-3">
              <ProjectCell p={p} />
              <span className="text-xs text-neutral-400">
                {customerCode(p.customer.code)}
                {p.customer.phone ? ` · ${p.customer.phone}` : ""}
              </span>
            </td>
            <td className="px-4 py-3">
              <StageBadge stage={p.stage} />
            </td>
            <td className="px-4 py-3 text-neutral-600">{p.owner?.name ?? <span className="text-neutral-400">Atanmadı</span>}</td>
            <td className="px-4 py-3 text-xs text-neutral-500">{CRM_SOURCES[p.source]}</td>
            <td className="px-4 py-3">
              <DueBadge date={p.nextFollowUpAt} done={p.stage === "DONE" || p.stage === "LOST"} />
            </td>
            <td className="px-4 py-3 text-right">
              <OpenLink href={`/admin/crm/proje/${p.id}`} />
            </td>
          </tr>
        ))}
      </Table>
      <AdminPagination page={page} pages={Math.ceil(total / PAGE_SIZE)} params={{ q, asama: sp.asama, sorumlu: sp.sorumlu, kanal: sp.kanal }} />
    </div>
  );
}
