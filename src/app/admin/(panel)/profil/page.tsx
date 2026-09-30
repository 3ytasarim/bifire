import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guard";
import { ProfileForm } from "./ProfileForm";

export const metadata = { title: "Profilim" };

export default async function ProfilePage() {
  const me = await requireAdmin();
  return (
    <div>
      <PageHeader title="Profilim" />
      <ProfileForm name={me.name} email={me.email} />
    </div>
  );
}
