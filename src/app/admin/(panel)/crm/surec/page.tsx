import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { CrmTabs, DueBadge } from "@/components/admin/crm/CrmParts";
import { StageSelect } from "@/components/admin/crm/CrmForms";
import { CRM_STAGES, OPEN_STAGES, fmtMoney, projectCode } from "@/lib/crm/labels";
import { projectListInclude, stageOptions } from "@/lib/crm/queries";
import { prisma } from "@/lib/db";
import { setStage } from "../actions";

export const metadata = { title: "CRM · Satış süreci" };

/** Satış süreci panosu: açık aşamalar sütun; kartta aşama değiştirilir. Kapanan projeler Müşteriler'de filtrelenir. */
export default async function PipelinePage() {
  const [projects, closed] = await Promise.all([
    prisma.crmProject.findMany({ where: { stage: { in: OPEN_STAGES } }, orderBy: [{ nextFollowUpAt: { sort: "asc", nulls: "last" } }], include: projectListInclude }),
    prisma.crmProject.groupBy({ by: ["stage"], where: { stage: { in: ["DONE", "LOST"] } }, _count: true }),
  ]);
  return (
    <div>
      <PageHeader title="Talebin yolculuğu" description="Kartta aşamayı değiştirin; sorumlu ve takip tarihi için kartı açın." action={{ label: "Yeni müşteri", href: "/admin/crm/musteriler/yeni" }} />
      <CrmTabs active="surec" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {OPEN_STAGES.map((s) => {
          const items = projects.filter((p) => p.stage === s);
          return (
            <section key={s} aria-labelledby={`kolon-${s}`} className="flex flex-col border border-neutral-200 bg-neutral-50">
              <h2 id={`kolon-${s}`} className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 text-sm font-semibold">
                {CRM_STAGES[s].label}
                <span className="min-w-6 bg-neutral-100 px-1.5 text-center text-xs">{items.length}</span>
              </h2>
              <ul className="flex-1 space-y-3 p-3">
                {items.map((p) => (
                  <li key={p.id} className="border border-neutral-200 bg-white p-4 shadow-sm">
                    <p className="text-[11px] font-semibold tracking-wide text-neutral-400">{projectCode(p.code)}</p>
                    <Link href={`/admin/crm/proje/${p.id}`} className="mt-1 block font-semibold hover:underline">
                      {p.customer.name}
                    </Link>
                    <p className="text-xs text-neutral-600">{p.title}</p>
                    {p.location ? <p className="text-xs text-neutral-500">{p.location}</p> : null}
                    <div className="mt-3 flex items-end justify-between gap-2">
                      <DueBadge date={p.nextFollowUpAt} />
                      <span className="text-right text-xs text-neutral-500">
                        {p.quoteAmount ? fmtMoney(p.quoteAmount) : "Teklif tutarı girilmedi"}
                        <span className="block">{p.owner?.name ?? "Atanmadı"}</span>
                      </span>
                    </div>
                    <div className="mt-3 border-t border-neutral-100 pt-3">
                      <StageSelect id={p.id} stage={p.stage} stages={stageOptions} action={setStage} compact />
                    </div>
                  </li>
                ))}
                {!items.length ? <li className="py-6 text-center text-xs text-neutral-400">Kayıt yok</li> : null}
              </ul>
            </section>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-neutral-500">
        Tamamlanan {closed.find((c) => c.stage === "DONE")?._count ?? 0}, kaybedilen {closed.find((c) => c.stage === "LOST")?._count ?? 0} proje —{" "}
        <Link href="/admin/crm/musteriler?asama=DONE" className="font-semibold text-ember-ink hover:underline">
          Müşteriler ekranında aşama filtresiyle görün
        </Link>
        . Tutarlar ciro veya tahsilat değildir.
      </p>
    </div>
  );
}
