import "server-only";
import { prisma } from "@/lib/db";
import { CRM_ACTIVITY, CRM_SOURCES, CRM_STAGES, MANUAL_ACTIVITY, MANUAL_SOURCES, STAGE_ORDER } from "./labels";

/** İstanbul saatine göre bugünün başlangıcı ve bitişi. */
export function todayRange() {
  const day = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" });
  const start = new Date(`${day}T00:00:00+03:00`);
  return { start, end: new Date(start.getTime() + 864e5) };
}

/** Sorumlu seçenekleri: aktif yönetici kullanıcıları. */
export async function ownerOptions() {
  const users = await prisma.adminUser.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } });
  return users.map((u) => ({ value: u.id, label: u.name }));
}

export const stageOptions = STAGE_ORDER.map((s) => ({ value: s, label: CRM_STAGES[s].label }));
export const sourceOptions = (includeWeb = false) =>
  (includeWeb ? (Object.keys(CRM_SOURCES) as (keyof typeof CRM_SOURCES)[]) : MANUAL_SOURCES).map((s) => ({ value: s, label: CRM_SOURCES[s] }));
export const activityOptions = MANUAL_ACTIVITY.map((t) => ({ value: t, label: CRM_ACTIVITY[t] }));

export const projectListInclude = {
  customer: { select: { id: true, code: true, name: true, phone: true } },
  owner: { select: { name: true } },
} as const;

/** Menü rozeti: tarihi geçmiş açık görevler + takip tarihi geçmiş açık projeler. */
export async function overdueCount() {
  const { start } = todayRange();
  const [tasks, followUps] = await Promise.all([
    prisma.crmTask.count({ where: { doneAt: null, dueAt: { lt: start } } }),
    prisma.crmProject.count({ where: { stage: { notIn: ["DONE", "LOST"] }, nextFollowUpAt: { lt: start } } }),
  ]);
  return tasks + followUps;
}
