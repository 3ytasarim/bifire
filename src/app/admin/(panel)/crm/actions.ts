"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CrmActivityType, CrmSource, CrmStage } from "@prisma/client";
import { fail, formObject, optional, required, zodErrors, type ActionState } from "@/lib/admin/form";
import { requireAdmin } from "@/lib/auth/guard";
import { emailKey, phoneKey } from "@/lib/crm/keys";
import { findMatchingCustomers, intakeRequest } from "@/lib/crm/intake";
import { CRM_STAGES, customerCode, fmtMoney } from "@/lib/crm/labels";
import { prisma } from "@/lib/db";

/** "2026-10-25" → o gün İstanbul saatiyle 10:00 (takip/görev günü). Boşsa null. */
const dateField = z
  .string()
  .trim()
  .optional()
  .transform((v, ctx) => {
    if (!v) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      ctx.addIssue({ code: "custom", message: "Geçerli bir tarih seçin." });
      return z.NEVER;
    }
    return new Date(`${v}T10:00:00+03:00`);
  });
const money = z
  .string()
  .trim()
  .optional()
  .transform((v, ctx) => {
    if (!v) return null;
    const n = Number(v.replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(n) || n < 0 || n > 1e10) {
      ctx.addIssue({ code: "custom", message: "Geçerli bir tutar girin." });
      return z.NEVER;
    }
    return n;
  });
const ownerField = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || null);

const customerShape = {
  name: required("Müşteri adı", 160),
  phone: optional(40),
  email: z.union([z.literal(""), z.string().trim().email("Geçerli bir e-posta girin.").max(160)]).optional(),
  city: optional(80),
  district: optional(80),
};
const projectShape = {
  title: required("Ürün veya şömine türü", 160),
  location: optional(160),
  stage: z.enum(CrmStage),
  ownerId: ownerField,
  nextFollowUpAt: dateField,
  quoteAmount: money,
  usage: optional(80),
  chimney: optional(200),
  notes: optional(4000),
  lostReason: optional(300),
};

function refresh(projectId?: string) {
  revalidatePath("/admin/crm", "layout");
  if (projectId) revalidatePath(`/admin/crm/proje/${projectId}`);
}

/** Yeni müşteri + ilk proje (telefon, showroom, referans… elle giriş). Eşleşen müşteri varsa seçim istenir. */
export async function createCustomerProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const raw = formObject(formData);
  const parsed = z.object({ ...customerShape, ...projectShape, source: z.enum(CrmSource), existingCustomerId: optional(40), confirmNew: optional(5) }).safeParse(raw);
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;

  let customerId = d.existingCustomerId || null;
  if (customerId) {
    if (!(await prisma.crmCustomer.findUnique({ where: { id: customerId }, select: { id: true } }))) return fail("Seçilen müşteri bulunamadı.");
  } else if (d.confirmNew !== "1") {
    const matches = await findMatchingCustomers({ phone: d.phone, email: d.email });
    if (matches.length) {
      const list = matches.map((m) => `${customerCode(m.code)} ${m.name}`).join(", ");
      return fail(`Bu telefon veya e-posta ile kayıtlı müşteri var: ${list}. Aşağıdan mevcut müşteriyi seçin ya da "Yine de yeni müşteri oluştur" kutusunu işaretleyin.`, { phone: "Eşleşen müşteri bulundu." });
    }
  }

  const project = await prisma.$transaction(async (tx) => {
    if (!customerId) {
      const c = await tx.crmCustomer.create({
        data: { name: d.name, phone: d.phone || null, phoneKey: phoneKey(d.phone), email: d.email || null, emailKey: emailKey(d.email), city: d.city || null, district: d.district || null, source: d.source },
      });
      customerId = c.id;
    }
    const p = await tx.crmProject.create({
      data: {
        customerId: customerId!,
        title: d.title,
        location: d.location || [d.city, d.district].filter(Boolean).join(" / ") || null,
        stage: d.stage,
        ownerId: d.ownerId,
        nextFollowUpAt: d.nextFollowUpAt,
        quoteAmount: d.quoteAmount,
        usage: d.usage || null,
        chimney: d.chimney || null,
        notes: d.notes || null,
        source: d.source,
      },
    });
    await tx.crmActivity.create({ data: { projectId: p.id, type: "SYSTEM", body: "Kayıt ekip tarafından oluşturuldu.", authorId: user.id } });
    if (d.nextFollowUpAt) await tx.crmTask.create({ data: { projectId: p.id, title: `Takip: ${d.name}`, dueAt: d.nextFollowUpAt, assigneeId: d.ownerId, createdById: user.id } });
    return p;
  });
  refresh();
  redirect(`/admin/crm/proje/${project.id}?kaydedildi=1`);
}

