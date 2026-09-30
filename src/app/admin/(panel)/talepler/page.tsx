import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { AdminPagination, Badge, EmptyRow, ListToolbar, PageHeader, PAGE_SIZE, pageOf, Table } from "@/components/admin/ui";
import { REQUEST_STATUS } from "@/lib/admin/labels";
import { prisma } from "@/lib/db";

export const metadata = { title: "Talepler" };

type SP = { q?: string; durum?: string; tur?: string; okunma?: string; sayfa?: string };

export default async function RequestsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = pageOf(sp.sayfa);
  const q = sp.q?.trim().slice(0, 80);
  const status = sp.durum && sp.durum in REQUEST_STATUS ? (sp.durum as keyof typeof REQUEST_STATUS) : undefined;
  const where: Prisma.ContactRequestWhereInput = {
    AND: [
      q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }, { productName: { contains: q, mode: "insensitive" } }] } : {},
      status ? { status } : {},
      sp.tur === "QUOTE" || sp.tur === "CONTACT" ? { type: sp.tur } : {},
      sp.okunma === "okunmamis" ? { isRead: false } : {},
    ],
  };
  const [rows, total] = await Promise.all([
    prisma.contactRequest.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.contactRequest.count({ where }),
  ]);

  return (
    <div>
      <PageHeader title="Talepler" description={`${total} talep — iletişim ve teklif formlarından gelenler`} />
      <ListToolbar
        q={q}
        placeholder="Ad, telefon, e-posta, ürün…"
        filters={[
          { name: "durum", label: "Durum", value: sp.durum, options: Object.entries(REQUEST_STATUS).map(([value, s]) => ({ value, label: s.label })) },
          { name: "tur", label: "Tür", value: sp.tur, options: [{ value: "QUOTE", label: "Teklif" }, { value: "CONTACT", label: "İletişim" }] },
          { name: "okunma", label: "Okunma", value: sp.okunma, options: [{ value: "okunmamis", label: "Okunmamış" }] },
        ]}
      />
      <Table head={["", "Kişi", "İlgi", "Tür", "Durum", "Tarih"]} empty={rows.length ? null : <EmptyRow text="Talep bulunamadı." />}>
        {rows.map((r) => (
          <tr key={r.id} className={`hover:bg-neutral-50 ${r.isRead ? "" : "bg-orange-50/40"}`}>
            <td className="w-8 px-4 py-3">{!r.isRead ? <span aria-label="Okunmamış" className="block h-2 w-2 rounded-full bg-ember" /> : null}</td>
            <td className="px-4 py-3">
              <Link href={`/admin/talepler/${r.id}`} className={`hover:underline ${r.isRead ? "" : "font-semibold"}`}>
                {r.name}
              </Link>
              <p className="text-xs text-neutral-500">{[r.phone, r.email].filter(Boolean).join(" · ")}</p>
            </td>
            <td className="px-4 py-3 text-neutral-600">{r.productName || r.categoryName || "—"}</td>
            <td className="px-4 py-3">{r.type === "QUOTE" ? <Badge tone="ember">Teklif</Badge> : <Badge>İletişim</Badge>}</td>
            <td className="px-4 py-3">
              <Badge tone={REQUEST_STATUS[r.status].tone}>{REQUEST_STATUS[r.status].label}</Badge>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-neutral-500">{r.createdAt.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Istanbul" })}</td>
          </tr>
        ))}
      </Table>
      <AdminPagination page={page} pages={Math.ceil(total / PAGE_SIZE)} params={{ q, durum: sp.durum, tur: sp.tur, okunma: sp.okunma }} />
    </div>
  );
}
