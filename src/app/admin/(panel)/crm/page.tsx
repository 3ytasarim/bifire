import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge, PageHeader, Table } from "@/components/admin/ui";
import { CrmTabs, DueBadge, OpenLink, ProjectCell, StageBadge } from "@/components/admin/crm/CrmParts";
import { CRM_STAGES, OPEN_STAGES } from "@/lib/crm/labels";
import { projectListInclude, todayRange } from "@/lib/crm/queries";
import { prisma } from "@/lib/db";

export const metadata = { title: "CRM" };

export default async function CrmDashboard() {
  const { start, end } = todayRange();
  const open = { stage: { in: OPEN_STAGES } };
  const [active, todayFollow, lateFollow, openTasks, byStage, priority, upcoming, unassigned] = await Promise.all([
    prisma.crmProject.count({ where: open }),
    prisma.crmProject.count({ where: { ...open, nextFollowUpAt: { gte: start, lt: end } } }),
    prisma.crmProject.count({ where: { ...open, nextFollowUpAt: { lt: start } } }),
    prisma.crmTask.count({ where: { doneAt: null } }),
    prisma.crmProject.groupBy({ by: ["stage"], _count: true }),
    prisma.crmProject.findMany({ where: { ...open, nextFollowUpAt: { lt: end } }, orderBy: { nextFollowUpAt: "asc" }, take: 10, include: projectListInclude }),
    prisma.crmTask.findMany({ where: { doneAt: null }, orderBy: { dueAt: "asc" }, take: 8, include: { assignee: { select: { name: true } }, project: { select: { id: true, customer: { select: { name: true } } } } } }),
    prisma.crmProject.count({ where: { ...open, ownerId: null } }),
  ]);
  const count = (s: string) => byStage.find((b) => b.stage === s)?._count ?? 0;
  const stats = [
    { label: "Aktif proje", value: active, note: "Takibi devam eden talepler" },
    { label: "Bugünkü takip", value: todayFollow, note: start.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" }) },
    { label: "Geciken takip", value: lateFollow, note: "Öncelikli görüşülecek müşteriler", alert: lateFollow > 0 },
    { label: "Açık görev", value: openTasks, note: unassigned ? `${unassigned} proje sorumlusuz` : "Ekip genelindeki işler" },
  ];

  return (
    <div>
      <PageHeader title="Müşteri ilişkileri" description="Her talep, doğru adım ve zamanında bir takip." action={{ label: "Yeni müşteri", href: "/admin/crm/musteriler/yeni" }} />
      <CrmTabs active="panel" />

      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`border bg-white p-5 ${s.alert ? "border-red-300" : "border-neutral-200"}`}>
            <dt className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">{s.label}</dt>
            <dd className={`mt-2 text-3xl font-semibold ${s.alert ? "text-red-700" : "text-ink"}`}>{s.value}</dd>
            <dd className="mt-1 text-xs text-neutral-500">{s.note}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-8 xl:grid-cols-3">
        <section className="xl:col-span-2" aria-labelledby="oncelikli">
          <div className="mb-3 flex items-end justify-between">
            <h2 id="oncelikli" className="text-base font-semibold">
              Öncelikli müşteri takipleri
            </h2>
            <Link href="/admin/crm/musteriler" className="text-sm font-semibold text-ember-ink hover:underline">
              Tümünü gör
            </Link>
          </div>
          <Table head={["Müşteri / proje", "Aşama", "Sorumlu", "Takip", ""]} empty={priority.length ? null : <p className="px-4 py-10 text-center text-sm text-neutral-500">Bugün veya geciken takip yok.</p>}>
            {priority.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <ProjectCell p={p} />
                </td>
                <td className="px-4 py-3">
                  <StageBadge stage={p.stage} />
                </td>
                <td className="px-4 py-3 text-neutral-600">{p.owner?.name ?? <span className="text-neutral-400">Atanmadı</span>}</td>
                <td className="px-4 py-3">
                  <DueBadge date={p.nextFollowUpAt} />
                </td>
                <td className="px-4 py-3 text-right">
                  <OpenLink href={`/admin/crm/proje/${p.id}`} />
                </td>
              </tr>
            ))}
          </Table>

          <div className="mt-8 flex items-end justify-between">
            <h2 className="text-base font-semibold">Satış sürecinin dağılımı</h2>
            <Link href="/admin/crm/surec" className="text-sm font-semibold text-ember-ink hover:underline">
              Sürece git
            </Link>
          </div>
          <ol className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {(Object.keys(CRM_STAGES) as (keyof typeof CRM_STAGES)[]).map((s) => (
              <li key={s} className="border border-neutral-200 bg-white p-4">
                <p className="text-xs text-neutral-500">{CRM_STAGES[s].label}</p>
                <p className="mt-1 text-2xl font-semibold">{count(s)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="yaklasan">
          <div className="mb-3 flex items-end justify-between">
            <h2 id="yaklasan" className="text-base font-semibold">
              Yaklaşan işler
            </h2>
            <Link href="/admin/crm/gorevler" className="inline-flex items-center gap-1 text-sm font-semibold text-ember-ink hover:underline">
              <Plus aria-hidden="true" className="h-4 w-4" /> Görev
            </Link>
          </div>
          <ul className="divide-y divide-neutral-100 border border-neutral-200 bg-white">
            {upcoming.length ? (
              upcoming.map((t) => (
                <li key={t.id} className="flex items-start justify-between gap-3 p-4">
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{t.title}</span>
                    <span className="block text-xs text-neutral-500">
                      {t.project ? (
                        <Link href={`/admin/crm/proje/${t.project.id}`} className="hover:underline">
                          {t.project.customer.name}
                        </Link>
                      ) : (
                        "Projesiz"
                      )}{" "}
                      · {t.assignee?.name ?? "Atanmadı"}
                    </span>
                  </span>
                  <DueBadge date={t.dueAt} />
                </li>
              ))
            ) : (
              <li className="p-6 text-center text-sm text-neutral-500">Açık görev yok.</li>
            )}
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-neutral-500">
            Web sitesindeki teklif, showroom ve mekâna özel tasarım formları otomatik kayıt açar; telefon/e-posta ile mevcut müşteri eşleştirilir. <Badge>Müşteriye otomatik mesaj gönderilmez.</Badge>
          </p>
        </section>
      </div>
    </div>
  );
}
