import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { Badge, EmptyRow, PageHeader, Table } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { deleteSlide, moveSlide, toggleSlide } from "./actions";

export const metadata = { title: "Slider" };

export default async function SliderAdminPage() {
  const slides = await prisma.heroSlide.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return (
    <div>
      <PageHeader title="Ana sayfa slider" description="Aktif slaytlar ana sayfanın giriş bölümünde sırayla gösterilir. Hiç aktif slayt yoksa varsayılan giriş gösterilir." action={{ label: "Yeni slayt", href: "/admin/slider/yeni" }} />
      <Table head={["Sıra", "Görsel", "Başlık", "Durum", ""]} empty={slides.length ? null : <EmptyRow text="Henüz slayt yok." action={{ label: "İlk slaytı ekle", href: "/admin/slider/yeni" }} />}>
        {slides.map((s, i) => (
          <tr key={s.id} className="hover:bg-neutral-50">
            <td className="w-24 px-4 py-3">
              <div className="flex">
                <form action={moveSlide.bind(null, s.id, -1)}>
                  <button type="submit" disabled={i === 0} aria-label="Yukarı taşı" className="flex h-9 w-9 items-center justify-center hover:bg-neutral-100 disabled:opacity-30">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </form>
                <form action={moveSlide.bind(null, s.id, 1)}>
                  <button type="submit" disabled={i === slides.length - 1} aria-label="Aşağı taşı" className="flex h-9 w-9 items-center justify-center hover:bg-neutral-100 disabled:opacity-30">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </td>
            <td className="w-40 px-4 py-3">
              <div className="relative aspect-video w-32 bg-neutral-100">
                <Image src={s.desktopImage} alt="" fill sizes="128px" className="object-cover" />
              </div>
            </td>
            <td className="px-4 py-3">
              <Link href={`/admin/slider/${s.id}`} className="font-medium hover:underline">
                {s.title}
              </Link>
              {s.eyebrow ? <p className="text-xs text-neutral-400">{s.eyebrow}</p> : null}
            </td>
            <td className="px-4 py-3">
              <form action={toggleSlide.bind(null, s.id)}>
                <button type="submit" title="Durumu değiştir">{s.active ? <Badge tone="green">Aktif</Badge> : <Badge>Pasif</Badge>}</button>
              </form>
            </td>
            <td className="px-4 py-3 text-right">
              <ConfirmAction compact action={deleteSlide.bind(null, s.id)} title="Slayt silinsin mi?" description={`“${s.title}” slaytı silinir. Görseller medya kütüphanesinde kalır.`} />
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
