import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { privateStorage } from "@/lib/storage/private";

/**
 * Talep eki (müşteri mekân fotoğrafı) — yalnızca geçerli admin oturumuyla. Önbelleğe alınmaz, indekslenmez;
 * `?indir=1` ile dosya olarak indirilir.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSessionUser())) return new Response("Yetkisiz", { status: 401 });
  const { id } = await params;
  const file = await prisma.requestAttachment.findUnique({ where: { id }, select: { storageKey: true, mimeType: true, requestId: true } });
  if (!file) return new Response("Bulunamadı", { status: 404 });
  const data = await privateStorage.read(file.storageKey);
  if (!data) return new Response("Dosya bulunamadı", { status: 404 });
  const download = new URL(request.url).searchParams.has("indir");
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(data.length),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="bifire-talep-${file.requestId}-${id}.jpg"`,
    },
  });
}
