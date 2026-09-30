import { sanitizeRichText } from "@/lib/sanitize";

/**
 * Admin'den gelen zengin metin. Kayıt sırasında zaten sanitize edilir; render'da bir kez daha süzülür
 * (DB'ye başka yoldan yazılmış içeriğe karşı derinlemesine savunma).
 */
export function RichText({ html, className = "" }: { html: string | null | undefined; className?: string }) {
  const clean = sanitizeRichText(html);
  if (!clean) return null;
  return <div className={`prose prose-lg rich ${className}`} dangerouslySetInnerHTML={{ __html: clean }} />;
}
