/**
 * İlçe sayfası ham içeriği (kaynak: kullanıcının "Hizmet Bölgeleri" sunumu, 2026-10-22).
 * Kalıp bölümler `T:<id>` ile referans verilir; `{d}` ilçe adıyla değiştirilir (bkz. TEMPLATES).
 */
export type RawSection = string | [title: string, paragraphs: string[]];
export type RawFaq = string | [question: string, answer: string];

export type RawDistrict = {
  s: string;
  /** A = Anadolu Yakası, E = Avrupa Yakası */
  side: "A" | "E";
  h1: string;
  intro: string;
  sec: RawSection[];
  faq: RawFaq[];
  /** "T" → ortak kapanış metni; "" → kapanış yok; diğer → ilçeye özel kapanış. */
  close: string;
};
