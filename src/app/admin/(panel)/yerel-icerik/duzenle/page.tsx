import { notFound } from "next/navigation";
import { Flash, PageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { findTarget } from "@/lib/local-content-catalog";
import { LocalContentForm } from "../LocalContentForm";

export const metadata = { title: "Yerel İçerik Düzenle" };

export default async function LocalContentEdit({ searchParams }: { searchParams: Promise<{ k?: string; kaydedildi?: string }> }) {
  const { k = "", kaydedildi } = await searchParams;
  const target = await findTarget(k);
  if (!target) notFound();
  const row = await prisma.localContent.findUnique({ where: { key: target.key } });
  const title = target.kind === "model" ? `${target.group} · ${target.label}` : target.label === target.group || target.label.includes("il sayfası") ? target.label : `${target.label}, ${target.group}`;
  return (
    <div>
      <PageHeader title={`Yerel içerik: ${title}`} description={target.path} back={{ label: "Yerel İçerik", href: `/admin/yerel-icerik?tur=${target.kind}` }} />
      <Flash message={kaydedildi === "1" ? "Kaydedildi. Sayfa güncellendi." : kaydedildi === "bos" ? "Özel içerik kaldırıldı; sayfa ortak şablonla açılıyor." : null} />
      <LocalContentForm key={row?.updatedAt.toISOString() ?? "new"} targetKey={target.key} kind={target.kind} label={title} row={row} />
    </div>
  );
}
