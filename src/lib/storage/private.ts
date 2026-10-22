import "server-only";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Müşteri dosyaları (talep ekleri, ör. mekân fotoğrafı) için ÖZEL depo. Herkese açık medya deposundan
 * (UPLOAD_DIR → /uploads) ayrı bir köktedir; hiçbir public route bu dizini sunmaz. Dosyalar yalnızca admin
 * oturumu doğrulanarak /admin/talepler/dosya/[id] üzerinden okunur. Sunucuda kalıcı diske bağlanmalı:
 * PRIVATE_UPLOAD_DIR (varsayılan ./storage/private, git dışı).
 */
const PRIVATE_ROOT = path.resolve(/*turbopackIgnore: true*/ process.env.PRIVATE_UPLOAD_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), "storage", "private"));

function resolveKey(key: string): string {
  const full = path.resolve(/*turbopackIgnore: true*/ PRIVATE_ROOT, key);
  // Path traversal koruması: anahtar kök dizinin dışına çıkamaz.
  if (!full.startsWith(PRIVATE_ROOT + path.sep)) throw new Error("Geçersiz dosya yolu.");
  return full;
}

export const privateStorage = {
  async put(key: string, data: Buffer): Promise<void> {
    const full = resolveKey(key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, data, { flag: "wx" });
  },
  async read(key: string): Promise<Buffer | null> {
    try {
      return await readFile(resolveKey(key));
    } catch {
      return null;
    }
  },
  async remove(key: string): Promise<void> {
    await unlink(resolveKey(key)).catch(() => {});
  },
};
