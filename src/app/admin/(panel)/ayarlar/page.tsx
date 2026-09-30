import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guard";
import { getSiteSettings } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Site ayarları" };

export default async function SettingsPage() {
  await requireAdmin("ADMIN");
  const { updatedAt, ...s } = await getSiteSettings();
  return (
    <div>
      <PageHeader title="Site ayarları" description="Logo, iletişim, WhatsApp, sosyal medya ve paylaşım görselleri. Değişiklikler sitede hemen görünür." />
      <SettingsForm key={updatedAt.toISOString()} s={s} />
    </div>
  );
}
