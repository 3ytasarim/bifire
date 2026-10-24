import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { CheckCircle2, Circle } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { CrmTabs, DueBadge } from "@/components/admin/crm/CrmParts";
import { TaskForm } from "@/components/admin/crm/CrmForms";
import { projectCode } from "@/lib/crm/labels";
import { ownerOptions, todayRange } from "@/lib/crm/queries";
import { requireAdmin } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { toggleTask } from "../actions";

export const metadata = { title: "CRM · Görevler" };

const FILTERS = [
  ["acik", "Açık görevler"],
  ["bugun", "Bugün"],
  ["geciken", "Gecikenler"],
  ["bana", "Bana atananlar"],
  ["tamamlanan", "Tamamlananlar"],
  ["tumu", "Tümü"],
] as const;

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const user = await requireAdmin();
  const f = (await searchParams).f ?? "acik";
  const { start, end } = todayRange();
  const where: Prisma.CrmTaskWhereInput =
    f === "bugun"
      ? { doneAt: null, dueAt: { gte: start, lt: end } }
      : f === "geciken"
        ? { doneAt: null, dueAt: { lt: start } }
        : f === "bana"
          ? { doneAt: null, assigneeId: user.id }
          : f === "tamamlanan"
            ? { doneAt: { not: null } }
            : f === "tumu"
              ? {}
              : { doneAt: null };
  const [tasks, owners, projects] = await Promise.all([
    prisma.crmTask.findMany({
      where,
      orderBy: f === "tamamlanan" ? { doneAt: "desc" } : { dueAt: "asc" },
      take: 200,
      include: { assignee: { select: { name: true } }, project: { select: { id: true, code: true, title: true, customer: { select: { name: true } } } } },
    }),
    ownerOptions(),
    prisma.crmProject.findMany({ where: { stage: { notIn: ["DONE", "LOST"] } }, orderBy: { updatedAt: "desc" }, take: 200, select: { id: true, code: true, title: true, customer: { select: { name: true } } } }),
  ]);

  return (
    <div>
      <PageHeader title="Görevler ve randevular" description="Her iş için bir sorumlu ve takip tarihi." />
      <CrmTabs active="gorevler" />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <nav aria-label="Görev filtresi" className="mb-4 flex flex-wrap gap-2">
            {FILTERS.map(([key, label]) => (
              <Link key={key} href={`/admin/crm/gorevler?f=${key}`} aria-current={f === key ? "page" : undefined} className={`min-h-9 border px-3 py-1.5 text-sm font-semibold ${f === key ? "border-ink bg-ink text-white" : "border-neutral-300 bg-white hover:border-ink"}`}>
                {label}
              </Link>
            ))}
          </nav>
          <ul className="divide-y divide-neutral-100 border border-neutral-200 bg-white">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-start gap-3 p-4">
                <form action={toggleTask}>
                  <input type="hidden" name="id" value={t.id} />
                  <button type="submit" aria-label={t.doneAt ? "Görevi yeniden aç" : "Görevi tamamla"} className="mt-0.5 text-neutral-400 hover:text-emerald-600">
                    {t.doneAt ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5" />}
                  </button>
                </form>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-semibold ${t.doneAt ? "text-neutral-400 line-through" : ""}`}>{t.title}</span>
                  <span className="block text-xs text-neutral-500">
                    {t.project ? (
                      <Link href={`/admin/crm/proje/${t.project.id}`} className="hover:underline">
                        {t.project.customer.name} · {projectCode(t.project.code)}
                      </Link>
                    ) : (
                      "Projesiz"
                    )}{" "}
                    · {t.assignee?.name ?? "Atanmadı"}
                  </span>
                </span>
                <DueBadge date={t.dueAt} done={Boolean(t.doneAt)} />
              </li>
            ))}
            {!tasks.length ? <li className="p-10 text-center text-sm text-neutral-500">Bu filtrede görev yok.</li> : null}
          </ul>
        </div>
        <section className="border border-neutral-200 bg-white p-5" aria-labelledby="yeni-gorev">
          <h2 id="yeni-gorev" className="mb-4 text-base font-semibold">
            Yeni görev
          </h2>
          <TaskForm owners={owners} projects={projects.map((p) => ({ value: p.id, label: `${p.customer.name} · ${p.title} (${projectCode(p.code)})` }))} />
        </section>
      </div>
    </div>
  );
}
