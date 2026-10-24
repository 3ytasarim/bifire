import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guard";
import { overdueCount } from "@/lib/crm/queries";
import { FEATURES } from "@/lib/features";
import { prisma } from "@/lib/db";

// Admin her zaman dinamik (oturuma bağlı) — önbelleğe alınmaz.
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const [unread, overdue] = await Promise.all([prisma.contactRequest.count({ where: { isRead: false } }), FEATURES.crm ? overdueCount() : 0]);
  return (
    <AdminShell user={{ name: user.name, email: user.email, role: user.role }} unread={unread} overdue={overdue}>
      {children}
    </AdminShell>
  );
}
