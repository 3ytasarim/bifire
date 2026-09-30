import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guard";
import { UserForm } from "../UserForm";

export const metadata = { title: "Yeni kullanıcı" };

export default async function NewUserPage() {
  await requireAdmin("ADMIN");
  return (
    <div>
      <PageHeader title="Yeni kullanıcı" back={{ label: "Kullanıcılar", href: "/admin/kullanicilar" }} />
      <UserForm />
    </div>
  );
}
