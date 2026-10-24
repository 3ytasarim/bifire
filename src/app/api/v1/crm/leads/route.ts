import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { intakeLead } from "@/lib/crm/intake";

export const dynamic = "force-dynamic";

/**
 * Dış kanallardan CRM'e talep kaydı (Instagram/Facebook reklam formları, Zapier/Make köprüsü, diğer sistemler).
 * Yetki: \`Authorization: Bearer <CRM_INTAKE_TOKEN>\` (.env). Anahtar tanımlı değilse uç nokta kapalıdır (503).
 * Yalnız kayıt açar: müşteri eşleştirilir, proje + ilk dönüş görevi oluşturulur. Müşteriye mesaj gönderilmez.
 */
const SOURCES = ["INSTAGRAM", "FACEBOOK", "META_LEAD", "WHATSAPP", "PHONE", "REFERRAL", "OTHER"] as const;
const schema = z
  .object({
    name: z.string().trim().min(1).max(160),
    phone: z.string().trim().max(40).optional(),
    email: z.string().trim().email().max(160).optional(),
    district: z.string().trim().max(120).optional(),
    source: z.enum(SOURCES).default("META_LEAD"),
    product: z.string().trim().max(160).optional(),
    message: z.string().trim().max(2000).optional(),
    campaign: z.string().trim().max(160).optional(),
  })
  .refine((d) => d.phone || d.email, { message: "phone veya email gerekli" });

function authorized(req: Request) {
  const token = process.env.CRM_INTAKE_TOKEN?.trim();
  if (!token || token.length < 24) return null;
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(got);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const ok = authorized(req);
  if (ok === null) return Response.json({ error: "CRM kayıt kapısı kapalı (CRM_INTAKE_TOKEN tanımlı değil)." }, { status: 503 });
  if (!ok) return Response.json({ error: "Yetkisiz." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Geçersiz veri.", issues: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  const d = parsed.data;
  const detail = [d.campaign && `Kampanya: ${d.campaign}`, d.product && `Ürün: ${d.product}`, d.message && `Mesaj: ${d.message}`].filter(Boolean).join("\n");
  const res = await intakeLead({
    name: d.name,
    phone: d.phone,
    email: d.email,
    district: d.district,
    source: d.source,
    title: d.product || "Yeni talep",
    activity: `Dış kanal (${d.source}) üzerinden talep${detail ? `\n${detail}` : ""}`,
  });
  return Response.json({ ok: true, projectId: res.projectId, matchedExistingCustomer: res.matched }, { status: 201 });
}
