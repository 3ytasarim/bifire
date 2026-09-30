import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";

// Admin her zaman dinamik (oturuma bağlı) — önbelleğe alınmaz.
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const unread = await prisma.contactRequest.count({ where: { isRead: false } });
  return (
    <AdminShell user={{ name: user.name, email: user.email, role: user.role }} unread={unread}>
      {children}
    </AdminShell>
  );
}
