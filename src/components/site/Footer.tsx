import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { routes } from "@/lib/catalog";
import { getNavCategories } from "@/lib/queries";
import { getSiteSettings, socialLinks, telHref } from "@/lib/settings";
import { SOCIAL_ICONS } from "./Icons";
import { Wordmark } from "./Wordmark";
import { FEATURES } from "@/lib/features";

const CORPORATE = [
  { label: "Kurumsal", href: routes.about },
  { label: "Hizmetler", href: routes.services },
  { label: "Fabrika Showroom", href: routes.showroom },
  { label: "Hizmet Bölgeleri", href: routes.regions },
  ...(FEATURES.projects ? [{ label: "Projeler", href: routes.projects }] : []),
  { label: "Şömine Rehberi", href: routes.blog },
  { label: "Proje Başvurusu", href: routes.quote },
  { label: "İletişim", href: routes.contact },
];

const LEGAL = [
  { label: "KVKK Aydınlatma Metni", href: routes.kvkk },
  { label: "Gizlilik Politikası", href: routes.privacy },
  { label: "Çerez Politikası", href: routes.cookies },
];

export async function Footer() {
  const [s, categories] = await Promise.all([getSiteSettings(), getNavCategories()]);
  const socials = socialLinks(s);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-linen bg-paper text-steel" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        Site bilgileri
      </h2>
      <div className="shell grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10 lg:py-24">
        <div className="sm:col-span-2 lg:col-span-4">
          <Link href="/" aria-label={`${s.companyName} ana sayfa`} className="inline-block">
            <Wordmark logoUrl={s.logoUrl} name={s.companyName} size="footer" />
          </Link>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed">
            {s.footerDescription ||
              "Ateşi mimariyle buluşturan modern şömine çözümleri. Doğru ürün, doğru ölçü ve profesyonel uygulama ile yaşam alanınızın merkezini birlikte tasarlıyoruz."}
          </p>
          {socials.length ? (
            <ul className="mt-8 flex gap-2">
              {socials.map((x) => {
                const Icon = SOCIAL_ICONS[x.kind];
                return (
                  <li key={x.url}>
                    <a
                      href={x.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${s.companyName} ${x.label} hesabı`}
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-sand bg-white transition-colors hover:border-ember hover:text-ember-ink"
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <nav aria-label="Ürün kategorileri" className="lg:col-span-3">
          <p className="eyebrow text-ember-ink">Ürünler</p>
          <ul className="mt-6 space-y-1">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={c.href} className="link-underline inline-flex min-h-10 items-center text-[15px] transition-colors hover:text-ink">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href={routes.products} className="inline-flex min-h-10 items-center gap-1 text-[15px] font-semibold text-ink hover:text-ember-ink">
                Tüm ürünler <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Kurumsal" className="lg:col-span-2">
          <p className="eyebrow text-ember-ink">Bifire</p>
          <ul className="mt-6 space-y-1">
            {CORPORATE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline inline-flex min-h-10 items-center text-[15px] transition-colors hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <p className="eyebrow text-ember-ink">İletişim</p>
          <address className="mt-6 space-y-4 text-[15px] not-italic">
            {s.phone ? (
              <a href={telHref(s.phone)} className="flex items-start gap-3 transition-colors hover:text-ink">
                <Phone aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                {s.phone}
              </a>
            ) : null}
            {s.email ? (
              <a href={`mailto:${s.email}`} className="flex items-start gap-3 break-all transition-colors hover:text-ink">
                <Mail aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                {s.email}
              </a>
            ) : null}
            {s.address ? (
              <p className="flex items-start gap-3">
                <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                <span>
                  {s.address}
                  {s.mapsUrl ? (
                    <>
                      <br />
                      <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer" className="link-underline font-semibold text-ink">
                        Yol tarifi al
                      </a>
                    </>
                  ) : null}
                </span>
              </p>
            ) : null}
            {!s.phone && !s.email && !s.address ? (
              <Link href={routes.contact} className="link-underline font-semibold text-ink">
                İletişim sayfası
              </Link>
            ) : null}
          </address>
        </div>
      </div>

      <div className="border-t border-linen">
        <div className="shell flex flex-col gap-4 py-6 text-[13px] text-stone md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {s.companyName}. Tüm hakları saklıdır.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-10 items-center transition-colors hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
