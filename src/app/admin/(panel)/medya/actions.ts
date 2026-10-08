"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { storage } from "@/lib/storage";
import { findMediaUsage } from "@/lib/media-usage";
import { uploadDocument, uploadImage, uploadVideo, UploadError } from "@/lib/upload";

export type MediaItem = { id: string; url: string; alt: string | null; width: number | null; height: number | null; originalName: string; size: number; mimeType: string };

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const toItem = (m: MediaItem): MediaItem => ({
  id: m.id,
  url: m.url,
  alt: m.alt,
  width: m.width,
  height: m.height,
  originalName: m.originalName,
  size: m.size,
  mimeType: m.mimeType,
});

/** Admin formlarındaki görsel alanlarından (kapak, galeri, slider, editör...) tek merkezî yükleme noktası. */
export async function uploadImageAction(formData: FormData): Promise<Result<MediaItem>> {
  await requireAdmin();
  const file = formData.get("file");
  const alt = String(formData.get("alt") ?? "").trim();
  const nameHint = String(formData.get("nameHint") ?? "").trim();
  try {
    if (!(file instanceof File)) throw new UploadError("Dosya seçilmedi.");
    const media = await uploadImage(file, { alt: alt || undefined, nameHint: nameHint || undefined });
    revalidatePath("/admin/medya");
    return { ok: true, data: toItem(media) };
  } catch (e) {
    return { ok: false, error: e instanceof UploadError ? e.message : "Görsel yüklenemedi. Lütfen tekrar deneyin." };
  }
}

/** Slider arka plan videosu (MP4/WebM). */
export async function uploadVideoAction(formData: FormData): Promise<Result<MediaItem>> {
  await requireAdmin();
  const file = formData.get("file");
  const nameHint = String(formData.get("nameHint") ?? "").trim();
  try {
    if (!(file instanceof File)) throw new UploadError("Dosya seçilmedi.");
    const media = await uploadVideo(file, { nameHint: nameHint || undefined });
    revalidatePath("/admin/medya");
    return { ok: true, data: toItem(media) };
  } catch (e) {
    return { ok: false, error: e instanceof UploadError ? e.message : "Video yüklenemedi. Lütfen tekrar deneyin." };
  }
}

export async function uploadDocumentAction(formData: FormData): Promise<Result<{ url: string; mimeType: string; size: number }>> {
  await requireAdmin();
  const file = formData.get("file");
  const title = String(formData.get("title") ?? "dokuman").trim() || "dokuman";
  try {
    if (!(file instanceof File)) throw new UploadError("Dosya seçilmedi.");
    return { ok: true, data: await uploadDocument(file, title) };
  } catch (e) {
    return { ok: false, error: e instanceof UploadError ? e.message : "Doküman yüklenemedi." };
  }
}

export async function listMediaAction(query = "", page = 1, kind: "image" | "video" = "image"): Promise<{ items: MediaItem[]; hasMore: boolean }> {
  await requireAdmin();
  const take = 36;
  const q = query.trim().slice(0, 80);
  const rows = await prisma.media.findMany({
    where: {
      mimeType: { startsWith: kind === "video" ? "video/" : "image/" },
      ...(q ? { OR: [{ originalName: { contains: q, mode: "insensitive" } }, { alt: { contains: q, mode: "insensitive" } }, { filename: { contains: q, mode: "insensitive" } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    skip: (Math.max(1, page) - 1) * take,
    take: take + 1,
  });
  return { items: rows.slice(0, take).map(toItem), hasMore: rows.length > take };
}

export async function updateMediaAltAction(id: string, alt: string): Promise<Result<null>> {
  await requireAdmin();
  await prisma.media.update({ where: { id }, data: { alt: alt.trim().slice(0, 250) || null } });
  revalidatePath("/admin/medya");
  return { ok: true, data: null };
}

export async function deleteMediaAction(id: string): Promise<Result<null>> {
  await requireAdmin("ADMIN");
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return { ok: false, error: "Görsel bulunamadı." };
  const usage = await findMediaUsage(media.url);
  if (usage.length) return { ok: false, error: `Bu görsel kullanımda: ${usage.join(", ")}. Önce ilgili içerikten kaldırın.` };
  await prisma.media.delete({ where: { id } });
  await storage.remove(media.storageKey);
  revalidatePath("/admin/medya");
  return { ok: true, data: null };
}
