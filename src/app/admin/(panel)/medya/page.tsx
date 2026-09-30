import { AdminPagination, ListToolbar, PageHeader, pageOf } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { MediaManager } from "./MediaManager";

export const metadata = { title: "Medya" };

const SIZE = 60;

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ q?: string; sayfa?: string }> }) {
  const sp = await searchParams;
  const page = pageOf(sp.sayfa);
  const q = sp.q?.trim().slice(0, 80);
  const where = q ? { OR: [{ originalName: { contains: q, mode: "insensitive" as const } }, { alt: { contains: q, mode: "insensitive" as const } }] } : {};
  const [rows, total] = await Promise.all([
    prisma.media.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * SIZE, take: SIZE }),
    prisma.media.count({ where }),
  ]);
  return (
    <div>
      <PageHeader title="Medya" description={`${total} görsel. Görseller yeniden sıkıştırılmadan saklanır; site boyutlandırmayı otomatik yapar (AVIF/WebP).`} />
      <ListToolbar q={q} placeholder="Dosya adı veya alt metin…" />
      <MediaManager
        items={rows.map((m) => ({ id: m.id, url: m.url, alt: m.alt, width: m.width, height: m.height, originalName: m.originalName, size: m.size, mimeType: m.mimeType }))}
      />
      <AdminPagination page={page} pages={Math.ceil(total / SIZE)} params={{ q }} />
    </div>
  );
}
