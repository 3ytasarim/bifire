import Link from "next/link";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { Badge, Flash, PageHeader, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { deleteUser } from "./actions";

export const metadata = { title: "Kullanıcılar" };

const ROLE_LABEL = { SUPERADMIN: "Süper yönetici", ADMIN: "Yönetici", EDITOR: "Editör" } as const;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ kaydedildi?: string }> }) {
  const me = await requireAdmin("ADMIN");
  const { kaydedildi } = await searchParams;
  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div>
      <PageHeader title="Kullanıcılar" description="Yönetim paneline erişebilen kişiler." action={{ label: "Yeni kullanıcı", href: "/admin/kullanicilar/yeni" }} />
      <Flash message={kaydedildi ? "Kullanıcı kaydedildi." : null} />
      <Table head={["Ad", "E-posta", "Rol", "Durum", "Son giriş", ""]}>
        {users.map((u) => (
          <tr key={u.id} className="hover:bg-neutral-50">
            <td className="px-4 py-3">
              <Link href={`/admin/kullanicilar/${u.id}`} className="font-medium hover:underline">
                {u.name}
              </Link>
              {u.id === me.id ? <span className="ml-2 text-xs text-neutral-400">(siz)</span> : null}
            </td>
            <td className="px-4 py-3 text-neutral-600">{u.email}</td>
            <td className="px-4 py-3">
              <Badge>{ROLE_LABEL[u.role]}</Badge>
            </td>
            <td className="px-4 py-3">{u.active ? <Badge tone="green">Aktif</Badge> : <Badge tone="red">Pasif</Badge>}</td>
            <td className="px-4 py-3 text-neutral-500">{u.lastLoginAt ? u.lastLoginAt.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Istanbul" }) : "—"}</td>
            <td className="px-4 py-3 text-right">
              {u.id !== me.id ? <ConfirmAction compact action={deleteUser.bind(null, u.id)} title={`${u.name} silinsin mi?`} description="Kullanıcı ve açık oturumları silinir." /> : null}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
