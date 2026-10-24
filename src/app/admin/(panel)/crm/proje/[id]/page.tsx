import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { Badge, Flash, PageHeader } from "@/components/admin/ui";
import { CrmTabs, DueBadge, StageBadge } from "@/components/admin/crm/CrmParts";
import { ActivityForm, MessagePicker, StageSelect, TaskForm } from "@/components/admin/crm/CrmForms";
import { ProjectForm } from "@/components/admin/crm/ProjectForm";
import { REQUEST_TYPE } from "@/lib/admin/labels";
import { CRM_ACTIVITY, CRM_SOURCES, USAGE_OPTIONS, customerCode, fmtDateTime, fmtMoney, projectCode } from "@/lib/crm/labels";
import { activityOptions, ownerOptions, sourceOptions, stageOptions } from "@/lib/crm/queries";
import { prisma } from "@/lib/db";
import { deleteTask, setStage, toggleTask } from "../../actions";

export const metadata = { title: "CRM · Proje kartı" };

const dateInput = (d: Date | null) => (d ? d.toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" }) : "");

export default async function ProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ kaydedildi?: string; aktarildi?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const p = await prisma.crmProject.findUnique({
    where: { id },
    include: {
      customer: { include: { projects: { where: { id: { not: id } }, orderBy: { updatedAt: "desc" }, select: { id: true, code: true, title: true, stage: true } } } },
      owner: { select: { name: true } },
      activities: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } },
      tasks: { orderBy: [{ doneAt: { sort: "asc", nulls: "first" } }, { dueAt: "asc" }], include: { assignee: { select: { name: true } } } },
      requests: { orderBy: { createdAt: "desc" }, select: { id: true, type: true, createdAt: true, productName: true } },
      product: { select: { name: true, slug: true } },
    },
  });
  if (!p) notFound();
  const [owners, templates] = await Promise.all([ownerOptions(), prisma.crmMessageTemplate.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true, title: true, body: true } })]);
  const c = p.customer;

  return (
    <div>
      <PageHeader title={`${c.name} — ${p.title}`} description={`${customerCode(c.code)} · ${projectCode(p.code)} · ${CRM_SOURCES[p.source]}${p.location ? ` · ${p.location}` : ""}`} back={{ label: "Müşteriler", href: "/admin/crm/musteriler" }} />
      <CrmTabs active="musteriler" />
      <Flash message={sp.kaydedildi ? "Kayıt oluşturuldu." : sp.aktarildi ? "Talep CRM'e aktarıldı." : null} />

      <div className="mb-6 grid gap-3 border border-neutral-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="text-xs text-neutral-500">Aşama</p>
          <div className="mt-1 flex items-center gap-2">
            <StageBadge stage={p.stage} />
          </div>
          <div className="mt-2">
            <StageSelect id={p.id} stage={p.stage} stages={stageOptions} action={setStage} />
          </div>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Telefon</p>
          <p className="mt-1 font-semibold">{c.phone ? <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="hover:underline">{c.phone}</a> : "—"}</p>
          {c.email ? <p className="text-xs text-neutral-500">{c.email}</p> : null}
        </div>
        <div>
          <p className="text-xs text-neutral-500">Sorumlu</p>
          <p className="mt-1 font-semibold">{p.owner?.name ?? <span className="text-neutral-400">Atanmadı</span>}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Sonraki takip</p>
          <div className="mt-1">
            <DueBadge date={p.nextFollowUpAt} done={p.stage === "DONE" || p.stage === "LOST"} />
          </div>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Girilen teklif tutarı</p>
          <p className="mt-1 font-semibold">{fmtMoney(p.quoteAmount)}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="border border-neutral-200 bg-white p-5 sm:p-7" aria-labelledby="gorusmeler">
            <h2 id="gorusmeler" className="text-base font-semibold">
              Görüşme geçmişi
            </h2>
            <div className="mt-5">
              <ActivityForm projectId={p.id} types={activityOptions} />
            </div>
            <ol className="mt-8 space-y-4 border-l-2 border-neutral-100 pl-5">
              {p.activities.map((a) => (
                <li key={a.id} className="relative">
                  <span aria-hidden="true" className={`absolute top-1.5 -left-[27px] h-3 w-3 rounded-full border-2 border-white ${a.type === "SYSTEM" ? "bg-neutral-300" : a.type === "STAGE" ? "bg-amber-500" : "bg-ember"}`} />
                  <p className="text-xs text-neutral-500">
                    {fmtDateTime(a.createdAt)} · {CRM_ACTIVITY[a.type]}
                    {a.author ? ` · ${a.author.name}` : ""}
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-line text-neutral-800">{a.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <details className="border border-neutral-200 bg-white" open={false}>
            <summary className="cursor-pointer px-5 py-4 text-base font-semibold sm:px-7">Bilgileri düzenle</summary>
            <div className="border-t border-neutral-100 p-5 sm:p-7">
              <ProjectForm
                values={{
                  id: p.id,
                  name: c.name,
                  phone: c.phone ?? "",
                  email: c.email ?? "",
                  city: c.city ?? "",
                  district: c.district ?? "",
                  title: p.title,
                  location: p.location ?? "",
                  stage: p.stage,
                  ownerId: p.ownerId ?? "",
                  nextFollowUpAt: dateInput(p.nextFollowUpAt),
                  quoteAmount: p.quoteAmount?.toString() ?? "",
                  usage: p.usage ?? "",
                  chimney: p.chimney ?? "",
                  notes: p.notes ?? "",
                  lostReason: p.lostReason ?? "",
                  source: p.source,
                }}
                stages={stageOptions}
                owners={owners}
                sources={sourceOptions(true)}
                usages={USAGE_OPTIONS}
              />
            </div>
          </details>
        </div>

        <div className="space-y-6">
          <section className="border border-neutral-200 bg-white p-5" aria-labelledby="ozet">
            <h2 id="ozet" className="text-base font-semibold">
              Proje özeti
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Kullanım amacı", p.usage],
                ["Baca durumu", p.chimney],
                ["İlgilenilen ürün", p.product ? p.product.name : null],
                ["Kaybedilme nedeni", p.stage === "LOST" ? p.lostReason : null],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k as string}>
                    <dt className="text-xs text-neutral-500">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              {p.notes ? (
                <div>
                  <dt className="text-xs text-neutral-500">Proje notları</dt>
                  <dd className="whitespace-pre-line">{p.notes}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="border border-neutral-200 bg-white p-5" aria-labelledby="gorevler">
            <h2 id="gorevler" className="text-base font-semibold">
              Bu projenin görevleri
            </h2>
            <ul className="mt-4 divide-y divide-neutral-100">
              {p.tasks.map((t) => (
                <li key={t.id} className="flex items-start gap-3 py-3">
                  <form action={toggleTask}>
                    <input type="hidden" name="id" value={t.id} />
                    <button type="submit" aria-label={t.doneAt ? "Görevi yeniden aç" : "Görevi tamamla"} className="mt-0.5 text-neutral-400 hover:text-emerald-600">
                      {t.doneAt ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5" />}
                    </button>
                  </form>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-medium ${t.doneAt ? "text-neutral-400 line-through" : ""}`}>{t.title}</span>
                    <span className="text-xs text-neutral-500">{t.assignee?.name ?? "Atanmadı"}</span>
                  </span>
                  <DueBadge date={t.dueAt} done={Boolean(t.doneAt)} />
                  <form action={deleteTask}>
                    <input type="hidden" name="id" value={t.id} />
                    <button type="submit" aria-label="Görevi sil" className="mt-0.5 text-neutral-300 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </li>
              ))}
              {!p.tasks.length ? <li className="py-3 text-sm text-neutral-500">Görev yok.</li> : null}
            </ul>
            <div className="mt-4 border-t border-neutral-100 pt-4">
              <TaskForm projectId={p.id} owners={owners} />
            </div>
          </section>

          <section className="border border-neutral-200 bg-white p-5" aria-labelledby="hazir-mesaj">
            <h2 id="hazir-mesaj" className="text-base font-semibold">
              Müşteriye hazır mesaj
            </h2>
            <p className="mt-1 mb-4 text-xs text-neutral-500">İsim yerleştirilir. Tarih ve diğer alanları göndermeden önce tamamlayın.</p>
            <MessagePicker templates={templates} name={c.name} phone={c.phone} />
          </section>

          {p.requests.length ? (
            <section className="border border-neutral-200 bg-white p-5" aria-labelledby="web-talepler">
              <h2 id="web-talepler" className="text-base font-semibold">
                Web talepleri
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {p.requests.map((r) => (
                  <li key={r.id}>
                    <Link href={`/admin/talepler/${r.id}`} className="hover:underline">
                      <Badge tone={REQUEST_TYPE[r.type].tone}>{REQUEST_TYPE[r.type].short}</Badge> {fmtDateTime(r.createdAt)}
                      {r.productName ? ` · ${r.productName}` : ""}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {c.projects.length ? (
            <section className="border border-neutral-200 bg-white p-5" aria-labelledby="diger-projeler">
              <h2 id="diger-projeler" className="text-base font-semibold">
                Müşterinin diğer projeleri
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {c.projects.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3">
                    <Link href={`/admin/crm/proje/${o.id}`} className="hover:underline">
                      {projectCode(o.code)} · {o.title}
                    </Link>
                    <StageBadge stage={o.stage} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
