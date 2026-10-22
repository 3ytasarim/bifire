import type { RequestStatus, RequestType } from "@prisma/client";

export const REQUEST_STATUS: Record<RequestStatus, { label: string; tone: "neutral" | "green" | "amber" | "red" | "ember" }> = {
  NEW: { label: "Yeni", tone: "ember" },
  IN_PROGRESS: { label: "İlgileniliyor", tone: "amber" },
  QUOTED: { label: "Teklif verildi", tone: "neutral" },
  WON: { label: "Satışa döndü", tone: "green" },
  LOST: { label: "Kaybedildi", tone: "red" },
  CLOSED: { label: "Kapandı", tone: "neutral" },
};

export const REQUEST_TYPE: Record<RequestType, { label: string; short: string; tone: "neutral" | "green" | "amber" | "red" | "ember" }> = {
  QUOTE: { label: "Teklif talebi", short: "Teklif", tone: "ember" },
  SHOWROOM: { label: "Showroom randevusu", short: "Showroom", tone: "amber" },
  CONTACT: { label: "İletişim", short: "İletişim", tone: "neutral" },
  DESIGN: { label: "Mekâna özel tasarım", short: "Tasarım", tone: "green" },
};
