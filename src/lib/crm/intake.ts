import "server-only";
import type { CrmSource, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { REQUEST_TYPE } from "@/lib/admin/labels";
import { emailKey, phoneKey } from "./keys";
import { REQUEST_SOURCE } from "./labels";

/** İlk dönüş görevi ve sonraki takip için varsayılan süre (saat). */
const FIRST_RESPONSE_HOURS = 24;
/** Aynı müşterinin açık projesi bu kadar gün içinde güncellendiyse yeni talep o projeye eklenir. */
const REUSE_OPEN_PROJECT_DAYS = 120;

/** Telefon veya e-posta anahtarı eşleşen müşteriler (en yeni önce). */
export function findMatchingCustomers(input: { phone?: string | null; email?: string | null }, excludeId?: string) {
  const pk = phoneKey(input.phone);
  const ek = emailKey(input.email);
  if (!pk && !ek) return Promise.resolve([]);
  return prisma.crmCustomer.findMany({
    where: { AND: [{ OR: [...(pk ? [{ phoneKey: pk }] : []), ...(ek ? [{ emailKey: ek }] : [])] }, excludeId ? { id: { not: excludeId } } : {}] },
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: { id: true, code: true, name: true, phone: true, email: true, district: true, _count: { select: { projects: true } } },
  });
}

type LeadInput = {
  name: string;
  phone?: string | null;
  email?: string | null;
  district?: string | null;
  source: CrmSource;
  /** Proje başlığı (ürün/şömine türü). */
  title: string;
  productId?: string | null;
  /** Görüşme geçmişine düşülecek sistem kaydı. */
  activity: string;
  requestId?: string | null;
};

/**
 * Gelen talebi CRM'e işler: müşteriyi telefon/e-posta ile eşleştirir (yoksa oluşturur), müşterinin yakın tarihli açık
 * projesi varsa talebi ona ekler, yoksa "Yeni talep" aşamasında proje açar; ilk dönüş görevi oluşturur.
 * Müşteriye hiçbir mesaj göndermez — yalnız kayıt ve ekip içi görev.
 */
export async function intakeLead(input: LeadInput) {
  const pk = phoneKey(input.phone);
  const ek = emailKey(input.email);
  return prisma.$transaction(
    async (tx) => {
      let customer = pk || ek ? await tx.crmCustomer.findFirst({ where: { OR: [...(pk ? [{ phoneKey: pk }] : []), ...(ek ? [{ emailKey: ek }] : [])] }, orderBy: { updatedAt: "desc" } }) : null;
      const existed = Boolean(customer);
      if (customer) {
        // Eksik iletişim bilgisi tamamlanır; mevcut bilgi ezilmez.
        const patch: Prisma.CrmCustomerUpdateInput = {};
        if (!customer.phone && input.phone) Object.assign(patch, { phone: input.phone, phoneKey: pk });
        if (!customer.email && input.email) Object.assign(patch, { email: input.email, emailKey: ek });
        if (!customer.district && input.district) patch.district = input.district;
        customer = await tx.crmCustomer.update({ where: { id: customer.id }, data: patch });
      } else {
        customer = await tx.crmCustomer.create({ data: { name: input.name, phone: input.phone || null, phoneKey: pk, email: input.email || null, emailKey: ek, district: input.district || null, source: input.source } });
      }

      const since = new Date(Date.now() - REUSE_OPEN_PROJECT_DAYS * 864e5);
      const open = await tx.crmProject.findFirst({ where: { customerId: customer.id, stage: { notIn: ["DONE", "LOST"] }, updatedAt: { gte: since } }, orderBy: { updatedAt: "desc" } });
      const due = new Date(Date.now() + FIRST_RESPONSE_HOURS * 36e5);
      const project =
        open ??
        (await tx.crmProject.create({
          data: { customerId: customer.id, title: input.title, location: input.district || null, source: input.source, productId: input.productId || null, nextFollowUpAt: due },
        }));
      await tx.crmActivity.create({ data: { projectId: project.id, type: "SYSTEM", body: input.activity } });
      await tx.crmTask.create({ data: { projectId: project.id, title: open ? `Yeni talebi değerlendirin: ${input.name}` : `İlk dönüş: ${input.name} ile görüşün`, dueAt: due, assigneeId: project.ownerId } });
      if (open) await tx.crmProject.update({ where: { id: project.id }, data: { nextFollowUpAt: open.nextFollowUpAt && open.nextFollowUpAt < due ? open.nextFollowUpAt : due } });
      if (input.requestId) await tx.contactRequest.update({ where: { id: input.requestId }, data: { crmCustomerId: customer.id, crmProjectId: project.id } });
      return { customerId: customer.id, projectId: project.id, matched: existed, reused: Boolean(open) };
    },
    { maxWait: 10000, timeout: 20000 },
  );
}

/** Web formundan gelen talebi CRM'e aktarır (zaten bağlıysa bir şey yapmaz). */
export async function intakeRequest(requestId: string) {
  const r = await prisma.contactRequest.findUnique({ where: { id: requestId } });
  if (!r || r.crmProjectId) return null;
  const type = REQUEST_TYPE[r.type];
  const detail = [r.productName && `Ürün: ${r.productName}`, r.selection && `Seçim: ${r.selection}`, r.topic && `Konu: ${r.topic}`, r.projectStage && `Proje aşaması: ${r.projectStage}`, r.timeline && `Dönem: ${r.timeline}`, r.message && `Mesaj: ${r.message}`, r.sourcePath && `Sayfa: ${r.sourcePath}`]
    .filter(Boolean)
    .join("\n");
  return intakeLead({
    name: r.name,
    phone: r.phone,
    email: r.email,
    district: r.district,
    source: REQUEST_SOURCE[r.type],
    title: r.productName || r.categoryName || r.topic || type.label,
    productId: r.productId,
    activity: `Web formu: ${type.label}${detail ? `\n${detail}` : ""}`,
    requestId: r.id,
  });
}

/** Form akışını asla bozmaz: CRM aktarımı başarısız olursa talep yine kayıtlıdır (Talepler'den aktarılabilir). */
export async function safeIntakeRequest(requestId: string) {
  try {
    await intakeRequest(requestId);
  } catch (e) {
    console.error("CRM aktarımı başarısız", requestId, e instanceof Error ? e.message : e);
  }
}
