import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { prisma } from "@/lib/db";
import { PUBLIC_UPLOAD_PREFIX } from "@/lib/storage";

export type ImageMeta = { width: number; height: number; type: string };

const MIME_BY_FORMAT: Record<string, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  heif: "image/avif",
  avif: "image/avif",
};

const publicCache = new Map<string, ImageMeta | null>();

/**
 * Görselin GERÇEK genişlik/yükseklik/MIME bilgisi (OG image, ImageObject için). Uydurma ölçü yok:
 * - /uploads/... → yükleme sırasında Media tablosuna yazılmış değerler (dosya yeniden okunmaz)
 * - /public altındaki statik dosyalar → sharp ile yalnızca başlık okunur (yeniden encode yok), süreç içi önbellek
 * - okunamayanlar → null (çağıran alanı opsiyonel bırakır)
 */
export async function getImageMeta(src: string | null | undefined): Promise<ImageMeta | null> {
  if (!src || !src.startsWith("/")) return null;

  if (src.startsWith(PUBLIC_UPLOAD_PREFIX)) {
    const media = await prisma.media.findUnique({ where: { url: src }, select: { width: true, height: true, mimeType: true } });
    return media?.width && media.height ? { width: media.width, height: media.height, type: media.mimeType } : null;
  }

  if (publicCache.has(src)) return publicCache.get(src)!;
  let result: ImageMeta | null = null;
  const file = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", src);
  if (existsSync(file)) {
    try {
      const meta = await sharp(file).metadata();
      if (meta.width && meta.height && meta.format) {
        result = { width: meta.width, height: meta.height, type: MIME_BY_FORMAT[meta.format] ?? `image/${meta.format}` };
      }
    } catch {
      result = null;
    }
  }
  publicCache.set(src, result);
  return result;
}
