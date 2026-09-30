"use server";

import { revalidateSite } from "@/lib/admin/revalidate";
import { requireAdmin } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";

export async function deleteProductTag(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin("ADMIN");
  await prisma.productTag.delete({ where: { id } }).catch(() => null);
  revalidateSite();
  return { ok: true };
}
