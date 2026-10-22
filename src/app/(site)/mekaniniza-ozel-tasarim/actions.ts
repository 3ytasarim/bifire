"use server";

import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { z } from "zod";
import { DESIGN_FLUE, DESIGN_PREFERENCES } from "@/content/design-service";
import { DISTRICT_OPTIONS } from "@/content/regions";
import { prisma } from "@/lib/db";
import { isFormRateLimited } from "@/lib/rate-limit";
import { getIpHash } from "@/lib/request-meta";
import { privateStorage } from "@/lib/storage/private";

export type DesignFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<"name" | "phone" | "email" | "photo" | "wallWidth" | "ceilingHeight" | "kvkk", string>>;
  /** Hata sonrası React formu sıfırlar; iletişim alanları buradan geri doldurulur. */
  values?: { name?: string; phone?: string; email?: string; district?: string };
};

const MAX_BYTES = 8 * 1024 * 1024;
const FORMATS: Record<string, string> = { "image/jpeg": "jpeg", "image/png": "png", "image/webp": "webp" };
const MIN_FILL_MS = 4000;

const cm = (min: number, max: number, msg: string) =>
  z
    .string()
    .trim()
    .transform((v) => v.replace(",", "."))
    .refine((v) => v === "" || (Number.isFinite(Number(v)) && Number(v) >= min && Number(v) <= max), msg)
    .transform((v) => (v === "" ? null : Math.round(Number(v))));

const oneOf = (list: readonly string[], fallback: string | null = null) =>
  z
    .string()
    .trim()
    .transform((v) => (list.includes(v) ? v : fallback));

const schema = z.object({
  name: z.string().trim().min(2, "Lütfen adınızı ve soyadınızı yazın.").max(120, "Ad soyad çok uzun."),
  phone: z
    .string()
    .trim()
    .refine((v) => {
      const digits = v.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15;
    }, "Geçerli bir telefon numarası yazın."),
  email: z
    .string()
    .trim()
    .max(160)
    .refine((v) => v === "" || z.email().safeParse(v).success, "Geçerli bir e-posta adresi yazın.")
    .transform((v) => v || null),
  district: oneOf(DISTRICT_OPTIONS),
  preference: oneOf(DESIGN_PREFERENCES, "Birlikte seçelim"),
  flue: oneOf(DESIGN_FLUE, "Henüz bilmiyorum"),
  wallWidth: cm(30, 3000, "Duvar genişliğini 30–3000 cm arasında yazın."),
  ceilingHeight: cm(150, 1500, "Tavan yüksekliğini 150–1500 cm arasında yazın."),
  note: z
    .string()
    .trim()
    .max(2000)
    .transform((v) => v || null),
  kvkk: z.literal("on", { error: "Devam etmek için KVKK aydınlatma metnini onaylamanız gerekir." }),
});

/**
 * Fotoğrafı doğrular ve yeniden kodlar: sharp gerçek içeriği okuyabilmeli, biçim beyan edilen türle eşleşmeli.
 * Yeniden kodlama EXIF/GPS gibi dosya içi kişisel verileri temizler; uzun kenar 2560 px ile sınırlanır.
 */
async function processPhoto(file: File) {
  if (file.size > MAX_BYTES) throw new Error("Fotoğraf çok büyük. Lütfen 12 MB'tan küçük bir dosya seçin.");
  const format = FORMATS[file.type];
  if (!format) throw new Error("Yalnızca JPG, PNG veya WebP fotoğraf yükleyebilirsiniz.");
  const input = Buffer.from(await file.arrayBuffer());
  let meta;
  try {
    meta = await sharp(input).metadata();
  } catch {
    throw new Error("Dosya geçerli bir fotoğraf değil.");
  }
  if (!meta.width || !meta.height || meta.format !== format) throw new Error("Dosya içeriği fotoğraf türüyle uyuşmuyor.");
  const { data, info } = await sharp(input).rotate().resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 86, mozjpeg: true }).toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** "Mekânınıza özel tasarım" talebi: tercihler + (isteğe bağlı) mekân fotoğrafı. Fotoğraf özel depoya yazılır. */
export async function submitDesignRequest(_prev: DesignFormState, formData: FormData): Promise<DesignFormState> {
  const ok: DesignFormState = { status: "success", message: "Teşekkürler, mekân bilgileriniz bize ulaştı. Ekibimiz değerlendirip kapsamı netleştirmek için sizinle iletişime geçecek." };
  // Honeypot doluysa veya form insan hızının altında gönderildiyse: sessizce "başarılı" dön.
  const startedAt = Number(formData.get("startedAt"));
  if (String(formData.get("website") ?? "") !== "" || !startedAt || Date.now() - startedAt < MIN_FILL_MS) return ok;

  const raw = Object.fromEntries(["name", "phone", "email", "district", "preference", "flue", "wallWidth", "ceilingHeight", "note", "kvkk"].map((k) => [k, String(formData.get(k) ?? "")]));
  const values = { name: raw.name, phone: raw.phone, email: raw.email, district: raw.district };
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: DesignFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<DesignFormState["errors"]>;
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return { status: "error", message: "Lütfen işaretli alanları kontrol edin.", errors, values };
  }

  const file = formData.get("photo");
  let photo: Awaited<ReturnType<typeof processPhoto>> | null = null;
  if (file instanceof File && file.size > 0) {
    try {
      photo = await processPhoto(file);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Fotoğraf işlenemedi.";
      return { status: "error", message: msg, errors: { photo: msg }, values };
    }
  }

  const d = parsed.data;
  const selection = [
    `Şömine tercihi: ${d.preference}`,
    d.wallWidth ? `Duvar genişliği: ~${d.wallWidth} cm` : null,
    d.ceilingHeight ? `Tavan yüksekliği: ~${d.ceilingHeight} cm` : null,
    `Baca: ${d.flue}`,
    photo ? "Mekân fotoğrafı ekli" : "Fotoğraf eklenmedi",
  ]
    .filter(Boolean)
    .join(" · ");

  let storedKey: string | null = null;
  try {
    const ipHash = await getIpHash();
    if (await isFormRateLimited(ipHash)) {
      return { status: "error", message: "Kısa sürede çok fazla talep gönderildi. Lütfen daha sonra tekrar deneyin veya bizi arayın.", values };
    }
    const now = new Date();
    if (photo) {
      storedKey = `talepler/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/mekan-${randomBytes(12).toString("hex")}.jpg`;
      await privateStorage.put(storedKey, photo.data);
    }
    await prisma.contactRequest.create({
      data: {
        type: "DESIGN",
        name: d.name,
        phone: d.phone,
        email: d.email,
        message: d.note,
        district: d.district,
        topic: "Mekânınıza özel tasarım",
        selection,
        sourcePath: "/mekaniniza-ozel-tasarim",
        kvkkConsent: true,
        consentAt: now,
        ipHash,
        attachments: photo && storedKey ? { create: { storageKey: storedKey, originalName: file instanceof File ? file.name.slice(0, 200) : null, mimeType: "image/jpeg", size: photo.data.length, width: photo.width, height: photo.height } } : undefined,
      },
    });
  } catch {
    if (storedKey) await privateStorage.remove(storedKey);
    return { status: "error", message: "Talebiniz şu an kaydedilemedi. Lütfen tekrar deneyin ya da telefonla ulaşın.", values };
  }
  return ok;
}
