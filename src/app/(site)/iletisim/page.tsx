import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { WhatsappIcon } from "@/components/site/Icons";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { RequestForm } from "@/components/site/RequestForm";
import { routes } from "@/lib/catalog";
import { getFormOptions } from "@/lib/queries";
import { getSiteSettings, telHref, whatsappHref } from "@/lib/settings";
import { breadcrumbNode, graph, ids, webPageNode } from "@/lib/seo/json-ld";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { STATIC_PAGES } from "@/lib/seo/static-pages";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("iletisim");
}

const CRUMBS = [
  { name: "Ana Sayfa", path: "/" },
  { name: "İletişim", path: routes.contact },
];

/** Yalnızca Google Maps embed adresine izin verilir (admin alanına rastgele iframe kaynağı girilemez). */
function safeMapEmbed(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && /(^|\.)google\.[a-z.]+$/.test(u.hostname) && u.pathname.startsWith("/maps/embed") ? u.toString() : null;
  } catch {
    return null;
  }
}

export default async function ContactPage() {
  const [s, [categories, products]] = await Promise.all([getSiteSettings(), getFormOptions()]);
  const wa = whatsappHref(s);
  const map = safeMapEmbed(s.mapsEmbedUrl);
  const items = [
    s.phone && { icon: Phone, label: "Telefon", value: s.phone, href: telHref(s.phone) },
    wa && { icon: WhatsappIcon, label: "WhatsApp", value: "Mesaj gönderin", href: wa, external: true },
    s.email && { icon: Mail, label: "E-posta", value: s.email, href: `mailto:${s.email}` },
    s.address && { icon: MapPin, label: "Adres", value: s.address, href: s.mapsUrl ?? undefined, external: true },
    s.workingHours && { icon: Clock, label: "Çalışma saatleri", value: s.workingHours },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string; external?: boolean }[];

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path: routes.contact, name: "İletişim", description: STATIC_PAGES.iletisim.defaults.description, type: "ContactPage", hasBreadcrumb: true, mainEntityId: ids.organization() }),
          breadcrumbNode(routes.contact, CRUMBS),
        )}
      />
      <PageHero crumbs={CRUMBS} eyebrow="İletişim" title="Şömine projenizi konuşalım." intro="Ürün, keşif ve teklif talepleriniz için formu doldurun ya da doğrudan bize ulaşın." />

      <section className="bg-paper py-16 sm:py-24">
        <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <h2 className="display-3">İletişim bilgileri</h2>
            {items.length ? (
              <ul className="mt-8 border-t border-sand">
                {items.map((it) => {
                  const Icon = it.icon;
                  const body = (
                    <>
                      <Icon className="mt-1 h-5 w-5 shrink-0 text-ember" />
                      <span>
                        <span className="block text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">{it.label}</span>
                        <span className="mt-1 block text-[17px] font-medium text-ink">{it.value}</span>
                      </span>
                    </>
                  );
                  return (
                    <li key={it.label} className="border-b border-sand">
                      {it.href ? (
                        <a href={it.href} {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="flex gap-4 py-6 transition-colors hover:text-ember-ink">
                          {body}
                        </a>
                      ) : (
                        <div className="flex gap-4 py-6">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-6 text-steel">İletişim bilgilerimiz kısa süre içinde eklenecek. Formu kullanarak bize hemen ulaşabilirsiniz.</p>
            )}
          </div>
          <div className="lg:col-span-7">
            <h2 className="display-3">Mesaj gönderin</h2>
            <div className="mt-8">
              <RequestForm type="CONTACT" categories={categories} products={products} sourcePath={routes.contact} />
            </div>
          </div>
        </div>
      </section>

      {map ? (
        <section aria-label="Harita" className="bg-bone">
          <iframe
            src={map}
            title={`${s.companyName} konum haritası`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-[420px] w-full border-0 grayscale-[0.4]"
          />
        </section>
      ) : null}
    </>
  );
}
