import Link from "next/link";
import { ArrowUp, ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { routes } from "@/lib/catalog";
import { getNavCategories } from "@/lib/queries";
import { getSiteSettings, socialLinks, telHref } from "@/lib/settings";
import { SOCIAL_ICONS } from "./Icons";
import { Wordmark } from "./Wordmark";
import { FEATURES } from "@/lib/features";

const DISCOVER = [
  { label: "Bifire ve Biwool", href: routes.about },
  { label: "Tasarım ve Montaj", href: routes.services },
  { label: "Mekânınıza Özel Tasarım", href: "/mekaniniza-ozel-tasarim" },
  ...(FEATURES.projects ? [{ label: "Projeler", href: routes.projects }] : []),
  { label: "Şömine Rehberi", href: routes.blog },
  { label: "Hizmet Bölgeleri", href: routes.regions },
  { label: "Proje Başvurusu", href: routes.quote },
  { label: "İletişim", href: routes.contact },
];

const LEGAL = [
  { label: "KVKK Aydınlatma Metni", href: routes.kvkk },
  { label: "Gizlilik Politikası", href: routes.privacy },
  { label: "Çerez Politikası", href: routes.cookies },
];

const linkCls = "link-underline inline-flex min-h-10 items-center text-[13px] text-steel transition-colors hover:text-ink";
const headCls = "text-[12px] font-semibold tracking-[0.16em] text-ember-ink uppercase";

/** Açık taş tonlu footer: marka · koleksiyonlar · keşfedin · Tuzla fabrika showroom; altta yasal bağlantılar. */
export async function Footer() {
  const [s, categories] = await Promise.all([getSiteSettings(), getNavCategories()]);
  const socials = socialLinks(s);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-sand bg-paper text-steel" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        Site bilgileri
      </h2>
      <div className="shell grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[309fr_248fr_248fr_297fr] lg:gap-[55px] lg:py-[88px]">
        <div>
          <Link href="/" aria-label={`${s.companyName} ana sayfa`} className="inline-block">
            <Wordmark logoUrl={s.logoUrl} name={s.companyName} size="footer" />
          </Link>
          <p className="mt-6 max-w-xs text-[14px] leading-relaxed">{s.footerDescription || "Bifire Şömine, Biwool markasına aittir."}</p>
          <p className="mt-5 text-[11px] font-semibold tracking-[0.18em] text-ink uppercase">
            Üretim ve uygulama
            <span className="mt-1 block font-medium text-stone">İstanbul · Tuzla</span>
          </p>
          {socials.length ? (
            <ul className="mt-7 flex gap-2">
              {socials.map((x) => {
                const Icon = SOCIAL_ICONS[x.kind];
                return (
                  <li key={x.url}>
                    <a
                      href={x.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${s.companyName} ${x.label} hesabı`}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-sand bg-white transition-colors hover:border-ember hover:text-ember-ink"
                    >
                      <Icon className="h-[17px] w-[17px]" />
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <nav aria-label="Koleksiyonlar">
          <h3 className={headCls}>Koleksiyonlar</h3>
          <ul className="mt-5">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={c.href} className={linkCls}>
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href={routes.products} className="inline-flex min-h-10 items-center gap-1 text-[13px] font-medium text-ink hover:text-ember-ink">
                Tüm koleksiyonlar <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Bifire'yi keşfedin">
          <h3 className={headCls}>Bifire&apos;yi keşfedin</h3>
          <ul className="mt-5">
            {DISCOVER.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkCls}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className={headCls}>Fabrika showroom</h3>
          <p className="mt-5 font-display text-[17px] font-medium text-ink">İstanbul, Tuzla</p>
          <p className="mt-2 text-[14px] leading-relaxed">Modelleri ve malzemeleri projeniz üzerinden değerlendirelim.</p>
          <address className="mt-5 space-y-2 text-[13px] not-italic">
            {s.address ? (
              <p className="flex items-start gap-2.5">
                <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                <span>{s.address}</span>
              </p>
            ) : null}
            {s.phone ? (
              <a href={telHref(s.phone)} className="flex min-h-9 items-center gap-2.5 transition-colors hover:text-ink">
                <Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-ember" />
                {s.phone}
              </a>
            ) : null}
            {s.email ? (
              <a href={`mailto:${s.email}`} className="flex min-h-9 items-center gap-2.5 break-all transition-colors hover:text-ink">
                <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-ember" />
                {s.email}
              </a>
            ) : null}
          </address>
          <div className="mt-4 flex flex-wrap gap-x-6">
            <Link href={routes.showroom} className="group inline-flex min-h-10 items-center gap-1.5 text-[13px] font-medium text-ember-ink hover:text-ink">
              <span className="link-underline">Showroomu inceleyin</span>
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            {s.mapsUrl ? (
              <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-10 items-center gap-1.5 text-[13px] font-medium text-ink hover:text-ember-ink">
                <span className="link-underline">Yol tarifi</span>
                <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-sand">
        <div className="shell flex flex-col gap-3 py-5 text-[12px] text-stone md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {s.companyName}. Tüm hakları saklıdır.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-10 items-center transition-colors hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="#" className="group inline-flex min-h-10 items-center gap-1.5 font-medium text-ink transition-colors hover:text-ember-ink">
                Yukarı dön <ArrowUp aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
