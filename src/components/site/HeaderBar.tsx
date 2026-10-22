"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { ArrowUpRight, ChevronDown, Mail, Menu, Phone, Sparkles, X } from "lucide-react";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { BeaconCta } from "@/components/ui/beacon-cta";
import { SOCIAL_ICONS } from "./Icons";
import { Wordmark } from "./Wordmark";
import { FEATURES } from "@/lib/features";

export type NavCategory = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  imageAlt: string | null;
  href: string;
  children: { id: string; name: string; slug: string; href: string }[];
};

export type HeaderSocial = { kind: keyof typeof SOCIAL_ICONS; url: string; label: string };

type Props = {
  companyName: string;
  logoUrl: string | null;
  phone: { label: string; href: string } | null;
  email: string | null;
  workingHours: string | null;
  socials: HeaderSocial[];
  categories: NavCategory[];
};

// Masaüstü: sol = Kurumsal · Ürünler (mega) · Hizmetler · Hizmet Bölgeleri; sağ = Showroom · Rehber · İletişim (logo ana sayfaya gider).
const NAV_LEFT = [{ label: "Kurumsal", href: "/kurumsal" }];
const NAV_AFTER_PRODUCTS = [
  { label: "Hizmetler", href: "/hizmetler" },
  { label: "Hizmet Bölgeleri", href: "/hizmet-bolgeleri" },
];
const NAV_RIGHT = [
  ...(FEATURES.projects ? [{ label: "Projeler", href: "/projeler" }] : []),
  { label: "Showroom", href: "/fabrika-showroom" },
  { label: "Rehber", href: "/somine-rehberi" },
  { label: "İletişim", href: "/iletisim" },
];
// Mobil panelde ek olarak gösterilenler.
const NAV_MOBILE_FIRST = [{ label: "Ana Sayfa", href: "/" }];
const NAV_MOBILE_EXTRA: { label: string; href: string }[] = [];

/**
 * Norm Yacht header mantığı (üst bilgi bandı + sticky ana menü, ikiye bölünmüş menü, ortada logo,
 * Ürünler açılır menüsü, hamburger mobil panel) — Bifire için:
 * - Açık tema: beyaz zemin + antrasit metin. Yalnızca ana sayfada fotoğraflı hero üzerinde şeffaf başlar,
 *   kaydırınca beyaza geçer.
 * - Ürünler: görselli kategori mega menüsü (hover + klavye focus-within).
 * - Mobil: tam ekran beyaz panel; bağlantılar sunucu HTML'inde gerçek <a> olarak bulunur (crawl edilebilir).
 */
