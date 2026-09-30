"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { RequestStatus } from "@prisma/client";
import { formObject, optional, zodErrors, type ActionState } from "@/lib/admin/form";
import { requireAdmin } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";

const schema = z.object({ status: z.enum(RequestStatus), adminNote: optional(4000) });

export async function updateRequest(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = schema.safeParse({ adminNote: "", ...formObject(formData) });
  if (!parsed.success) return zodErrors(parsed.error);
  await prisma.contactRequest.update({ where: { id }, data: { ...parsed.data, isRead: true } });
  revalidatePath("/admin", "layout");
  return { status: "success", message: "Talep güncellendi." };
}

/** Detaydan "okunmadı" işaretleyip listeye döner (detay sayfası açılınca otomatik okundu olur). */
export async function markUnread(id: string) {
  await requireAdmin();
  await prisma.contactRequest.update({ where: { id }, data: { isRead: false } }).catch(() => null);
  revalidatePath("/admin", "layout");
  redirect("/admin/talepler");
}

export async function deleteRequest(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin("ADMIN");
  await prisma.contactRequest.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin", "layout");
  return { ok: true };
}
