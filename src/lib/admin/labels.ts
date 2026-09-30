import type { RequestStatus } from "@prisma/client";

export const REQUEST_STATUS: Record<RequestStatus, { label: string; tone: "neutral" | "green" | "amber" | "red" | "ember" }> = {
  NEW: { label: "Yeni", tone: "ember" },
  IN_PROGRESS: { label: "İlgileniliyor", tone: "amber" },
  QUOTED: { label: "Teklif verildi", tone: "neutral" },
  WON: { label: "Satışa döndü", tone: "green" },
  LOST: { label: "Kaybedildi", tone: "red" },
  CLOSED: { label: "Kapandı", tone: "neutral" },
};
