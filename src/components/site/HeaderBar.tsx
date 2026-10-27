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

// Masaüstü (referans tasarım): logo solda · Koleksiyonlar (mega) · Bifire & Biwool · Özel Tasarım · Şömine Rehberi · Hizmet Bölgeleri · CTA.
const NAV_MAIN = [
  { label: "Bifire & Biwool", href: "/kurumsal" },
  { label: "Özel Tasarım", href: "/mekaniniza-ozel-tasarim" },
  { label: "Şömine Rehberi", href: "/somine-rehberi" },
  { label: "Hizmet Bölgeleri", href: "/hizmet-bolgeleri" },
];
// Mobil panelde ek olarak gösterilenler.
const NAV_MOBILE_FIRST = [{ label: "Ana Sayfa", href: "/" }];
const NAV_MOBILE_EXTRA = [
  { label: "Hizmetler", href: "/hizmetler" },
  ...(FEATURES.projects ? [{ label: "Projeler", href: "/projeler" }] : []),
  { label: "Fabrika Showroom", href: "/fabrika-showroom" },
  { label: "İletişim", href: "/iletisim" },
];

/**
 * Site header'ı — açık taş zemin, solda logo, sağda menü + seçim rehberi CTA'sı.
 * - Üst bilgi bandı: Biwool markası mesajı + Tuzla showroom bağlantısı; kaydırınca kapanır.
 * - Koleksiyonlar: görselli kategori mega menüsü (hover + klavye focus-within).
 * - Mobil: tam ekran panel; bağlantılar sunucu HTML'inde gerçek <a> olarak bulunur (crawl edilebilir).
 */
