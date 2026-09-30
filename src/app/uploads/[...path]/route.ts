import { storage } from "@/lib/storage";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  pdf: "application/pdf",
};

/**
 * Yüklenen dosyaların servisi (/uploads/2026/10/bifire-...-a1b2c3.webp). Dosya adları rastgele sonek
 * içerdiği ve üzerine yazılmadığı için 1 yıl immutable önbelleklenir. Bilinmeyen uzantı servis edilmez.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const key = path.join("/");
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  const type = MIME[ext];
  if (!type || path.some((p) => p === ".." || p.startsWith("."))) return new Response("Bulunamadı", { status: 404 });

  const file = await storage.read(key);
  if (!file) return new Response("Bulunamadı", { status: 404 });

  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": type,
      "Content-Length": String(file.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Last-Modified": file.mtime.toUTCString(),
      "X-Content-Type-Options": "nosniff",
      ...(type === "application/pdf" ? { "Content-Disposition": "inline" } : {}),
    },
  });
}
