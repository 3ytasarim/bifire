import "server-only";
import { cache } from "react";
import type { SiteSetting } from "@prisma/client";
import { prisma } from "@/lib/db";

export type SiteSettings = SiteSetting;

const EMPTY: Omit<SiteSetting, "updatedAt"> = {
  id: "site",
  companyName: "Bifire",
  logoUrl: null,
  faviconUrl: null,
  phone: null,
  whatsapp: null,
  whatsappMessage: null,
  email: null,
  address: null,
  mapsUrl: null,
  mapsEmbedUrl: null,
  workingHours: null,
  instagramUrl: null,
  facebookUrl: null,
  youtubeUrl: null,
  linkedinUrl: null,
  pinterestUrl: null,
  footerDescription: null,
  defaultOgImage: null,
  aboutImage: null,
  aboutImageAlt: null,
  aboutImageCaption: null,
  aboutVideo: null,
  featureImage: null,
  featureImageAlt: null,
};

/** İstek başına tek sorgu. Kayıt yoksa (ilk kurulum) boş varsayılanlar döner — sayfa asla kırılmaz. */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const row = await prisma.siteSetting.findUnique({ where: { id: "site" } });
  return row ?? { ...EMPTY, updatedAt: new Date(0) };
});

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** wa.me bağlantısı; numara ve hazır mesaj Site Ayarları'ndan gelir (hard-code yok). */
export function whatsappHref(settings: Pick<SiteSettings, "whatsapp" | "whatsappMessage">, context?: string): string | null {
  const digits = settings.whatsapp?.replace(/\D/g, "");
  if (!digits) return null;
  const base = settings.whatsappMessage?.trim() || "Merhaba, şömine modelleriniz hakkında bilgi almak istiyorum.";
  const text = context ? `${base}\n${context}` : base;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function socialLinks(s: SiteSettings): { kind: "instagram" | "facebook" | "youtube" | "linkedin" | "pinterest"; url: string; label: string }[] {
  const list = [
    { kind: "instagram" as const, url: s.instagramUrl, label: "Instagram" },
    { kind: "facebook" as const, url: s.facebookUrl, label: "Facebook" },
    { kind: "youtube" as const, url: s.youtubeUrl, label: "YouTube" },
    { kind: "linkedin" as const, url: s.linkedinUrl, label: "LinkedIn" },
    { kind: "pinterest" as const, url: s.pinterestUrl, label: "Pinterest" },
  ];
  return list.filter((x): x is typeof x & { url: string } => Boolean(x.url));
}