export function HeaderBar({ companyName, logoUrl, phone, email, workingHours, socials, categories }: Props) {
  const pathname = usePathname() || "/";
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [megaDismissed, setMegaDismissed] = useState(false);
  const panelId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sayfa değişince menüler kapanır (Norm Yacht davranışı); render sırasında önceki yolla karşılaştırılır.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setMegaDismissed(true);
  }

  // Menüdeki bir bağlantıya tıklanınca menüler HEMEN kapanır: yeni sayfanın yüklenmesi beklenirse (veya aynı
  // sayfaya tıklanırsa) menü açık kalıyordu. Odak bırakılır ki focus-within mega menüyü tekrar açmasın.
  const closeOnLinkClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest("a")) return;
    setMegaDismissed(true);
    setOpen(false);
    (document.activeElement as HTMLElement | null)?.blur();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const transparent = isHome && !scrolled && !open;
  const hasTopbar = Boolean(phone || email || workingHours || socials.length);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
  const productsActive = pathname.startsWith("/urun");

  const linkClass = (active: boolean) =>
    `relative inline-flex h-full items-center gap-1.5 py-2 text-[12px] font-semibold tracking-[0.1em] whitespace-nowrap uppercase transition-colors duration-300 xl:tracking-[0.18em] ${
      transparent ? (active ? "text-white" : "text-white/80 hover:text-white") : active ? "text-ink" : "text-steel hover:text-ink"
    } after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:origin-left after:bg-ember after:transition-transform after:duration-500 ${
      active ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
    }`;

  const renderLinks = (items: { label: string; href: string }[]) =>
    items.map((item) => (
      <li key={item.href} className="h-full">
        <Link href={item.href} className={linkClass(isActive(item.href))} aria-current={isActive(item.href) ? "page" : undefined}>
          {item.label}
        </Link>
      </li>
    ));

  return (
    <>
      <a href="#icerik" className="sr-only z-[70] bg-ember px-4 py-3 text-sm font-semibold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        İçeriğe geç
      </a>

      <header
        className={`${isHome ? "fixed" : "sticky"} inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-500 ${
          open
            ? "bg-white" // backdrop-filter fixed konumlu mobil paneli header'a hapseder → açıkken düz zemin
            : transparent
              ? "border-b border-transparent bg-gradient-to-b from-black/45 to-transparent bg-no-repeat [background-origin:border-box]"
              : "border-b border-linen bg-white/95 shadow-[0_10px_30px_-24px_rgb(12_12_13/0.35)] backdrop-blur-md"
        }`}
      >
        {/* Üst bilgi bandı (desktop) — Site Ayarları'nda gösterilecek bilgi yoksa hiç render edilmez */}
        {hasTopbar ? (
          <div
            className={`hidden overflow-hidden text-[12px] transition-[max-height,opacity] duration-500 md:block ${
              transparent ? "border-b border-white/15 text-white/75" : "border-b border-linen bg-paper text-steel"
            } ${scrolled && !open ? "max-h-0 opacity-0" : "max-h-10 opacity-100"}`}
          >
            <div className="shell flex h-10 items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                {phone ? (
                  <a href={phone.href} className="inline-flex items-center gap-2 transition-colors hover:text-ember">
                    <Phone aria-hidden="true" className="h-3.5 w-3.5 text-ember" />
                    {phone.label}
                  </a>
                ) : null}
                {email ? (
                  <a href={`mailto:${email}`} className="inline-flex items-center gap-2 transition-colors hover:text-ember">
                    <Mail aria-hidden="true" className="h-3.5 w-3.5 text-ember" />
                    {email}
                  </a>
                ) : null}
                {workingHours ? <span className="hidden lg:inline">{workingHours}</span> : null}
              </div>
              {socials.length ? (
                <ul className="flex items-center gap-1">
                  {socials.map((s) => {
                    const Icon = SOCIAL_ICONS[s.kind];
                    return (
                      <li key={s.url}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${companyName} ${s.label} hesabı`}
                          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:text-ember"
                        >
                          <Icon className="h-4 w-4" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Ana menü — sayfa gövdesinden geniş kap: sağ/sol menü gruplarına logo çevresinde nefes payı kalır. */}
        <div className="mx-auto w-full max-w-[1840px] px-4 sm:px-6 lg:px-8 2xl:px-12">
          {/* Masaüstünde 1fr | logo | 1fr ızgara: sol ve sağ sütun eşit genişlikte, logo her zaman tam ortada. */}
          <div className="flex h-[72px] items-center justify-between gap-4 lg:grid lg:h-[88px] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-8 xl:gap-12">
            <nav aria-label="Ana menü" className="hidden h-full min-w-0 lg:block">
              <ul className="flex h-full items-center gap-5 xl:gap-10">
                {renderLinks(NAV_LEFT)}
                <li className="group/mega h-full" onMouseEnter={() => setMegaDismissed(false)} onFocus={() => setMegaDismissed(false)}>
                  <Link href="/urunler" onClick={closeOnLinkClick} className={linkClass(productsActive)} aria-current={pathname === "/urunler" ? "page" : undefined}>
                    Ürünler
                    <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-300 group-hover/mega:rotate-180" />
                  </Link>
                  {categories.length ? (
                    <div
                      onClick={closeOnLinkClick}
                      className={`invisible absolute inset-x-0 top-full translate-y-2 opacity-0 transition-all duration-300 ease-(--ease-premium) ${
                        megaDismissed
                          ? ""
                          : "group-focus-within/mega:visible group-focus-within/mega:translate-y-0 group-focus-within/mega:opacity-100 group-hover/mega:visible group-hover/mega:translate-y-0 group-hover/mega:opacity-100"
                      }`}
                    >
                      <div className="border-y border-linen bg-white shadow-[0_30px_60px_-30px_rgb(12_12_13/0.3)]">
                        <div className="shell grid grid-cols-12 gap-8 py-9">
                          {/* Yalnız kategori görseli + başlık (alt kategoriler sayfa içinde). Açılışta kartlar sırayla belirir. */}
                          <ul className={`col-span-9 grid gap-4 ${categories.length > 4 ? "grid-cols-4" : categories.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
                            {categories.map((c, i) => (
                              <li
                                key={c.id}
                                style={{ transitionDelay: `${80 + i * 60}ms` }}
                                className="translate-y-3 opacity-0 transition-[opacity,translate] duration-500 ease-(--ease-premium) group-focus-within/mega:translate-y-0 group-focus-within/mega:opacity-100 group-hover/mega:translate-y-0 group-hover/mega:opacity-100"
                              >
                                <Link href={c.href} className="group/cat relative block overflow-hidden rounded-2xl bg-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember">
                                  <span className="relative block aspect-[4/5]">
                                    {c.image ? (
                                      <Image src={c.image} alt="" fill sizes="260px" className="object-cover transition-transform duration-700 ease-(--ease-premium) group-hover/cat:scale-[1.04]" />
                                    ) : (
                                      <span className="ember-placeholder absolute inset-0" />
                                    )}
                                    <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent transition-opacity duration-500 group-hover/cat:opacity-90" />
                                  </span>
                                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                                    <span className="font-display text-[17px] leading-snug font-semibold text-white">{c.name}</span>
                                    <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors duration-500 group-hover/cat:bg-ember group-hover/cat:text-ink">
                                      <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover/cat:rotate-45" />
                                    </span>
                                  </span>
                                  <span aria-hidden="true" className="absolute inset-x-4 bottom-0 h-[2px] origin-left scale-x-0 rounded-full bg-ember transition-transform duration-700 ease-(--ease-premium) group-hover/cat:scale-x-100" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                          <div className="col-span-3 flex flex-col justify-between rounded-2xl bg-paper p-7">
                            <div>
                              <p className="eyebrow text-ember-ink">Koleksiyon</p>
                              <p className="mt-4 font-display text-xl leading-snug font-semibold text-ink">Mekânınıza göre doğru şömineyi birlikte seçelim.</p>
                            </div>
                            <div className="mt-8 flex flex-col gap-3">
                              <ArrowFillButton href="/urunler" tone="ink" size="sm">
                                Tüm ürünler
                              </ArrowFillButton>
                              <button
                                type="button"
                                data-guide-open=""
                                aria-haspopup="dialog"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-sand bg-white px-5 text-[13px] font-semibold text-ink transition-colors hover:border-ink"
                              >
                                <Sparkles aria-hidden="true" className="h-4 w-4 text-ember" /> Birlikte bulalım
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </li>
                {renderLinks(NAV_AFTER_PRODUCTS)}
              </ul>
            </nav>

            <Link href="/" className="relative z-10 shrink-0" aria-label={`${companyName} ana sayfa`}>
              <Wordmark logoUrl={logoUrl} name={companyName} tone={transparent ? "light" : "dark"} />
            </Link>

            <div className="hidden h-full min-w-0 items-center justify-end gap-4 lg:flex xl:gap-8">
              <nav aria-label="İkincil menü" className="h-full">
                <ul className="flex h-full items-center gap-4 xl:gap-8">{renderLinks(NAV_RIGHT)}</ul>
              </nav>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  data-guide-open=""
                  aria-haspopup="dialog"
                  aria-label="Birlikte bulalım — adım adım şömine seçim rehberi"
                  className={`group hidden min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] font-semibold whitespace-nowrap transition-colors duration-300 min-[1536px]:inline-flex ${
                    transparent ? "border-white/40 bg-white/10 text-white backdrop-blur-md hover:border-white" : "border-sand bg-white text-ink hover:border-ink"
                  }`}
                >
                  <Sparkles aria-hidden="true" className="h-4 w-4 text-ember transition-transform duration-500 group-hover:rotate-12" />
                  Birlikte bulalım
                </button>
                <BeaconCta href="/teklif-al" tone={transparent ? "light" : "ink"}>
                  Teklif Al
                </BeaconCta>
              </div>
            </div>

            <button
              type="button"
              className={`-mr-2 flex h-12 w-12 items-center justify-center lg:hidden ${transparent ? "text-white" : "text-ink"}`}
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobil panel (sunucu HTML'inde mevcut, butonla açılır) */}
        <div
          id={panelId}
          hidden={!open}
          className={`fixed inset-x-0 top-[72px] bottom-0 overflow-y-auto overscroll-contain border-t border-linen bg-white lg:hidden ${hasTopbar ? "md:top-[112px]" : ""}`}
        >
          <nav aria-label="Mobil menü" onClick={closeOnLinkClick} className="shell flex min-h-full flex-col py-6">
            <ul className="divide-y divide-linen border-y border-linen">
              {[...NAV_MOBILE_FIRST, ...NAV_LEFT].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={`flex min-h-14 items-center font-display text-2xl font-semibold ${isActive(item.href) ? "text-ember-ink" : "text-ink"}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className={`flex min-h-14 w-full items-center justify-between font-display text-2xl font-semibold ${productsActive ? "text-ember-ink" : "text-ink"}`}
                  aria-expanded={productsOpen}
                  onClick={() => setProductsOpen((v) => !v)}
                >
                  Ürünler
                  <ChevronDown aria-hidden="true" className={`h-5 w-5 transition-transform ${productsOpen ? "rotate-180" : ""}`} />
                </button>
                <ul hidden={!productsOpen} className="pb-4">
                  <li>
                    <Link href="/urunler" className="flex min-h-12 items-center text-base font-semibold text-ember-ink">
                      Tüm ürünler
                    </Link>
                  </li>
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link href={c.href} className="flex min-h-12 items-center gap-3 text-base text-ink">
                        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-bone">
                          {c.image ? <Image src={c.image} alt="" fill sizes="36px" className="object-cover" /> : <span className="ember-placeholder absolute inset-0" />}
                        </span>
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              {[...NAV_AFTER_PRODUCTS, ...NAV_RIGHT, ...NAV_MOBILE_EXTRA].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={`flex min-h-14 items-center font-display text-2xl font-semibold ${isActive(item.href) ? "text-ember-ink" : "text-ink"}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-auto space-y-6 pt-10">
              <button
                type="button"
                data-guide-open=""
                aria-haspopup="dialog"
                onClick={() => setOpen(false)}
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full border border-sand bg-white text-[15px] font-semibold text-ink"
              >
                <Sparkles aria-hidden="true" className="h-4 w-4 text-ember" /> Birlikte bulalım
              </button>
              <ArrowFillButton href="/teklif-al" tone="ember" size="lg" fullWidth>
                Teklif Al
              </ArrowFillButton>
              <div className="space-y-2 text-sm text-steel">
                {phone ? (
                  <a href={phone.href} className="flex min-h-11 items-center gap-3">
                    <Phone aria-hidden="true" className="h-4 w-4 text-ember" /> {phone.label}
                  </a>
                ) : null}
                {email ? (
                  <a href={`mailto:${email}`} className="flex min-h-11 items-center gap-3">
                    <Mail aria-hidden="true" className="h-4 w-4 text-ember" /> {email}
                  </a>
                ) : null}
              </div>
              {socials.length ? (
                <ul className="flex gap-2">
                  {socials.map((s) => {
                    const Icon = SOCIAL_ICONS[s.kind];
                    return (
                      <li key={s.url}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${companyName} ${s.label} hesabı`}
                          className="flex h-12 w-12 items-center justify-center rounded-full border border-linen text-ink"
                        >
                          <Icon className="h-5 w-5" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
