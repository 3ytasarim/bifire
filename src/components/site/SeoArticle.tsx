import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { AreaToc } from "@/components/areas/AreaToc";
import { Reveal } from "@/components/motion/Motion";
import { FaqList } from "@/components/site/FaqList";
import { RichText } from "@/components/site/RichText";
import { extractFaq, isFaqTitle, splitHtmlSections } from "@/lib/html-sections";

const GUIDE_TITLE = /rehber(i|in)den ilgili/i;

/**
 * Kategori ve hizmet sayfalarının uzun SEO metni (Admin'deki zengin metin): sabit içindekiler menüsü + bölümler,
 * SSS bölümü akordeon olarak, "Şömine Rehberinden ilgili içerikler" listesi bağlantı kartları olarak gösterilir.
 * Metnin tamamı SSR HTML'indedir; FAQPage şeması sayfada `extractFaq` ile aynı içerikten üretilir.
 */
export function SeoArticle({ html, name }: { html: string | null | undefined; name: string }) {
  const { lead, sections } = splitHtmlSections(html);
  if (!lead && !sections.length) return null;

  const faqSection = sections.find((s) => isFaqTitle(s.title));
  const guideSection = sections.find((s) => GUIDE_TITLE.test(s.title));
  const body = sections.filter((s) => s !== faqSection && s !== guideSection);
  const faqs = extractFaq(html);
  const guides = guideSection ? [...guideSection.html.matchAll(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => ({ href: m[1]!, title: m[2]!.replace(/<[^>]+>/g, "") })) : [];

  const toc = body.map((s, i) => ({ id: `bolum-${i + 1}`, title: s.title }));
  if (faqs.length) toc.push({ id: "sss", title: "Sık sorulan sorular" });

  return (
    <>
      <section aria-label={`${name} hakkında`} className="relative overflow-hidden border-t border-sand bg-bone py-16 sm:py-24">
        <span aria-hidden="true" className="pointer-events-none absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.10),transparent_65%)]" />
        <div className="shell relative grid gap-12 lg:grid-cols-12">
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-32 rounded-2xl border border-white/70 bg-white/60 p-6 shadow-[0_24px_48px_-36px_rgb(12_12_13/0.35)] backdrop-blur-xl">
              <AreaToc items={toc} />
            </div>
          </aside>
          <div className="min-w-0 lg:col-span-8 [&_h2]:scroll-mt-32">
            <p className="eyebrow text-ember-ink">{name} rehberi</p>
            {lead ? <RichText html={lead} className="mt-6 [&_p]:text-[18px]" /> : null}
            {body.map((s, i) => (
              <Reveal key={s.title} className={i ? "mt-12 border-t border-sand pt-10" : "mt-12"}>
                <h2 id={`bolum-${i + 1}`} className="flex items-baseline gap-4 font-display text-2xl leading-snug font-semibold text-balance text-ink sm:text-3xl">
                  <span aria-hidden="true" className="text-[13px] font-semibold tracking-[0.2em] text-ember-ink tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.title}
                </h2>
                <RichText html={s.html} className="mt-5" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {faqs.length ? (
        <section aria-labelledby="sss" className="bg-paper py-16 sm:py-24">
          <div className="shell grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow text-ember-ink">Sık sorulanlar</p>
              <h2 id="sss" className="display-3 mt-5 scroll-mt-32 text-balance">
                {faqSection?.title ?? "Sık sorulan sorular"}
              </h2>
            </div>
            <FaqList items={faqs} className="lg:col-span-8" />
          </div>
        </section>
      ) : null}

      {guides.length ? (
        <section aria-labelledby="ilgili-rehber" className="border-t border-sand bg-white py-16 sm:py-20">
          <div className="shell">
            <p className="eyebrow text-ember-ink">Şömine Rehberi</p>
            <h2 id="ilgili-rehber" className="display-3 mt-5">
              {guideSection?.title}
            </h2>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((g) => (
                <li key={g.href}>
                  <Link
                    href={g.href}
                    className="group flex h-full flex-col justify-between gap-8 rounded-[1.4rem] border border-linen bg-paper p-6 transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-0.5 hover:border-ember hover:shadow-[0_24px_48px_-30px_rgb(224_105_31/0.55)] sm:p-7"
                  >
                    <BookOpen aria-hidden="true" className="h-5 w-5 text-ember-ink" />
                    <span className="flex items-end justify-between gap-4">
                      <span className="font-display text-lg leading-snug font-semibold text-ink">{g.title}</span>
                      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-colors duration-500 group-hover:bg-ember group-hover:text-ink">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