export function HeaderBar({ companyName, logoUrl, phone, email, socials, categories }: Props) {
  const pathname = usePathname() || "/";
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

  // Sayfa değişince menüler kapanır; render sırasında önceki yolla karşılaştırılır.
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

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
  const productsActive = ["/urun", "/somine-modelleri", "/elektrikli-somineler", "/barbeku-modelleri"].some((p) => pathname.startsWith(p));

  // Modern menü başlığı: hover'da metin yukarı kayar, alttan bronz kopyası gelir; aktif sayfada bronz nokta.
  const linkClass = (active: boolean) =>
    `group/nl relative inline-flex h-full items-center gap-1.5 py-2 text-[14px] font-medium tracking-[-0.005em] whitespace-nowrap transition-colors duration-300 ${
      active ? "text-ink" : "text-steel hover:text-ink"
    } after:absolute after:bottom-[22px] after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-ember after:transition-[opacity,transform] after:duration-500 ${
      active ? "after:opacity-100" : "after:scale-0 after:opacity-0"
    }`;
  const rollLabel = (label: string) => (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-500 ease-(--ease-premium) group-hover/nl:-translate-y-full motion-reduce:transition-none">{label}</span>
      <span aria-hidden="true" className="absolute inset-0 translate-y-full text-ember-ink transition-transform duration-500 ease-(--ease-premium) group-hover/nl:translate-y-0 motion-reduce:transition-none">
        {label}
      </span>
    </span>
  );

  // Koleksiyonlar menüsü (referans tasarım): görselsiz başlık sütunları.
  const odunlu = categories.find((c) => c.slug === "odunlu-somineler") ?? categories[0];
  const outdoor = categories.find((c) => c.slug === "bahce-ve-tamamlayici-urunler");
  const isAccessory = (slug: string) => /aksesuar/.test(slug);
  const otherCollections = [
    ...categories.filter((c) => c !== odunlu && c !== outdoor).map((c) => ({ id: c.id, name: c.name, href: c.href })),
    ...(outdoor?.children.filter((c) => isAccessory(c.slug)) ?? []),
  ];
  const outdoorLinks = outdoor ? (outdoor.children.length ? outdoor.children.filter((c) => !isAccessory(c.slug)) : [{ id: outdoor.id, name: outdoor.name, href: outdoor.href }]) : [];
  const megaColumns: { title: string; links: { id: string; name: string; href: string }[] }[][] = [
    [{ title: odunlu?.name ?? "Odunlu şömineler", links: odunlu ? (odunlu.children.length ? odunlu.children : [{ id: odunlu.id, name: odunlu.name, href: odunlu.href }]) : [] }],
    [
      { title: "Diğer koleksiyonlar", links: otherCollections },
      ...(outdoorLinks.length ? [{ title: "Açık havada", links: outdoorLinks }] : []),
    ],
    [
      {
        title: "Projeniz için",
        links: [
          { id: "p1", name: "Mekâna özel tasarım", href: "/mekaniniza-ozel-tasarim" },
          { id: "p2", name: "Özel ölçü ve montaj", href: "/hizmetler" },
          { id: "p3", name: "Tuzla fabrika showroom", href: "/fabrika-showroom" },
          { id: "p4", name: "Teklif alın", href: "/teklif-al" },
        ],
      },
    ],
  ];
  const megaLink =
    "group/ml relative flex min-h-9 items-center gap-0 text-[15px] text-ink transition-[color,gap] duration-500 ease-(--ease-premium) hover:gap-3 hover:text-ember-ink focus-visible:gap-3";
  const megaDash = (
    <span aria-hidden="true" className="block h-px w-0 bg-ember transition-[width] duration-500 ease-(--ease-premium) group-hover/ml:w-4 group-focus-visible/ml:w-4" />
  );
  let megaIndex = 0;

  return (
    <>
      <a href="#icerik" className="sr-only z-[70] bg-ember px-4 py-3 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        İçeriğe geç
      </a>

      <header
        className={`sticky inset-x-0 top-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-500 ${
          open
            ? "border-sand bg-paper" // backdrop-filter fixed konumlu mobil paneli header'a hapseder → açıkken düz zemin
            : scrolled
              ? "border-sand bg-paper/95 shadow-[0_10px_30px_-24px_rgb(40_42_40/0.35)] backdrop-blur-md"
              : "border-sand bg-paper"
        }`}
      >
        {/* Üst bilgi bandı — marka mesajı + showroom; kaydırınca kapanır */}
        <div
          className={`overflow-hidden bg-anthracite text-[11px] tracking-[0.14em] text-white/75 uppercase transition-[max-height,opacity] duration-500 ${
            scrolled && !open ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
          }`}
        >
          <div className="shell flex h-9 items-center justify-center gap-6 sm:justify-between">
            <p className="truncate">
              Biwool markası<span className="hidden sm:inline"> · Kendi üretimimiz, kendi montaj ekibimiz</span>
            </p>
            <div className="hidden items-center gap-6 sm:flex">
              {phone ? (
                <a href={phone.href} className="hidden items-center gap-2 transition-colors hover:text-amber md:inline-flex">
                  <Phone aria-hidden="true" className="h-3.5 w-3.5 text-amber" />
                  <span className="tracking-[0.08em]">{phone.label}</span>
                </a>
              ) : null}
              <Link href="/fabrika-showroom" className="group inline-flex items-center gap-1.5 transition-colors hover:text-amber">
                İstanbul / Tuzla fabrika showroom
                <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="shell">
          <div className="flex h-[72px] items-center justify-between gap-6 lg:h-[88px]">
            <Link href="/" className="relative z-10 shrink-0" aria-label={`${companyName} ana sayfa`}>
              <Wordmark logoUrl={logoUrl} name={companyName} />
            </Link>

            <div className="hidden h-full min-w-0 items-center justify-end gap-6 lg:flex xl:gap-10">
              <nav aria-label="Ana menü" className="h-full">
                <ul className="flex h-full items-center gap-6 xl:gap-9">
                  <li className="group/mega h-full" onMouseEnter={() => setMegaDismissed(false)} onFocus={() => setMegaDismissed(false)}>
                    <Link href="/urunler" onClick={closeOnLinkClick} className={linkClass(productsActive)} aria-current={pathname === "/urunler" ? "page" : undefined}>
                      {rollLabel("Koleksiyonlar")}
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
                        <div className="border-y border-sand bg-white shadow-[0_30px_60px_-30px_rgb(40_42_40/0.3)]">
                          <div className="shell grid grid-cols-4 gap-10 py-10">
                            {/* Başlık sütunları; açılışta bağlantılar sırayla belirir. */}
                            {megaColumns.map((col, ci) => (
                              <div key={ci} className="space-y-7">
                                {col.map((group) => (
                                  <div key={group.title}>
                                    <p className="text-[12px] font-semibold tracking-[0.18em] text-ember-ink uppercase">{group.title}</p>
                                    <ul className="mt-3">
                                      {group.links.map((l) => (
                                        <li
                                          key={l.id}
                                          style={{ transitionDelay: `${60 + megaIndex++ * 35}ms` }}
                                          className="translate-y-2 opacity-0 transition-[opacity,translate] duration-500 ease-(--ease-premium) group-focus-within/mega:translate-y-0 group-focus-within/mega:opacity-100 group-hover/mega:translate-y-0 group-hover/mega:opacity-100"
                                        >
                                          <Link href={l.href} className={megaLink}>
                                            {megaDash}
                                            {l.name}
                                          </Link>
                                        </li>
                                      ))}
                                      {ci === 2 ? (
                                        <li>
                                          <button type="button" data-guide-open="" aria-haspopup="dialog" className={`${megaLink} cursor-pointer`}>
                                            {megaDash}
                                            <Sparkles aria-hidden="true" className="h-4 w-4 text-ember" /> Şömine seçim rehberi
                                          </button>
                                        </li>
                                      ) : null}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            ))}
                            <div className="flex flex-col">
                              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-bone">
                                {odunlu?.image ? (
                                  <Image src={odunlu.image} alt="" fill sizes="300px" className="object-cover transition-transform duration-[1.2s] ease-(--ease-premium) group-hover/mega:scale-[1.04]" />
                                ) : (
                                  <span className="ember-placeholder absolute inset-0" />
                                )}
                              </div>
                              <p className="mt-4 text-[14px] leading-relaxed text-steel">Malzemeden yerleşime, projenizi birlikte ele alalım.</p>
                              <div className="mt-5">
                                <ArrowFillButton href="/urunler" tone="ink" size="sm">
                                  Tüm koleksiyonlar
                                </ArrowFillButton>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </li>
                  {NAV_MAIN.map((item) => (
                    <li key={item.href} className="h-full">
                      <Link href={item.href} className={linkClass(isActive(item.href))} aria-current={isActive(item.href) ? "page" : undefined}>
                        {rollLabel(item.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <BeaconCta>Şöminenizi birlikte seçelim</BeaconCta>
            </div>

            <button
              type="button"
              className="-mr-2 flex h-12 w-12 items-center justify-center text-ink lg:hidden"
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
        <div id={panelId} hidden={!open} className="fixed inset-x-0 top-[108px] bottom-0 overflow-y-auto overscroll-contain border-t border-sand bg-paper lg:hidden">
          <nav aria-label="Mobil menü" onClick={closeOnLinkClick} className="shell flex min-h-full flex-col py-6">
            <ul className="divide-y divide-sand border-y border-sand">
              {NAV_MOBILE_FIRST.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={`flex min-h-14 items-center text-[15px] font-medium ${isActive(item.href) ? "text-ember-ink" : "text-ink"}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className={`flex min-h-14 w-full items-center justify-between text-[15px] font-medium ${productsActive ? "text-ember-ink" : "text-ink"}`}
                  aria-expanded={productsOpen}
                  onClick={() => setProductsOpen((v) => !v)}
                >
                  Koleksiyonlar
                  <ChevronDown aria-hidden="true" className={`h-5 w-5 transition-transform ${productsOpen ? "rotate-180" : ""}`} />
                </button>
                <ul hidden={!productsOpen} className="pb-4">
                  <li>
                    <Link href="/urunler" className="flex min-h-12 items-center text-[15px] font-semibold text-ember-ink">
                      Tüm koleksiyonlar
                    </Link>
                  </li>
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link href={c.href} className="flex min-h-12 items-center gap-3 text-[15px] text-ink">
                        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-bone">
                          {c.image ? <Image src={c.image} alt="" fill sizes="36px" className="object-cover" /> : <span className="ember-placeholder absolute inset-0" />}
                        </span>
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              {[...NAV_MAIN, ...NAV_MOBILE_EXTRA].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={`flex min-h-14 items-center text-[15px] font-medium ${isActive(item.href) ? "text-ember-ink" : "text-ink"}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-auto space-y-4 pt-10">
              <button
                type="button"
                data-guide-open=""
                aria-haspopup="dialog"
                onClick={() => setOpen(false)}
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-medium text-white"
              >
                <Sparkles aria-hidden="true" className="h-4 w-4 text-amber" /> Şöminenizi birlikte seçelim
              </button>
              <ArrowFillButton href="/teklif-al" tone="light" size="lg" fullWidth>
                Teklif Al
              </ArrowFillButton>
              <div className="space-y-1 pt-2 text-sm text-steel">
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
                          className="flex h-12 w-12 items-center justify-center rounded-full border border-sand text-ink"
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
