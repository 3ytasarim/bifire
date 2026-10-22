/**
 * src/content/service-areas/data/*.json → names.json (yalnız ad/slug/kısa metin; istemci bileşenleri için ~20 KB).
 * Kullanım: npm run areas:names  — il/ilçe metinleri güncellendiğinde yeniden çalıştırın.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "src", "content", "service-areas");
type Page = { name: string; slug: string; focus: string };
type Prov = { name: string; slug: string; page: Page; districts: Page[] };

// Kaynaktaki odak metinleri bölüm başlığıdır; soru biçimli olanlara soru işareti eklenir.
const QUESTION = /(\b(nasıl|neden|hangi|neler|neleri|nelere|neyi|nerede|neresinde|nereye|ne zaman|kim)\b|\b(mı|mi|mu|mü)\b|\b\S+(mısınız|misiniz|musunuz|müsünüz|yorsunuz|abilirsiniz|ebilirsiniz|malısınız|melisiniz)\b)/i;
const focus = (t: string) => (QUESTION.test(t) && !/[?.!]$/.test(t) ? `${t}?` : t);

const provinces = readdirSync(path.join(dir, "data"))
  .filter((f) => /^\d\d-.+\.json$/.test(f))
  .sort()
  .map((f) => JSON.parse(readFileSync(path.join(dir, "data", f), "utf8")) as Prov);

const out = provinces.map((p) => ({
  name: p.name,
  slug: p.slug,
  focus: focus(p.page.focus),
  districts: p.districts.map((d) => ({ name: d.name, slug: d.slug, focus: focus(d.focus) })),
}));
writeFileSync(path.join(dir, "names.json"), JSON.stringify(out));
console.log(`${out.length} il, ${out.reduce((n, p) => n + p.districts.length, 0)} ilçe → names.json`);
