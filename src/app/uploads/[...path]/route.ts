import { storage } from "@/lib/storage";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  pdf: "application/pdf",
  mp4: "video/mp4",
  webm: "video/webm",
};

/**
 * Yüklenen dosyaların servisi (/uploads/2026/10/bifire-...-a1b2c3.webp). Dosya adları rastgele sonek içerdiği ve
 * üzerine yazılmadığı için 1 yıl immutable önbelleklenir. Bilinmeyen uzantı servis edilmez.
 * Video için HTTP Range (206 Partial Content) desteklenir — Safari/iOS videoyu yalnızca bu şekilde oynatır.
 * Dosyalar belleğe alınmadan akış olarak gönderilir.
 */
export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const key = path.join("/");
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  const type = MIME[ext];
  if (!type || path.some((p) => p === ".." || p.startsWith("."))) return new Response("Bulunamadı", { status: 404 });

  const info = await storage.size(key);
  if (!info) return new Response("Bulunamadı", { status: 404 });

  const base: Record<string, string> = {
    "Content-Type": type,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Last-Modified": info.mtime.toUTCString(),
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
    ...(type === "application/pdf" ? { "Content-Disposition": "inline" } : {}),
  };

  const rangeHeader = req.headers.get("range");
  const match = rangeHeader?.match(/^bytes=(\d*)-(\d*)$/);
  if (match && (match[1] || match[2])) {
    let start: number;
    let end: number;
    if (match[1]) {
      start = Number(match[1]);
      end = match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;
    } else {
      // "bytes=-500": son 500 bayt
      start = Math.max(0, info.size - Number(match[2]));
      end = info.size - 1;
    }
    if (start > end || start >= info.size) {
      return new Response(null, { status: 416, headers: { ...base, "Content-Range": `bytes */${info.size}` } });
    }
    const file = await storage.open(key, { start, end });
    if (!file) return new Response("Bulunamadı", { status: 404 });
    return new Response(file.stream, {
      status: 206,
      headers: { ...base, "Content-Range": `bytes ${start}-${end}/${info.size}`, "Content-Length": String(end - start + 1) },
    });
  }

  const file = await storage.open(key);
  if (!file) return new Response("Bulunamadı", { status: 404 });
  return new Response(file.stream, { headers: { ...base, "Content-Length": String(info.size) } });
}
