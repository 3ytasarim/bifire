"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { fail, formObject, optional, optionalImage, zodErrors, type ActionState } from "@/lib/admin/form";
import { revalidateSite } from "@/lib/admin/revalidate";
import { requireAdmin } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { findTarget } from "@/lib/local-content-catalog";
import { sanitizeRichText } from "@/lib/sanitize";

const schema = z.object({
  intro: z.string().max(60_000).optional().default(""),
  note: z.string().max(30_000).optional().default(""),
  image: optionalImage,
  imageAlt: optional(200),
  image2: optionalImage,
  image2Alt: optional(200),
});

/** Yerel içerik kaydı. Tüm alanlar boşsa kayıt silinir: sayfa yeniden yalnız ortak şablonla açılır. */
export async function saveLocalContent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const key = String(formData.get("key") ?? "");
  const target = await findTarget(key);
  if (!target) return fail("Geçersiz sayfa.");
  const parsed = schema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;
  if (d.image && !d.imageAlt) return fail("Görselin alt metnini yazın (ne gösterdiğini anlatan kısa cümle).", { imageAlt: "Alt metin gerekli." });
  if (d.image2 && !d.image2Alt) return fail("İkinci görselin alt metnini yazın.", { image2Alt: "Alt metin gerekli." });
  const data = {
    intro: sanitizeRichText(d.intro) || null,
    note: sanitizeRichText(d.note) || null,
    image: d.image ?? null,
    imageAlt: d.image ? (d.imageAlt ?? null) : null,
    image2: d.image2 ?? null,
    image2Alt: d.image2 ? (d.image2Alt ?? null) : null,
  };
  const empty = !data.intro && !data.note && !data.image && !data.image2;
  if (empty) await prisma.localContent.deleteMany({ where: { key } });
  else await prisma.localContent.upsert({ where: { key }, create: { key, ...data }, update: data });
  revalidateSite();
  redirect(`/admin/yerel-icerik/duzenle?k=${encodeURIComponent(key)}&kaydedildi=${empty ? "bos" : "1"}`);
}
