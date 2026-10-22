/**
 * Sanitize edilmiş zengin metni H2 başlıklarına göre böler: ilk başlıktan önceki kısım giriş (lead),
 * her H2 ve ardından gelen içerik bir bölüm olur. Ürün/hizmet sayfalarında uzun düz metni görsel bloklara
 * çevirmek için kullanılır. Girdi her zaman `sanitizeRichText` çıktısıdır (yalnızca izinli etiketler).
 */
export function splitHtmlSections(html: string | null | undefined): { lead: string; sections: { title: string; html: string }[] } {
  if (!html) return { lead: "", sections: [] };
  const parts = html.split(/<h2>([\s\S]*?)<\/h2>/);
  const lead = (parts[0] ?? "").trim();
  const sections: { title: string; html: string }[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const title = (parts[i] ?? "").replace(/<[^>]+>/g, "").trim();
    const body = (parts[i + 1] ?? "").trim();
    if (title) sections.push({ title, html: body });
  }
  return { lead, sections };
}
