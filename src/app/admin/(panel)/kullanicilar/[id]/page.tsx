import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { UserForm } from "../UserForm";

export const metadata = { title: "Kullanıcı düzenle" };

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("ADMIN");
  const { id } = await params;
  const user = await prisma.adminUser.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true, active: true } });
  if (!user) notFound();
  return (
    <div>
      <PageHeader title={user.name} back={{ label: "Kullanıcılar", href: "/admin/kullanicilar" }} />
      <UserForm user={user} />
    </div>
  );
}
