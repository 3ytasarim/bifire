import "server-only";
import { randomBytes } from "node:crypto";
import sharp from "sharp";
import type { Media } from "@prisma/client";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { storage } from "@/lib/storage";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

/** SVG bilinçli olarak YOK: içinde script taşıyabilir (XSS). Logo gerekirse PNG/WebP yüklenir. */
const IMAGE_TYPES: Record<string, { exts: string[]; format: string }> = {
  "image/jpeg": { exts: ["jpg", "jpeg"], format: "jpeg" },
  "image/png": { exts: ["png"], format: "png" },
  "image/webp": { exts: ["webp"], format: "webp" },
  "image/avif": { exts: ["avif"], format: "heif" },
};

export class UploadError extends Error {}

function extensionOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

/** Açıklayıcı, SEO dostu dosya adı: "bifire-l-tipi-somine-haznesi-3f9a1c.webp". */
function buildKey(baseName: string, ext: string): string {
  const now = new Date();
  const folder = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const name = slugify(baseName).slice(0, 70) || "gorsel";
  return `${folder}/${name}-${randomBytes(3).toString("hex")}.${ext}`;
}

/**
 * Görsel yükler ve Media kaydı oluşturur. Kontroller: boyut, MIME whitelist, uzantı-MIME uyumu ve
 * gerçek içerik (sharp dosya başlığını okuyabilmeli ve biçim beyan edilen MIME ile eşleşmeli).
 * Görsel yeniden ENCODE EDİLMEZ; yalnızca başlıktan genişlik/yükseklik okunur (image SEO için gerçek ölçü).
 */
export async function uploadImage(file: File, opts: { alt?: string; nameHint?: string } = {}): Promise<Media> {
  if (!(file instanceof File) || file.size === 0) throw new UploadError("Dosya seçilmedi.");
  if (file.size > MAX_IMAGE_BYTES) throw new UploadError("Görsel en fazla 10 MB olabilir.");

  const type = IMAGE_TYPES[file.type];
  const ext = extensionOf(file.name);
  if (!type || !type.exts.includes(ext)) {
    throw new UploadError("Yalnızca JPG, PNG, WebP veya AVIF görseller yüklenebilir.");
  }

  const data = Buffer.from(await file.arrayBuffer());
  let meta: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    meta = await sharp(data).metadata();
  } catch {
    throw new UploadError("Dosya geçerli bir görsel değil.");
  }
  if (!meta.width || !meta.height || meta.format !== type.format) {
    throw new UploadError("Dosya içeriği uzantısıyla uyuşmuyor.");
  }

  // EXIF yönü 5–8 ise gerçek görüntülenen ölçüler yer değiştirir.
  const rotated = meta.orientation !== undefined && meta.orientation >= 5;
  const width = rotated ? meta.height : meta.width;
  const height = rotated ? meta.width : meta.height;

  const baseName = opts.nameHint || opts.alt || file.name.replace(/\.[^.]+$/, "");
  const { key, url } = await storage.put(buildKey(`bifire ${baseName}`, ext === "jpeg" ? "jpg" : ext), data);

  return prisma.media.create({
    data: {
      url,
      storageKey: key,
      filename: key.split("/").pop()!,
      originalName: file.name.slice(0, 200),
      mimeType: file.type,
      size: file.size,
      width,
      height,
      alt: opts.alt?.slice(0, 250) || null,
    },
  });
}

/** PDF doküman (katalog, teknik çizim). İçerik "%PDF-" imzasıyla doğrulanır. */
export async function uploadDocument(file: File, title: string): Promise<{ url: string; mimeType: string; size: number }> {
  if (!(file instanceof File) || file.size === 0) throw new UploadError("Dosya seçilmedi.");
  if (file.size > MAX_DOCUMENT_BYTES) throw new UploadError("Doküman en fazla 20 MB olabilir.");
  if (file.type !== "application/pdf" || extensionOf(file.name) !== "pdf") {
    throw new UploadError("Yalnızca PDF doküman yüklenebilir.");
  }
  const data = Buffer.from(await file.arrayBuffer());
  if (data.subarray(0, 5).toString("latin1") !== "%PDF-") throw new UploadError("Dosya geçerli bir PDF değil.");
  const { url } = await storage.put(buildKey(`bifire ${title}`, "pdf"), data);
  return { url, mimeType: "application/pdf", size: file.size };
}

/** URL'ye karşılık gelen Media kaydının ölçülerini döner (ürün/proje galerisine width/height yazmak için). */
export async function getMediaDimensions(urls: string[]): Promise<Map<string, { width: number | null; height: number | null }>> {
  if (!urls.length) return new Map();
  const rows = await prisma.media.findMany({ where: { url: { in: urls } }, select: { url: true, width: true, height: true } });
  return new Map(rows.map((r) => [r.url, { width: r.width, height: r.height }]));
}
