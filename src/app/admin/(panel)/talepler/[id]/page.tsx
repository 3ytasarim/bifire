import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Lock, Mail, Phone } from "lucide-react";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { Badge, PageHeader } from "@/components/admin/ui";
import { REQUEST_STATUS, REQUEST_TYPE } from "@/lib/admin/labels";
import { prisma } from "@/lib/db";
import { telHref } from "@/lib/settings";
import { deleteRequest, markUnread } from "../actions";
import { RequestStatusForm } from "./RequestForm";

export const metadata = { title: "Talep" };

export default async function RequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await prisma.contactRequest.findUnique({ where: { id }, include: { product: { select: { id: true, slug: true } }, attachments: { orderBy: { createdAt: "asc" } } } });
  if (!r) notFound();
  // Detay açıldığında okundu işaretlenir.
  if (!r.isRead) await prisma.contactRequest.update({ where: { id }, data: { isRead: true } });

  const rows: [string, React.ReactNode][] = [
    ["Tür", REQUEST_TYPE[r.type].label],
    ["Ad Soyad", r.name],
    ["Telefon", r.phone ? <a href={telHref(r.phone)} className="inline-flex items-center gap-1.5 underline"><Phone aria-hidden="true" className="h-3.5 w-3.5" />{r.phone}</a> : "—"],
    ["E-posta", r.email ? <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1.5 underline"><Mail aria-hidden="true" className="h-3.5 w-3.5" />{r.email}</a> : "—"],
    ["İlgilendiği kategori", r.categoryName ?? "—"],
    ["İlgilendiği ürün", r.product ? <Link href={`/admin/urunler/${r.product.id}`} className="underline">{r.productName}</Link> : (r.productName ?? "—")],
    ...(r.selection ? [[r.type === "DESIGN" ? "Tercihler" : "Seçilen seçenekler", r.selection] as [string, React.ReactNode]] : []),
    ...(r.topic ? [["İlgilendiği konu", r.topic] as [string, React.ReactNode]] : []),
    ["Proje ilçesi", r.district ?? "—"],
    ...(r.projectStage ? [["Proje aşaması", r.projectStage] as [string, React.ReactNode]] : []),
    ...(r.timeline ? [["Uygulama dönemi", r.timeline] as [string, React.ReactNode]] : []),
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
          {r.attachments.length ? (
            <div className="border-t border-neutral-200 px-5 py-4">
              <h2 className="flex items-center gap-1.5 text-sm text-neutral-500">
                <Lock aria-hidden="true" className="h-3.5 w-3.5" /> Müşteri fotoğrafı (yalnızca admin görebilir)
              </h2>
              <ul className="mt-3 grid gap-4 sm:grid-cols-2">
                {r.attachments.map((a) => (
                  <li key={a.id} className="border border-neutral-200">
                    <a href={`/admin/talepler/dosya/${a.id}`} target="_blank" rel="noopener" className="block bg-neutral-100">
                      {/* next/image optimizer oturum çerezi taşımaz; özel dosya doğrudan admin route'undan gelir. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/admin/talepler/dosya/${a.id}`} alt={`${r.name} — mekân fotoğrafı`} width={a.width ?? undefined} height={a.height ?? undefined} className="h-auto w-full" loading="lazy" />
                    </a>
                    <div className="flex items-center justify-between gap-3 px-3 py-2 text-xs text-neutral-500">
                      <span>
                        {a.width && a.height ? `${a.width}×${a.height} · ` : ""}
                        {(a.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                      <a href={`/admin/talepler/dosya/${a.id}?indir=1`} className="inline-flex min-h-9 items-center gap-1 font-medium text-ink underline">
                        <Download aria-hidden="true" className="h-3.5 w-3.5" /> İndir
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
        <RequestStatusForm id={r.id} status={r.status} adminNote={r.adminNote} options={Object.entries(REQUEST_STATUS).map(([value, s]) => ({ value, label: s.label }))} />
      </div>
    </div>
  );
}
