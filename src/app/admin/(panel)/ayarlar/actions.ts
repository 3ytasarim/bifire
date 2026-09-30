"use server";

import { z } from "zod";
import { formObject, optional, optionalImage, zodErrors, type ActionState } from "@/lib/admin/form";
import { revalidateSite } from "@/lib/admin/revalidate";
import { requireAdmin } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";

const https = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https:\/\//i.test(v), "https:// ile başlayan tam adres girin.")
  .transform((v) => (v === "" ? null : v));

const phone = z
  .string()
  .trim()
  .max(40)
  .refine((v) => v === "" || v.replace(/\D/g, "").length >= 10, "Geçerli bir telefon numarası girin.")
  .transform((v) => (v === "" ? null : v));

const schema = z.object({
  companyName: z.string().trim().min(1, "Firma adı zorunlu.").max(120),
  logoUrl: optionalImage,
  faviconUrl: optionalImage,
  phone,
  whatsapp: phone,
  whatsappMessage: optional(300),
  email: z
    .string()
    .trim()
    .max(160)
    .refine((v) => v === "" || z.email().safeParse(v).success, "Geçerli bir e-posta girin.")
    .transform((v) => (v === "" ? null : v)),
  address: optional(400),
  mapsUrl: https,
  mapsEmbedUrl: https,
  workingHours: optional(160),
  instagramUrl: https,
  facebookUrl: https,
  youtubeUrl: https,
  linkedinUrl: https,
  pinterestUrl: https,
  footerDescription: optional(500),
  defaultOgImage: optionalImage,
  aboutImage: optionalImage,
  aboutImageAlt: optional(250),
  featureImage: optionalImage,
  featureImageAlt: optional(250),
});

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin("ADMIN");
  const parsed = schema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  await prisma.siteSetting.upsert({ where: { id: "site" }, create: { id: "site", ...parsed.data }, update: parsed.data });
  revalidateSite();
  return { status: "success", message: "Site ayarları kaydedildi." };
}
