import Link from "next/link";
import { ArrowUp, ArrowUpRight, Mail, Phone } from "lucide-react";
import { routes } from "@/lib/catalog";
import { getNavCategories } from "@/lib/queries";
import { getSiteSettings, socialLinks, telHref } from "@/lib/settings";
import { SOCIAL_ICONS } from "./Icons";
import { Wordmark } from "./Wordmark";

const SLOGAN = "Biwool’un yalıtım birikimiyle şekillenen Bifire Şömine; tasarımı, üretimi ve kendi ekibiyle uygulamayı aynı çatı altında buluşturur.";

const DISCOVER = [
  { label: "Bifire ve Biwool", href: routes.about },
  { label: "Tasarım ve Montaj", href: routes.services },
  { label: "Şömine Rehberi", href: routes.blog },
  { label: "Hizmet Bölgeleri", href: routes.regions },
  { label: "İletişim", href: routes.contact },
];

const LEGAL = [
  { label: "KVKK Aydınlatma Metni", href: routes.kvkk },
  { label: "Gizlilik Politikası", href: routes.privacy },
  { label: "Çerez Politikası", href: routes.cookies },
];

/** Footer'da kategori adları kısa gösterilir (Bahçe ve Tamamlayıcı Ürünler → Dış Mekân). */
const SHORT_NAMES: Record<string, string> = { "bahce-ve-tamamlayici-urunler": "Dış Mekân" };

const headCls = "font-display text-[15px] font-medium tracking-[0.01em] text-ember-ink";
const linkCls = "link-underline inline-flex min-h-9 items-center text-[14px] text-ink/85 transition-colors hover:text-ink";

/** Dar, açık taş tonlu footer: marka + slogan · Koleksiyonlar · Bifire'yi Keşfedin · Fabrika Showroom. */
export async function Footer() {
  const [s, categories] = await Promise.all([getSiteSettings(), getNavCategories()]);
  const socials = socialLinks(s);
  const year = new Date().getFullYear();
  const collections = [
    ...categories.map((c) => ({ id: c.id, label: SHORT_NAMES[c.slug] ?? c.name, href: c.href })),
    ...categories.flatMap((c) => c.children.filter((ch) => /aksesuar/.test(ch.slug)).map((ch) => ({ id: ch.id, label: ch.name, href: ch.href }))),
  ];

  return (
    <footer className="border-t border-sand bg-paper text-steel" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        Site bilgileri
      </h2>
      <div className="shell grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1.1fr] lg:gap-12 lg:py-14">
        <div>
          <Link href="/" aria-label={`${s.companyName} ana sayfa`} className="inline-block">
            <Wordmark logoUrl={s.logoUrl} name={s.companyName} size="footer" />
          </Link>
          <p className="mt-5 max-w-[300px] text-[14px] leading-relaxed">{SLOGAN}</p>
          <p className="mt-5 text-[11px] leading-relaxed font-semibold tracking-[0.18em] text-ember-ink uppercase">
            Üretim ve uygulama
            <span className="block">İstanbul · Tuzla</span>
          </p>
          {socials.length ? (
            <ul className="mt-5 flex gap-2">
              {socials.map((x) => {
                const Icon = SOCIAL_ICONS[x.kind];
                return (
                  <li key={x.url}>
                    <a
                      href={x.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${s.companyName} ${x.label} hesabı`}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-sand bg-white transition-colors hover:border-ember hover:text-ember-ink"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <nav aria-label="Koleksiyonlar">
          <h3 className={headCls}>Koleksiyonlar</h3>
          <ul className="mt-4">
            {collections.map((c) => (
              <li key={c.id}>
                <Link href={c.href} className={linkCls}>
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Bifire'yi keşfedin">
          <h3 className={headCls}>Bifire&apos;yi Keşfedin</h3>
          <ul className="mt-4">
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
          <h3 className={headCls}>Fabrika Showroom</h3>
          <p className="mt-4 font-display text-[18px] text-ink">İstanbul, Tuzla</p>
          <p className="mt-2 max-w-[280px] text-[14px] leading-relaxed">Modelleri ve malzemeleri projeniz üzerinden değerlendirelim.</p>
          {s.phone || s.email ? (
            <address className="mt-3 space-y-1 text-[14px] not-italic">
              {s.phone ? (
                <a href={telHref(s.phone)} className="flex min-h-9 items-center gap-2.5 transition-colors hover:text-ink">
                  <Phone aria-hidden="true" className="h-4 w-4 text-ember" /> {s.phone}
                </a>
              ) : null}
              {s.email ? (
                <a href={`mailto:${s.email}`} className="flex min-h-9 items-center gap-2.5 break-all transition-colors hover:text-ink">
                  <Mail aria-hidden="true" className="h-4 w-4 text-ember" /> {s.email}
                </a>
              ) : null}
            </address>
          ) : null}
          <Link href={routes.showroom} className="group mt-4 inline-flex min-h-11 items-center gap-6 border-b border-sand pb-1 text-[15px] text-ink transition-colors hover:border-ember">
            Showroomu inceleyin
            <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-ember-ink transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      <div className="shell">
        <div className="flex flex-col gap-3 border-t border-sand py-4 text-[13px] text-stone md:flex-row md:items-center md:gap-6">
          <p className="shrink-0">
            © {year} {s.companyName} Şömine
          </p>
          {/* Tasarım imzası: bronz parıltı akan metin, hover'da alt çizgi dolar (azaltılmış harekette durur). */}
          <a
            href="https://www.3ytasarim.com"
            target="_blank"
            rel="noopener"
            className="group inline-flex min-h-10 items-center gap-1.5 self-start text-[12px] tracking-[0.04em] md:mx-auto md:self-auto"
          >
            <span className="text-stone">Design by</span>
            <span className="credit-shimmer relative font-semibold">
              3Y Tasarım &amp; Yazılım Hizmetleri
              <span aria-hidden="true" className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-ember transition-transform duration-500 ease-(--ease-premium) group-hover:scale-x-100" />
            </span>
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-ember-ink transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <ul className="flex shrink-0 flex-wrap items-center gap-x-6">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-10 items-center transition-colors hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="#" className="group inline-flex min-h-10 items-center gap-1.5 text-ink transition-colors hover:text-ember-ink">
                Yukarı dön <ArrowUp aria-hidden="true" className="h-3.5 w-3.5 text-ember-ink transition-transform duration-300 group-hover:-translate-y-0.5" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
