import type { CrmActivityType, CrmSource, CrmStage, RequestType } from "@prisma/client";

type Tone = "neutral" | "green" | "amber" | "red" | "ember";

/** Satış aşamaları (sıra = süreç sırası). DONE/LOST kapanmış projelerdir. */
export const CRM_STAGES: Record<CrmStage, { label: string; tone: Tone; open: boolean }> = {
  NEW: { label: "Yeni talep", tone: "ember", open: true },
  SHOWROOM: { label: "Showroom / Keşif", tone: "amber", open: true },
  QUOTE: { label: "Teklif / Karar", tone: "neutral", open: true },
  ORDER: { label: "Sipariş / Uygulama", tone: "green", open: true },
  DONE: { label: "Tamamlandı", tone: "green", open: false },
  LOST: { label: "Kaybedildi", tone: "red", open: false },
};
export const STAGE_ORDER = Object.keys(CRM_STAGES) as CrmStage[];
export const OPEN_STAGES = STAGE_ORDER.filter((s) => CRM_STAGES[s].open);

export const CRM_SOURCES: Record<CrmSource, string> = {
  WEB_QUOTE: "Web · teklif formu",
  WEB_SHOWROOM: "Web · showroom randevusu",
  WEB_DESIGN: "Web · mekâna özel tasarım",
  WEB_CONTACT: "Web · iletişim formu",
  PHONE: "Telefon",
  SHOWROOM_VISIT: "Showroom ziyareti",
  REFERRAL: "Referans",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  WHATSAPP: "WhatsApp",
  META_LEAD: "Meta reklam formu",
  OTHER: "Diğer",
};
/** Ekibin elle girebileceği kanallar (web formları otomatik gelir). */
export const MANUAL_SOURCES: CrmSource[] = ["PHONE", "SHOWROOM_VISIT", "REFERRAL", "INSTAGRAM", "FACEBOOK", "WHATSAPP", "META_LEAD", "OTHER"];

export const REQUEST_SOURCE: Record<RequestType, CrmSource> = {
  QUOTE: "WEB_QUOTE",
  SHOWROOM: "WEB_SHOWROOM",
  DESIGN: "WEB_DESIGN",
  CONTACT: "WEB_CONTACT",
};

export const CRM_ACTIVITY: Record<CrmActivityType, string> = {
  NOTE: "Not",
  CALL: "Telefon görüşmesi",
  VISIT: "Showroom / keşif",
  MESSAGE: "Mesaj",
  STAGE: "Aşama değişikliği",
  SYSTEM: "Sistem",
};
/** Ekibin elle ekleyebileceği görüşme türleri. */
export const MANUAL_ACTIVITY: CrmActivityType[] = ["NOTE", "CALL", "VISIT", "MESSAGE"];

export const USAGE_OPTIONS = ["Isınma ve atmosfer", "Ağırlıklı ısınma", "Dekoratif / atmosfer", "Dış mekân", "Henüz belli değil"];

export const customerCode = (n: number) => `BF-${String(n).padStart(4, "0")}`;
export const projectCode = (n: number) => `P-${String(n).padStart(4, "0")}`;

/** Takip / görev tarihinin durumu (İstanbul saatine göre gün karşılaştırması). */
export function dueState(date: Date | null | undefined, done = false): { label: string; tone: Tone } | null {
  if (!date) return null;
  if (done) return { label: "Tamamlandı", tone: "green" };
  const day = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" });
  const today = day(new Date());
  const d = day(date);
  if (d < today) return { label: "Gecikti", tone: "red" };
  if (d === today) return { label: "Bugün", tone: "amber" };
  return { label: "Planlandı", tone: "neutral" };
}

export const fmtDate = (d: Date | null | undefined) => (d ? d.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" }) : "—");
export const fmtDateTime = (d: Date) => d.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Istanbul" });
export const fmtMoney = (v: { toString(): string } | null | undefined) =>
  v === null || v === undefined ? "—" : `₺${Number(v.toString()).toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`;
