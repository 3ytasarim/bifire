import { Flash, PageHeader } from "@/components/admin/ui";
import { CrmTabs } from "@/components/admin/crm/CrmParts";
import { TemplateForm } from "@/components/admin/crm/TemplateForm";
import { hasRole, requireAdmin } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { deleteTemplate } from "../actions";

export const metadata = { title: "CRM · Hazır mesajlar" };

/** İletişim standardı: hazır müşteri mesajları. Proje kartında seçilir, kişiselleştirilir ve elle gönderilir. */
export default async function TemplatesPage({ searchParams }: { searchParams: Promise<{ kaydedildi?: string }> }) {
  const user = await requireAdmin();
  const sp = await searchParams;
  const templates = await prisma.crmMessageTemplate.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return (
    <div>
      <PageHeader title="Hazır müşteri mesajları" description="Metinlerde [Ad] müşteri adıyla doldurulur; diğer köşeli parantezli alanları gönderen tamamlar. Otomatik gönderim yapılmaz." />
      <CrmTabs active="mesajlar" />
      <Flash message={sp.kaydedildi ? "Mesaj kaydedildi." : null} />
      <div className="grid gap-6 xl:grid-cols-2">
        {templates.map((t) => (
          <div key={t.id} className="border border-neutral-200 bg-white p-5">
            <TemplateForm values={{ id: t.id, title: t.title, body: t.body, sortOrder: t.sortOrder, active: t.active }} />
            {hasRole(user, "ADMIN") ? (
              <form action={deleteTemplate} className="mt-3 text-right">
                <input type="hidden" name="id" value={t.id} />
                <button type="submit" className="text-xs font-semibold text-red-700 hover:underline">
                  Mesajı sil
                </button>
              </form>
            ) : null}
          </div>
        ))}
        <div className="border border-dashed border-neutral-300 bg-white p-5">
          <p className="mb-4 text-sm font-semibold">Yeni hazır mesaj</p>
          <TemplateForm values={{ title: "", body: "", sortOrder: templates.length, active: true }} />
        </div>
      </div>
    </div>
  );
}
