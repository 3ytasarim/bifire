import "server-only";
import { redirect } from "next/navigation";
import type { AdminRole } from "@prisma/client";
import { getSessionUser, type SessionUser } from "./session";

const ROLE_RANK: Record<AdminRole, number> = { EDITOR: 0, ADMIN: 1, SUPERADMIN: 2 };

export function hasRole(user: SessionUser, minRole: AdminRole): boolean {
  return ROLE_RANK[user.role] >= ROLE_RANK[minRole];
}

/**
 * Her admin sayfası ve HER server action'ın ilk satırı. proxy.ts'teki cookie kontrolü yalnızca
 * yönlendirme kolaylığıdır; asıl yetki kontrolü burada, veritabanındaki oturuma karşı yapılır.
 */
export async function requireAdmin(minRole: AdminRole = "EDITOR"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (!hasRole(user, minRole)) redirect("/admin?yetki=yok");
  return user;
}
