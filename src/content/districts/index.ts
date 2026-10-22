import { DISTRICTS } from "@/content/regions";
import { PART_A } from "./part-a";
import { PART_B } from "./part-b";
import { PART_C } from "./part-c";
import { PART_D } from "./part-d";
import { CLOSING_TEMPLATE, FAQ_TEMPLATES, SECTION_TEMPLATES } from "./templates";
import type { RawDistrict } from "./types";

export type DistrictContent = {
  slug: string;
  name: string;
  side: "Anadolu Yakası" | "Avrupa Yakası";
  h1: string;
  intro: string;
  sections: { title: string; paras: string[] }[];
  faqs: { q: string; a: string }[];
  closing: string | null;
  metaDescription: string;
};

/** Meta açıklama: girişin ilk cümleleri, ~155 karakteri aşmadan cümle sınırında kesilir. */
function metaFrom(intro: string): string {
  const sentences = intro.match(/[^.!?]+[.!?]+/g) ?? [intro];
  let out = "";
  for (const s of sentences) {
    const next = (out + " " + s.trim()).trim();
    if (next.length > 158) break;
    out = next;
  }
  return out || intro.slice(0, 155);
}

function resolve(raw: RawDistrict): DistrictContent {
  const d = DISTRICTS.find((x) => x.slug === raw.s);
  if (!d) throw new Error(`İlçe tanımı yok: ${raw.s}`);
  const fill = (s: string) => s.split("{d}").join(d.name);
  const sections = raw.sec.map((s) => {
    if (typeof s !== "string") return { title: s[0], paras: s[1] };
    const t = SECTION_TEMPLATES[s.replace(/^T:/, "")];
    if (!t) throw new Error(`Bölüm kalıbı yok: ${s} (${raw.s})`);
    return { title: fill(t.title), paras: t.paras.map(fill) };
  });
  const faqs = raw.faq.map((f) => {
    if (typeof f !== "string") return { q: f[0], a: f[1] };
    const t = FAQ_TEMPLATES[f.replace(/^T:/, "")];
    if (!t) throw new Error(`SSS kalıbı yok: ${f} (${raw.s})`);
    return { q: fill(t.q), a: fill(t.a) };
  });
  return {
    slug: raw.s,
    name: d.name,
    side: raw.side === "E" ? "Avrupa Yakası" : "Anadolu Yakası",
    h1: raw.h1,
    intro: raw.intro,
    sections,
    // Sorular kaynakta soru işaretsiz; sayfada ve FAQ şemasında okunurluk için eklenir.
    faqs: faqs.map((f) => ({ q: /[?.]$/.test(f.q) ? f.q : `${f.q}?`, a: f.a })),
    closing: raw.close === "T" ? CLOSING_TEMPLATE : raw.close || null,
    metaDescription: metaFrom(raw.intro),
  };
}

/** 39 ilçenin sayfa içeriği (kaynak sırası: öncelikli ilçeler, ardından alfabetik). */
export const DISTRICT_CONTENT: DistrictContent[] = [...PART_A, ...PART_B, ...PART_C, ...PART_D].map(resolve);

export const districtContentBySlug = (slug: string) => DISTRICT_CONTENT.find((d) => d.slug === slug);
