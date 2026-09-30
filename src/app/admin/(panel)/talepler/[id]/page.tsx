import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { Badge, PageHeader } from "@/components/admin/ui";
import { REQUEST_STATUS } from "@/lib/admin/labels";
import { prisma } from "@/lib/db";
import { telHref } from "@/lib/settings";
import { deleteRequest, markUnread } from "../actions";
import { RequestStatusForm } from "./RequestForm";

export const metadata = { title: "Talep" };

export default async function RequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await prisma.contactRequest.findUnique({ where: { id }, include: { product: { select: { id: true, slug: true } } } });
  if (!r) notFound();
  // Detay açıldığında okundu işaretlenir.
  if (!r.isRead) await prisma.contactRequest.update({ where: { id }, data: { isRead: true } });

  const rows: [string, React.ReactNode][] = [
    ["Tür", r.type === "QUOTE" ? "Teklif talebi" : "İletişim"],
    ["Ad Soyad", r.name],
    ["Telefon", r.phone ? <a href={telHref(r.phone)} className="inline-flex items-center gap-1.5 underline"><Phone aria-hidden="true" className="h-3.5 w-3.5" />{r.phone}</a> : "—"],
    ["E-posta", r.email ? <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1.5 underline"><Mail aria-hidden="true" className="h-3.5 w-3.5" />{r.email}</a> : "—"],
    ["İlgilendiği kategori", r.categoryName ?? "—"],
    ["İlgilendiği ürün", r.product ? <Link href={`/admin/urunler/${r.product.id}`} className="underline">{r.productName}</Link> : (r.productName ?? "—")],
    ["Gönderildiği sayfa", r.sourcePath ? <a href={r.sourcePath} target="_blank" className="underline">{r.sourcePath}</a> : "—"],
    ["KVKK onayı", r.kvkkConsent ? `Evet (${r.consentAt?.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })})` : "Hayır"],
    ["Tarih", r.createdAt.toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Istanbul" })],
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title={r.name} back={{ label: "Talepler", href: "/admin/talepler" }} />
        <div className="flex items-center gap-2">
          <Badge tone={REQUEST_STATUS[r.status].tone}>{REQUEST_STATUS[r.status].label}</Badge>
          <form action={markUnread.bind(null, r.id)}>
            <button type="submit" className="min-h-11 border border-neutral-300 bg-white px-4 text-sm hover:border-ink">Okunmadı işaretle</button>
          </form>
          <ConfirmAction action={deleteRequest.bind(null, r.id)} redirectTo="/admin/talepler" title="Talep silinsin mi?" description="Talep ve kişisel veriler kalıcı olarak silinir (KVKK silme talebi için kullanılabilir)." />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <section className="border border-neutral-200 bg-white xl:col-span-2">
          <dl className="divide-y divide-neutral-100">
            {rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 px-5 py-3 sm:grid-cols-[200px_1fr]">
                <dt className="text-sm text-neutral-500">{k}</dt>
                <dd className="text-sm">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-neutral-200 px-5 py-4">
            <h2 className="text-sm text-neutral-500">Mesaj</h2>
            <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-wrap">{r.message || "—"}</p>
          </div>
        </section>
        <RequestStatusForm id={r.id} status={r.status} adminNote={r.adminNote} options={Object.entries(REQUEST_STATUS).map(([value, s]) => ({ value, label: s.label }))} />
      </div>
    </div>
  );
}
