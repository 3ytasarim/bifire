import { prisma } from "@/lib/db";
import { sanitizeRichText } from "@/lib/sanitize";

/**
 * Admin'den gelen zengin metin. Kayıt sırasında zaten sanitize edilir; render'da bir kez daha süzülür
 * (DB'ye başka yoldan yazılmış içeriğe karşı derinlemesine savunma).
 * İçerikteki yüklenmiş görsellere Media tablosundaki GERÇEK width/height eklenir (CLS önlenir) ve
 * lazy/async yükleme verilir — görseller yine SSR HTML'inde gerçek <img> olarak kalır (Google Görseller).
 */
export async function RichText({ html, className = "" }: { html: string | null | undefined; className?: string }) {
  const clean = sanitizeRichText(html);
  if (!clean) return null;

  const srcs = [...clean.matchAll(/<img src="(\/uploads\/[^"]+)"/g)].map((m) => m[1]!);
  const dims = srcs.length
    ? new Map((await prisma.media.findMany({ where: { url: { in: srcs } }, select: { url: true, width: true, height: true } })).map((m) => [m.url, m]))
    : new Map<string, { width: number | null; height: number | null }>();

  const enhanced = clean.replace(/<img ([^>]*?)\s*\/?>/g, (_tag, attrs: string) => {
    const src = attrs.match(/src="([^"]+)"/)?.[1] ?? "";
    const d = dims.get(src);
    const size = d?.width && d.height && !/\swidth=/.test(` ${attrs}`) ? ` width="${d.width}" height="${d.height}"` : "";
    return `<img ${attrs}${size} loading="lazy" decoding="async" />`;
  });

  return <div className={`prose prose-lg rich ${className}`} dangerouslySetInnerHTML={{ __html: enhanced }} />;
}