/** Müşteri + proje bilgilerini günceller; aşama/sorumlu/takip değişikliği görüşme geçmişine yazılır. */
export async function updateProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = z.object({ ...customerShape, ...projectShape, source: z.enum(CrmSource) }).safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;
  const before = await prisma.crmProject.findUnique({ where: { id }, include: { owner: { select: { name: true } } } });
  if (!before) return fail("Proje bulunamadı.");

  const changes: string[] = [];
  if (before.stage !== d.stage) changes.push(`Aşama: ${CRM_STAGES[before.stage].label} → ${CRM_STAGES[d.stage].label}`);
  if (before.ownerId !== d.ownerId) {
    const owner = d.ownerId ? await prisma.adminUser.findUnique({ where: { id: d.ownerId }, select: { name: true } }) : null;
    changes.push(`Sorumlu: ${before.owner?.name ?? "atanmadı"} → ${owner?.name ?? "atanmadı"}`);
  }
  const quote = d.quoteAmount;
  if (String(before.quoteAmount ?? "") !== String(quote ?? "")) changes.push(`Teklif tutarı: ${fmtMoney(quote)}`);

  await prisma.$transaction(async (tx) => {
    await tx.crmCustomer.update({
      where: { id: before.customerId },
      data: { name: d.name, phone: d.phone || null, phoneKey: phoneKey(d.phone), email: d.email || null, emailKey: emailKey(d.email), city: d.city || null, district: d.district || null },
    });
    await tx.crmProject.update({
      where: { id },
      data: {
        title: d.title,
        location: d.location || null,
        stage: d.stage,
        ...(before.stage !== d.stage ? { stageChangedAt: new Date() } : {}),
        ownerId: d.ownerId,
        nextFollowUpAt: d.nextFollowUpAt,
        quoteAmount: quote,
        usage: d.usage || null,
        chimney: d.chimney || null,
        notes: d.notes || null,
        lostReason: d.stage === "LOST" ? d.lostReason || null : null,
        source: d.source,
      },
    });
    if (changes.length) await tx.crmActivity.create({ data: { projectId: id, type: before.stage !== d.stage ? "STAGE" : "SYSTEM", body: changes.join("\n"), authorId: user.id } });
  });
  refresh(id);
  return { status: "success", message: "Kayıt güncellendi." };
}

/** Hızlı aşama değişikliği (proje kartı ve satış süreci panosu). */
export async function setStage(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const stage = z.enum(CrmStage).safeParse(formData.get("stage"));
  if (!stage.success) return;
  const p = await prisma.crmProject.findUnique({ where: { id }, select: { stage: true } });
  if (!p || p.stage === stage.data) return;
  await prisma.$transaction([
    prisma.crmProject.update({ where: { id }, data: { stage: stage.data, stageChangedAt: new Date() } }),
    prisma.crmActivity.create({ data: { projectId: id, type: "STAGE", body: `Aşama: ${CRM_STAGES[p.stage].label} → ${CRM_STAGES[stage.data].label}`, authorId: user.id } }),
  ]);
  refresh(id);
}

/** Görüşme notu (not, telefon, showroom/keşif, mesaj); isteğe bağlı sonraki takip tarihi. */
export async function addActivity(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = z
    .object({ projectId: z.string().min(1), type: z.enum(CrmActivityType), body: required("Görüşme notu", 4000), nextFollowUpAt: dateField })
    .safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;
  await prisma.$transaction([
    prisma.crmActivity.create({ data: { projectId: d.projectId, type: d.type, body: d.body, authorId: user.id } }),
    prisma.crmProject.update({ where: { id: d.projectId }, data: d.nextFollowUpAt ? { nextFollowUpAt: d.nextFollowUpAt } : { updatedAt: new Date() } }),
  ]);
  refresh(d.projectId);
  return { status: "success", message: "Görüşme kaydedildi." };
}

export async function createTask(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = z
    .object({ projectId: optional(40), title: required("Görev", 200), dueAt: dateField, assigneeId: ownerField })
    .safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;
  if (!d.dueAt) return fail("Tarih seçin.", { dueAt: "Tarih zorunlu." });
  await prisma.crmTask.create({ data: { projectId: d.projectId || null, title: d.title, dueAt: d.dueAt, assigneeId: d.assigneeId, createdById: user.id } });
  refresh(d.projectId || undefined);
  return { status: "success", message: "Görev eklendi." };
}

export async function toggleTask(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const t = await prisma.crmTask.findUnique({ where: { id }, select: { doneAt: true, projectId: true, title: true } });
  if (!t) return;
  await prisma.crmTask.update({ where: { id }, data: { doneAt: t.doneAt ? null : new Date() } });
  if (t.projectId && !t.doneAt) await prisma.crmActivity.create({ data: { projectId: t.projectId, type: "SYSTEM", body: `Görev tamamlandı: ${t.title}`, authorId: user.id } });
  refresh(t.projectId ?? undefined);
}

export async function deleteTask(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const t = await prisma.crmTask.delete({ where: { id }, select: { projectId: true } }).catch(() => null);
  refresh(t?.projectId ?? undefined);
}

/** Talepler ekranından: CRM'e bağlı olmayan (eski) talebi aktarır. */
export async function intakeExistingRequest(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const res = await intakeRequest(id);
  const r = await prisma.contactRequest.findUnique({ where: { id }, select: { crmProjectId: true } });
  refresh();
  if (r?.crmProjectId) redirect(`/admin/crm/proje/${r.crmProjectId}${res ? "?aktarildi=1" : ""}`);
}

const templateSchema = z.object({ title: required("Başlık", 120), body: required("Mesaj", 2000), sortOrder: z.coerce.number().int().min(0).max(999).catch(0), active: z.string().optional() });

export async function saveTemplate(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = templateSchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const data = { title: parsed.data.title, body: parsed.data.body, sortOrder: parsed.data.sortOrder, active: parsed.data.active === "on" || parsed.data.active === "true" };
  if (id) await prisma.crmMessageTemplate.update({ where: { id }, data });
  else await prisma.crmMessageTemplate.create({ data });
  revalidatePath("/admin/crm", "layout");
  redirect("/admin/crm/mesajlar?kaydedildi=1");
}

export async function deleteTemplate(formData: FormData) {
  await requireAdmin("ADMIN");
  await prisma.crmMessageTemplate.delete({ where: { id: String(formData.get("id") ?? "") } }).catch(() => null);
  revalidatePath("/admin/crm", "layout");
}
