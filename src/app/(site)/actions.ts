"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { getIpHash } from "@/lib/request-meta";
import { isFormRateLimited } from "@/lib/rate-limit";
import { PROJECT_STAGES, PROJECT_TIMELINES, PROJECT_TOPICS } from "@/content/company";
import { DISTRICT_OPTIONS } from "@/content/service-areas/names";

export type RequestFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<"name" | "phone" | "email" | "message" | "kvkk", string>>;
  values?: Record<string, string>;
};

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null);

/** Yalnızca listedeki değerler kabul edilir; boş/yabancı değer null olur (istemciye güvenilmez). */
const oneOf = (list: readonly string[]) =>
  z
    .string()
    .trim()
    .transform((v) => (list.includes(v) ? v : null));

const schema = z.object({
  type: z.enum(["CONTACT", "QUOTE", "SHOWROOM"]),
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
  productId: optionalText(40),
  categoryId: optionalText(40),
  message: optionalText(3000),
  sourcePath: optionalText(300),
  district: oneOf(DISTRICT_OPTIONS),
  topic: oneOf(PROJECT_TOPICS),
  projectStage: oneOf(PROJECT_STAGES),
  timeline: oneOf(PROJECT_TIMELINES),
  selection: optionalText(600),
  kvkk: z.literal("on", { error: "Devam etmek için KVKK aydınlatma metnini onaylamanız gerekir." }),
});

const MIN_FILL_MS = 2500;

/**
 * İletişim / teklif formu. Spam koruması katmanları: gizli honeypot alanı, formun çok hızlı gönderilmesi
 * (bot), IP özeti başına saatlik limit. Captcha gerekirse bu fonksiyonun başına eklenir (mimari hazır).
 */
export async function submitRequest(_prev: RequestFormState, formData: FormData): Promise<RequestFormState> {
  const raw = Object.fromEntries(
    ["type", "name", "phone", "email", "productId", "categoryId", "message", "sourcePath", "district", "topic", "projectStage", "timeline", "selection", "kvkk"].map((k) => [k, String(formData.get(k) ?? "")]),
  );
  const values = { ...raw };
  delete values.kvkk;

  // Honeypot doluysa veya form insan hızının altında gönderildiyse: sessizce "başarılı" dön (bota ipucu verme).
  const startedAt = Number(formData.get("startedAt"));
  if (String(formData.get("website") ?? "") !== "" || !startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    return { status: "success", message: "Talebiniz alındı. En kısa sürede size dönüş yapacağız." };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: RequestFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<RequestFormState["errors"]>;
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return { status: "error", message: "Lütfen işaretli alanları kontrol edin.", errors, values };
  }

  try {
    const ipHash = await getIpHash();
    if (await isFormRateLimited(ipHash)) {
      return { status: "error", message: "Kısa sürede çok fazla talep gönderildi. Lütfen daha sonra tekrar deneyin veya bizi arayın.", values };
    }

    const d = parsed.data;
    // Seçilen ürün/kategori gerçekten var ve aktif mi? (İstemciden gelen id'ye güvenilmez.)
    const [product, category] = await Promise.all([
      d.productId ? prisma.product.findFirst({ where: { id: d.productId, active: true }, select: { id: true, name: true, categoryId: true } }) : null,
      d.categoryId ? prisma.productCategory.findFirst({ where: { id: d.categoryId, active: true }, select: { id: true, name: true } }) : null,
    ]);

    await prisma.contactRequest.create({
      data: {
        type: d.type,
        name: d.name,
        phone: d.phone,
        email: d.email,
        message: d.message,
        productId: product?.id ?? null,
        productName: product?.name ?? null,
        categoryId: category?.id ?? null,
        categoryName: category?.name ?? null,
        sourcePath: d.sourcePath?.startsWith("/") ? d.sourcePath : null,
        district: d.district,
        topic: d.topic,
        projectStage: d.projectStage,
        timeline: d.timeline,
        // Ürün seçenekleri ve/veya seçim rehberi yanıtları (rehber ürün sayfası dışından da gönderilebilir).
        selection: d.selection,
        kvkkConsent: true,
        consentAt: new Date(),
        ipHash,
      },
    });
  } catch {
    return { status: "error", message: "Talebiniz şu an kaydedilemedi. Lütfen tekrar deneyin ya da telefonla ulaşın.", values };
  }

  return { status: "success", message: "Teşekkürler, talebiniz bize ulaştı. En kısa sürede size dönüş yapacağız." };
}
