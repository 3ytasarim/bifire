import { getNavCategories } from "@/lib/queries";
import { getSiteSettings, socialLinks, telHref } from "@/lib/settings";
import { HeaderBar } from "./HeaderBar";

/** Sunucu bileşeni: menü verisini (kategoriler + iletişim) DB'den alır, etkileşimi HeaderBar yapar. */
export async function Header() {
  const [s, categories] = await Promise.all([getSiteSettings(), getNavCategories()]);
  return (
    <HeaderBar
      companyName={s.companyName}
      logoUrl={s.logoUrl}
      phone={s.phone ? { label: s.phone, href: telHref(s.phone) } : null}
      email={s.email}
      workingHours={s.workingHours}
      socials={socialLinks(s)}
      categories={categories.map(({ id, name, slug, image, imageAlt, href, children }) => ({ id, name, slug, image, imageAlt, href, children }))}
    />
  );
}
