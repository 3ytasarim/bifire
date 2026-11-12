import { prisma } from "@/lib/db";
import { buildCrmPayload } from "@/lib/crm/forward";
import { crmExportSecret, verifyExportRequest } from "@/lib/crm/export-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/v1/crm/export/requests?after=<ISO>&afterId=<id>&limit=<1-10>
 *
 * Bifire CRM'in form başvurularını siteden ÇEKMESİ için (CRM siteye ulaşılamaz yerdeyken de çalışır).
 * Yalnız okur; sitenin davranışını değiştirmez. Yük, site → CRM gönderimindeki v1 yükünün aynısıdır.
 * Sıra: createdAt, id (artan). İmleç: son öğenin (submittedAt, submissionId) değeri; `next` null ise sona gelindi.
 * Yetki: HMAC imzası (bkz. lib/crm/export-auth.ts). Kapalıyken veya imza yoksa ayrıntı verilmez.
 */
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });

export async function GET(req: Request) {
  const secret = crmExportSecret();
  if (!secret) return json({ error: { code: "not_found" } }, 404);

  const url = new URL(req.url);
  const auth = verifyExportRequest({
    secret,
    timestamp: req.headers.get("x-bifire-timestamp"),
    nonce: req.headers.get("x-bifire-nonce"),
    signature: req.headers.get("x-bifire-signature"),
    pathAndQuery: url.pathname + url.search,
  });
  if (!auth.ok) return json({ error: { code: auth.code } }, 401);

  const after = new Date(url.searchParams.get("after") ?? "");
  const afterId = url.searchParams.get("afterId") ?? "";
  const limit = Math.min(10, Math.max(1, Number(url.searchParams.get("limit")) || 5));
  if (Number.isNaN(after.getTime()) || afterId.length > 64) return json({ error: { code: "invalid_cursor" } }, 400);

  const rows = await prisma.contactRequest.findMany({
    where: { OR: [{ createdAt: { gt: after } }, { createdAt: after, id: { gt: afterId } }] },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: limit + 1,
    select: { id: true, createdAt: true },
  });
  const page = rows.slice(0, limit);
  const items = [];
  for (const r of page) {
    const p = await buildCrmPayload(r.id);
    if (p) items.push(p);
  }
  const last = page.at(-1);
  const next = rows.length > limit && last ? { after: last.createdAt.toISOString(), afterId: last.id } : null;
  return json({ items, next });
}
