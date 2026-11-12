"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Cookie, X } from "lucide-react";
import { routes } from "@/lib/catalog";
import { CONSENT_OPEN_EVENT, CONSENT_STORAGE_KEY, CONSENT_VERSION, type ConsentChoice } from "@/lib/consent";

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };

function readChoice(): ConsentChoice | null {
  try {
    const c = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) ?? "null") as ConsentChoice | null;
    return c && c.v === CONSENT_VERSION ? c : null;
  } catch {
    return null;
  }
}

function applyChoice(c: ConsentChoice) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(c));
  } catch {
    /* gizli sekme: tercih yalnız bu oturumda geçerli */
  }
  const w = window as GtagWindow;
  const a = c.analytics ? "granted" : "denied";
  const m = c.marketing ? "granted" : "denied";
  w.gtag?.("consent", "update", { analytics_storage: a, ad_storage: m, ad_user_data: m, ad_personalization: m });
  w.dataLayer?.push({ event: "cerez_tercihi_guncellendi", cerez_analitik: c.analytics, cerez_pazarlama: c.marketing });
}

const CATEGORIES = [
  { key: "necessary", title: "Zorunlu çerezler", text: "Sitenin güvenli ve doğru çalışması için gereklidir; kapatılamaz.", locked: true },
  { key: "analytics", title: "Analitik çerezler", text: "Ziyaretlerin nasıl gerçekleştiğini anonim olarak ölçmemize ve siteyi geliştirmemize yardımcı olur (Google Analytics)." },
  { key: "marketing", title: "Pazarlama çerezleri", text: "Reklamların ilgi alanınıza uygun gösterilmesi ve kampanya ölçümü için kullanılır." },
] as const;

/**
 * KVKK çerez onayı: sol altta, site renginde (bronz/taş) kompakt pencere. Kişisel Verileri Koruma Kurumu çerez
 * rehberine uygun: zorunlu dışı çerezler açık rıza olmadan çalışmaz, "Reddet" "Kabul et" kadar kolaydır, tercih
 * kategori bazında verilir ve footer'daki "Çerez Tercihleri" ile her zaman değiştirilebilir.
 */
export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false });
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Tercih kaydı yoksa pencere sayfa çizildikten sonra açılır (LCP'yi etkilemez); kayıt varsa hiç açılmaz.
    const first = window.setTimeout(() => {
      if (!readChoice()) setOpen(true);
    }, 0);
    const reopen = () => {
      const c = readChoice();
      if (c) setPrefs({ analytics: c.analytics, marketing: c.marketing });
      setDetails(true);
      setOpen(true);
      requestAnimationFrame(() => panelRef.current?.focus());
    };
    const onClick = (e: MouseEvent) => {
      const t = (e.target as Element | null)?.closest?.("[data-consent-open]");
      if (t) {
        e.preventDefault();
        reopen();
      }
    };
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    document.addEventListener("click", onClick);
    return () => {
      window.clearTimeout(first);
      window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const save = useCallback((analytics: boolean, marketing: boolean) => {
    applyChoice({ v: CONSENT_VERSION, analytics, marketing, at: new Date().toISOString() });
    setPrefs({ analytics, marketing });
    setOpen(false);
    setDetails(false);
  }, []);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="cookie-consent fixed inset-x-3 bottom-[5.5rem] z-50 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-2xl border border-sand bg-paper/95 text-ink shadow-[0_24px_60px_-20px_rgb(40_42_40/0.45)] outline-none backdrop-blur-xl sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[400px]"
    >
      {/* Üstte ince bronz şerit: sitenin metalik bronz düğme tonları */}
      <span aria-hidden="true" className="bronze-metal block h-1 w-full rounded-t-2xl" />
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className="bronze-metal flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#fbfaf7]">
            <Cookie className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-ember-ink uppercase">KVKK · Çerez tercihleri</p>
            <h2 id={titleId} className="mt-1 font-display text-[18px] leading-snug font-medium tracking-[-0.01em]">
              Gizliliğinize önem veriyoruz
            </h2>
          </div>
          {details ? (
            <button type="button" onClick={() => (readChoice() ? setOpen(false) : setDetails(false))} aria-label="Ayrıntıları kapat" className="-mt-1 -mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-steel transition-colors hover:bg-bone hover:text-ink">
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <p className="mt-3 text-[13.5px] leading-relaxed text-steel">
          Sitemizin çalışması için zorunlu çerezleri kullanıyoruz. Onayınızla, ziyaretleri ölçmek ve deneyimi geliştirmek için analitik ve pazarlama çerezlerini de kullanırız. Ayrıntılar:{" "}
          <Link href={routes.cookies} className="font-medium text-ember-ink underline decoration-sand underline-offset-2 hover:decoration-ember">
            Çerez Politikası
          </Link>{" "}
          ve{" "}
          <Link href={routes.kvkk} className="font-medium text-ember-ink underline decoration-sand underline-offset-2 hover:decoration-ember">
            KVKK Aydınlatma Metni
          </Link>
          .
        </p>

        {details ? (
          <ul className="mt-4 divide-y divide-sand overflow-hidden rounded-xl border border-sand bg-white">
            {CATEGORIES.map((c) => {
              const locked = "locked" in c;
              const checked = locked ? true : prefs[c.key as "analytics" | "marketing"];
              const id = `cerez-${c.key}`;
              return (
                <li key={c.key} className="flex items-start gap-3 p-3.5">
                  <div className="min-w-0 flex-1">
                    <label htmlFor={id} className="block text-[14px] font-medium text-ink">
                      {c.title}
                      {locked ? <span className="ml-2 text-[11px] font-semibold tracking-[0.08em] text-ember-ink uppercase">Her zaman açık</span> : null}
                    </label>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-steel">{c.text}</p>
                  </div>
                  <button
                    id={id}
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    disabled={locked}
                    onClick={() => setPrefs((p) => ({ ...p, [c.key]: !p[c.key as "analytics" | "marketing"] }))}
                    className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${checked ? "bronze-metal" : "bg-sand"}`}
                  >
                    <span className="sr-only">{c.title}</span>
                    <span aria-hidden="true" className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ease-(--ease-premium) ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        {/* Reddet ve Kabul et eşit ağırlıkta (Kurul rehberi: reddetmek kabul etmek kadar kolay olmalı). */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button type="button" onClick={() => save(false, false)} className="min-h-12 rounded-full border border-sand bg-white px-4 text-[14px] font-semibold text-ink transition-colors hover:border-ink">
            Tümünü Reddet
          </button>
          <button type="button" onClick={() => save(true, true)} className="bronze-metal min-h-12 rounded-full px-4 text-[14px] font-semibold text-[#fbfaf7] transition-[filter] hover:brightness-110">
            Tümünü Kabul Et
          </button>
        </div>
        {details ? (
          <button type="button" onClick={() => save(prefs.analytics, prefs.marketing)} className="mt-2.5 min-h-12 w-full rounded-full bg-ink px-4 text-[14px] font-semibold text-white transition-colors hover:bg-ember-ink">
            Seçimlerimi Kaydet
          </button>
        ) : (
          <button type="button" onClick={() => setDetails(true)} className="mt-2 inline-flex min-h-11 w-full items-center justify-center text-[13.5px] font-medium text-steel underline decoration-sand underline-offset-4 transition-colors hover:text-ink hover:decoration-ember">
            Tercihleri yönet
          </button>
        )}
      </div>
    </div>
  );
}
