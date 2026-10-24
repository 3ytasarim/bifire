import { PageHeader } from "@/components/admin/ui";
import { CrmTabs } from "@/components/admin/crm/CrmParts";
import { ProjectForm } from "@/components/admin/crm/ProjectForm";
import { USAGE_OPTIONS } from "@/lib/crm/labels";
import { ownerOptions, sourceOptions, stageOptions } from "@/lib/crm/queries";
import { requireAdmin } from "@/lib/auth/guard";

export const metadata = { title: "CRM · Yeni müşteri" };

/** Telefon, showroom, referans ve sosyal medya taleplerinin elle girişi (web formları otomatik gelir). */
export default async function NewCustomerPage() {
  const user = await requireAdmin();
  const owners = await ownerOptions();
  return (
    <div>
      <PageHeader title="Yeni müşteri" description="Telefon, showroom, referans veya sosyal medyadan gelen talep. Telefon/e-posta girince mevcut müşteri kontrol edilir." back={{ label: "Müşteriler", href: "/admin/crm/musteriler" }} />
      <CrmTabs active="musteriler" />
      <ProjectForm
        values={{ name: "", phone: "", email: "", city: "", district: "", title: "", location: "", stage: "NEW", ownerId: user.id, nextFollowUpAt: "", quoteAmount: "", usage: "", chimney: "", notes: "", lostReason: "", source: "PHONE" }}
        stages={stageOptions}
        owners={owners}
        sources={sourceOptions()}
        usages={USAGE_OPTIONS}
      />
    </div>
  );
}
