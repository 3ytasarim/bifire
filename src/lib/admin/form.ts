import "server-only";
import { z } from "zod";
import { SLUG_PATTERN, slugify } from "@/lib/slug";

/** Tüm admin form action'larının ortak dönüş tipi (useActionState). */
export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: Record<string, string>;
};

export const idle: ActionState = { status: "idle" };

export function fail(message: string, errors?: Record<string, string>): ActionState {
  return { status: "error", message, errors };
}

export function zodErrors(error: z.ZodError): ActionState {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return fail("Lütfen işaretli alanları düzeltin.", errors);
}

// ── FormData → alan dönüştürücüleri ──

export const text = (max = 250) => z.string().trim().max(max, `En fazla ${max} karakter.`);
export const required = (label: string, max = 250) => text(max).min(1, `${label} zorunlu.`);
export const optional = (max = 250) =>
  text(max).transform((v) => (v === "" ? null : v));

export const bool = z
  .union([z.literal("on"), z.literal("true"), z.literal(""), z.null(), z.undefined()])
  .transform((v) => v === "on" || v === "true");

export const int = (min = 0, max = 1_000_000) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? 0 : Number(v)))
    .pipe(z.number().int("Tam sayı girin.").min(min).max(max));

export const optionalNumber = (max = 1_000_000) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v.replace(",", "."))))
    .pipe(z.number().min(0, "Negatif olamaz.").max(max).nullable());

export const optionalInt = (max = 1_000_000) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v)))
    .pipe(z.number().int("Tam sayı girin.").min(0).max(max).nullable());

/** Site içi yol (/urunler) veya http(s) URL. javascript: vb. şemalar reddedilir. */
export const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v), "Site içi yol (/...) veya http(s):// adres girin.")
  .transform((v) => (v === "" ? null : v));

/** Yüklenen görsel yolu (/uploads/...) veya public/ altındaki statik yol. */
export const optionalImage = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || (v.startsWith("/") && !v.startsWith("//")), "Geçersiz görsel.")
  .transform((v) => (v === "" ? null : v));

export const slugField = z
  .string()
  .trim()
  .transform((v) => slugify(v))
  .pipe(z.string().min(1, "Slug zorunlu.").regex(SLUG_PATTERN, "Yalnızca küçük harf, rakam ve tire."));

export function jsonArray<T extends z.ZodTypeAny>(item: T) {
  return z
    .string()
    .transform((v, ctx) => {
      if (!v) return [];
      try {
        return JSON.parse(v) as unknown;
      } catch {
        ctx.addIssue({ code: "custom", message: "Geçersiz liste verisi." });
        return z.NEVER;
      }
    })
    .pipe(z.array(item).max(200));
}

/** Formdaki tüm alanları düz obje olarak (string) alır; çoklu değerli alanlar (checkbox listesi) için getAll kullanın. */
export function formObject(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of formData.entries()) if (typeof v === "string" && !(k in out)) out[k] = v;
  return out;
}

export function ids(formData: FormData, name: string): string[] {
  return [...new Set(formData.getAll(name).map(String).filter((v) => /^[a-z0-9]{10,40}$/i.test(v)))];
}

/** Virgülle ayrılmış etiketler → [{name, slug}] (tekilleştirilmiş). */
export function parseTags(raw: string): { name: string; slug: string }[] {
  const seen = new Set<string>();
  return raw
    .split(",")
    .map((t) => t.trim().slice(0, 60))
    .filter(Boolean)
    .map((name) => ({ name, slug: slugify(name) }))
    .filter((t) => t.slug && !seen.has(t.slug) && seen.add(t.slug))
    .slice(0, 20);
}

/** SEO alanları (ürün, kategori, proje, blog için ortak). */
export const seoShape = {
  metaTitle: optional(120),
  metaDescription: optional(320),
  metaKeywords: optional(300),
  canonicalUrl: optionalUrl,
  ogImage: optionalImage,
  noIndex: bool,
};

export function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && (e as { code?: string }).code === "P2002";
}
