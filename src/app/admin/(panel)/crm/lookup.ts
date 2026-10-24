"use server";

import { requireAdmin } from "@/lib/auth/guard";
import { findMatchingCustomers } from "@/lib/crm/intake";
import { customerCode } from "@/lib/crm/labels";

/** Yeni kayıt formunda telefon/e-posta girilince eşleşen müşteriler (mükerrer kayıt uyarısı). */
export async function checkDuplicates(phone: string, email: string): Promise<{ id: string; label: string }[]> {
  await requireAdmin();
  const rows = await findMatchingCustomers({ phone: phone.slice(0, 40), email: email.slice(0, 160) });
  return rows.map((r) => ({
    id: r.id,
    label: `${customerCode(r.code)} · ${r.name}${r.phone ? ` · ${r.phone}` : ""}${r.district ? ` · ${r.district}` : ""} (${r._count.projects} proje)`,
  }));
}
