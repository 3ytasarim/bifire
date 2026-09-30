import "server-only";
import { prisma } from "@/lib/db";

type Entry = { destinationPath: string; statusCode: number };

const TTL_MS = 60_000;
let cache: Map<string, Entry> | null = null;
let loadedAt = 0;
let loading: Promise<Map<string, Entry>> | null = null;

export function normalizePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

async function load(): Promise<Map<string, Entry>> {
  const rows = await prisma.redirect.findMany({ where: { active: true }, select: { sourcePath: true, destinationPath: true, statusCode: true } });
  return new Map(rows.map((r) => [normalizePath(r.sourcePath), { destinationPath: r.destinationPath, statusCode: r.statusCode }]));
}

/** Aktif yönlendirmeler 60 sn bellek önbelleğinde; DB hatasında son bilinen tablo kullanılır. */
export async function findRedirect(pathname: string): Promise<Entry | null> {
  if (!cache || Date.now() - loadedAt > TTL_MS) {
    loading ??= load().finally(() => (loading = null));
    try {
      cache = await loading;
      loadedAt = Date.now();
    } catch {
      if (!cache) return null;
    }
  }
  return cache.get(normalizePath(pathname)) ?? null;
}

export function invalidateRedirectCache() {
  cache = null;
}

/**
 * Slug değiştiğinde eski URL'den yenisine 301 kaydı açar (SEO değeri korunur). Zincir oluşmasın diye
 * eski URL'ye işaret eden mevcut yönlendirmeler de yeni hedefe güncellenir; yeni URL'yi kaynak alan
 * kayıt (döngü) pasifleştirilir.
 */
export async function recordSlugChange(oldPath: string, newPath: string) {
  if (oldPath === newPath) return;
  await prisma.$transaction([
    prisma.redirect.updateMany({ where: { destinationPath: oldPath }, data: { destinationPath: newPath } }),
    prisma.redirect.updateMany({ where: { sourcePath: newPath }, data: { active: false } }),
    prisma.redirect.upsert({
      where: { sourcePath: oldPath },
      create: { sourcePath: oldPath, destinationPath: newPath, statusCode: 301, note: "Slug değişikliği (otomatik)" },
      update: { destinationPath: newPath, statusCode: 301, active: true },
    }),
  ]);
  invalidateRedirectCache();
}
