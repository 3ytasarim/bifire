import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Bifire CRM → site çekme isteğinin imza doğrulaması (CRM'deki src/lib/integrations/website-pull.ts ile aynı).
 *
 *   X-Bifire-Signature = "v1=" + hex(HMAC-SHA256(CRM_WEBSITE_HMAC_SECRET, `${timestamp}.${nonce}.GET ${yol+sorgu}`))
 *
 * Zaman penceresi ±5 dk. Uç yalnız okuma yaptığı ve TLS üzerinden çalıştığı için nonce tekrarı ayrıca saklanmaz.
 * Varsayılan KAPALI: CRM_PULL_ENABLED=true ve en az 32 karakterlik sır yoksa uç 404 döner (varlığını belli etmez).
 */
const WINDOW_SEC = 300;
const NONCE_RE = /^[A-Za-z0-9_-]{16,64}$/;

export function crmExportSecret(): string | null {
  if (process.env.CRM_PULL_ENABLED !== "true") return null;
  const secret = process.env.CRM_WEBSITE_HMAC_SECRET ?? "";
  return secret.length >= 32 ? secret : null;
}

export type ExportAuth = { ok: true } | { ok: false; code: "missing_headers" | "invalid_nonce" | "stale_timestamp" | "invalid_signature" };

export function verifyExportRequest(input: { secret: string; timestamp: string | null; nonce: string | null; signature: string | null; pathAndQuery: string; nowSec?: number }): ExportAuth {
  const { secret, timestamp, nonce, signature, pathAndQuery } = input;
  if (!timestamp || !nonce || !signature) return { ok: false, code: "missing_headers" };
  if (!NONCE_RE.test(nonce)) return { ok: false, code: "invalid_nonce" };
  if (!/^\d{9,11}$/.test(timestamp)) return { ok: false, code: "stale_timestamp" };
  const now = input.nowSec ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > WINDOW_SEC) return { ok: false, code: "stale_timestamp" };
  const expected = Buffer.from("v1=" + createHmac("sha256", secret).update(`${timestamp}.${nonce}.GET ${pathAndQuery}`).digest("hex"));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { ok: false, code: "invalid_signature" };
  return { ok: true };
}
