"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { ArrowRight, ChevronDown, Mail, Menu, Phone, X } from "lucide-react";
import { SOCIAL_ICONS } from "./Icons";
import { Wordmark } from "./Wordmark";

export type NavCategory = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  imageAlt: string | null;
  children: { id: string; name: string; slug: string }[];
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

const NAV_LEFT = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Kurumsal", href: "/kurumsal" },
];
const NAV_RIGHT = [
  { label: "Projeler", href: "/projeler" },
  { label: "Blog", href: "/blog" },
  { label: "İletişim", href: "/iletisim" },
];

/**
 * Norm Yacht header mantığı (üst bilgi bandı + sticky ana menü, ikiye bölünmüş menü, ortada logo,
 * Ürünler açılır menüsü, hamburger mobil panel) — Bifire için:
 * - Ana sayfada hero üzerinde şeffaf başlar, kaydırınca antrasit zemine geçer; diğer sayfalarda koyu.
 * - Ürünler: görselli kategori mega menüsü (hover + klavye focus-within).
 * - Mobil: tam ekran panel; bağlantılar sunucu HTML'inde gerçek <a> olarak bulunur (crawl edilebilir).
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
    `relative inline-flex h-full items-center gap-1.5 py-2 text-[12px] font-semibold tracking-[0.2em] uppercase transition-colors duration-300 ${
      active ? "text-white" : "text-white/70 hover:text-white"
    } after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-ember after:transition-transform after:duration-500 ${
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
        className={`${isHome ? "fixed" : "sticky"} inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
          open
            ? "bg-ink" // backdrop-filter fixed konumlu mobil paneli header'a hapseder → açıkken düz zemin
            : transparent
              ? "bg-gradient-to-b from-black/55 to-transparent"
              : "bg-ink/95 shadow-[0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-md"
        }`}
      >
        {/* Üst bilgi bandı (desktop) — Site Ayarları'nda gösterilecek bilgi yoksa hiç render edilmez */}
        {hasTopbar ? (
        <div
          className={`hidden overflow-hidden border-b border-white/10 text-[12px] text-white/65 transition-[max-height,opacity] duration-500 md:block ${
            scrolled && !open ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
          }`}
        >
          <div className="shell flex h-10 items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {phone ? (
                <a href={phone.href} className="inline-flex items-center gap-2 transition-colors hover:text-white">
                  <Phone aria-hidden="true" className="h-3.5 w-3.5 text-ember" />
                  {phone.label}
                </a>
              ) : null}
              {email ? (
                <a href={`mailto:${email}`} className="inline-flex items-center gap-2 transition-colors hover:text-white">
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
                        className="flex h-8 w-8 items-center justify-center transition-colors hover:text-white"
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

        {/* Ana menü */}
        <div className="shell">
          <div className="flex h-[72px] items-center justify-between gap-4 lg:h-[88px]">
            <nav aria-label="Ana menü" className="hidden h-full flex-1 lg:block">
              <ul className="flex h-full items-center gap-7 xl:gap-10">
                {renderLinks(NAV_LEFT)}
                <li
                  className="group/mega h-full"
                  onMouseEnter={() => setMegaDismissed(false)}
                  onFocus={() => setMegaDismissed(false)}
                >
                  <Link href="/urunler" className={linkClass(productsActive)} aria-current={pathname === "/urunler" ? "page" : undefined}>
                    Ürünler
                    <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-300 group-hover/mega:rotate-180" />
                  </Link>
                  {categories.length ? (
                    <div
                      className={`invisible absolute inset-x-0 top-full translate-y-2 opacity-0 transition-all duration-300 ease-(--ease-premium) ${
                        megaDismissed ? "" : "group-focus-within/mega:visible group-focus-within/mega:translate-y-0 group-focus-within/mega:opacity-100 group-hover/mega:visible group-hover/mega:translate-y-0 group-hover/mega:opacity-100"
                      }`}
                    >
                      <div className="border-t border-white/10 bg-anthracite shadow-2xl">
                        <div className="shell grid grid-cols-12 gap-10 py-10">
                          <ul className="col-span-9 grid grid-cols-4 gap-x-6 gap-y-8">
                            {categories.map((c) => (
                              <li key={c.id}>
                                <Link href={`/urunler/${c.slug}`} className="group/cat block">
                                  <span className="zoom-media relative block aspect-[4/3] bg-smoke">
                                    {c.image ? (
                                      <Image src={c.image} alt="" fill sizes="220px" className="object-cover opacity-85 transition-opacity group-hover/cat:opacity-100" />
                                    ) : (
                                      <span className="ember-placeholder absolute inset-0 opacity-70" />
                                    )}
                                  </span>
                                  <span className="mt-3 flex items-center justify-between gap-2 text-sm font-semibold text-white">
                                    {c.name}
                                    <ArrowRight aria-hidden="true" className="h-4 w-4 -translate-x-1 text-ember opacity-0 transition-all group-hover/cat:translate-x-0 group-hover/cat:opacity-100" />
                                  </span>
                                </Link>
                                {c.children.length ? (
                                  <ul className="mt-2 space-y-1">
                                    {c.children.map((ch) => (
                                      <li key={ch.id}>
                                        <Link href={`/urunler/${ch.slug}`} className="text-[13px] text-white/55 transition-colors hover:text-white">
                                          {ch.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                          <div className="col-span-3 flex flex-col justify-between border-l border-white/10 pl-10">
                            <div>
                              <p className="eyebrow text-amber">Koleksiyon</p>
                              <p className="mt-4 font-display text-2xl leading-snug font-semibold text-white">
                                Mekânınıza göre doğru şömineyi birlikte seçelim.
                              </p>
                            </div>
                            <div className="mt-8 flex flex-col gap-3">
                              <Link href="/urunler" className="btn btn-light">
                                Tüm ürünler <ArrowRight aria-hidden="true" className="btn-arrow h-4 w-4" />
                              </Link>
                              <Link href="/teklif-al" className="btn btn-ghost-light">
                                Teklif al
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </li>
              </ul>
            </nav>

            <Link href="/" className="relative z-10 shrink-0" aria-label={`${companyName} ana sayfa`}>
              <Wordmark logoUrl={logoUrl} name={companyName} />
            </Link>

            <div className="hidden h-full flex-1 items-center justify-end gap-7 lg:flex xl:gap-10">
              <nav aria-label="İkincil menü" className="h-full">
                <ul className="flex h-full items-center gap-7 xl:gap-10">{renderLinks(NAV_RIGHT)}</ul>
              </nav>
              <Link href="/teklif-al" className="btn btn-ember min-h-11 px-5 text-[12px]">
                Teklif Al
              </Link>
            </div>

            <button
              type="button"
              className="-mr-2 flex h-12 w-12 items-center justify-center text-white lg:hidden"
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
          className={`fixed inset-x-0 top-[72px] bottom-0 overflow-y-auto overscroll-contain bg-ink lg:hidden ${hasTopbar ? "md:top-[112px]" : ""}`}
        >
          <nav aria-label="Mobil menü" className="shell flex min-h-full flex-col py-6">
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {NAV_LEFT.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex min-h-14 items-center font-display text-2xl font-semibold ${isActive(item.href) ? "text-ember" : "text-white"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className={`flex min-h-14 w-full items-center justify-between font-display text-2xl font-semibold ${productsActive ? "text-ember" : "text-white"}`}
                  aria-expanded={productsOpen}
                  onClick={() => setProductsOpen((v) => !v)}
                >
                  Ürünler
                  <ChevronDown aria-hidden="true" className={`h-5 w-5 transition-transform ${productsOpen ? "rotate-180" : ""}`} />
                </button>
                <ul hidden={!productsOpen} className="pb-4">
                  <li>
                    <Link href="/urunler" className="flex min-h-12 items-center text-base font-semibold text-amber">
                      Tüm ürünler
                    </Link>
                  </li>
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link href={`/urunler/${c.slug}`} className="flex min-h-12 items-center text-base text-white/80">
                        {c.name}
                      </Link>
                      {c.children.length ? (
                        <ul className="border-l border-white/10 pl-4">
                          {c.children.map((ch) => (
                            <li key={ch.id}>
                              <Link href={`/urunler/${ch.slug}`} className="flex min-h-11 items-center text-sm text-white/60">
                                {ch.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </li>
              {NAV_RIGHT.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex min-h-14 items-center font-display text-2xl font-semibold ${isActive(item.href) ? "text-ember" : "text-white"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-auto space-y-6 pt-10">
              <Link href="/teklif-al" className="btn btn-ember w-full">
                Teklif Al <ArrowRight aria-hidden="true" className="btn-arrow h-4 w-4" />
              </Link>
              <div className="space-y-2 text-sm text-white/70">
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
                          className="flex h-12 w-12 items-center justify-center border border-white/15 text-white/80"
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
