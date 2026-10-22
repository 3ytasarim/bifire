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

/**
 * Yazı içindeki görünür SSS bölümünü (başlığı "Sık sorulan sorular" olan H2'nin altındaki H3 soru + paragraf
 * cevaplar) çıkarır — FAQPage şeması yalnızca sayfada gerçekten görünen soru/cevaplardan üretilir.
 */
export function extractFaq(html: string | null | undefined): { q: string; a: string }[] {
  if (!html) return [];
  const text = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
  const { sections } = splitHtmlSections(html);
  const faq = sections.find((s) => /^s(ı|i)k sorulan sorular$/i.test(s.title.trim()));
  if (!faq) return [];
  const parts = faq.html.split(/<h3>([\s\S]*?)<\/h3>/);
  const items: { q: string; a: string }[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const q = text(parts[i] ?? "");
    const a = text(parts[i + 1] ?? "");
    if (q && a) items.push({ q, a });
  }
  return items;
}

/**
 * Makale içindekiler menüsü için H2 başlıklarına kararlı kimlik ekler (`bolum-1`…). Girdi sanitize edilmiş HTML'dir;
 * yalnızca düz `<h2>` etiketlerine id eklenir, başka hiçbir şey değişmez.
 */
export function withHeadingIds(html: string | null | undefined): { html: string; toc: { id: string; title: string }[] } {
  if (!html) return { html: "", toc: [] };
  const toc: { id: string; title: string }[] = [];
  const out = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner: string) => {
    const id = `bolum-${toc.length + 1}`;
    toc.push({ id, title: inner.replace(/<[^>]+>/g, "").trim() });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}
