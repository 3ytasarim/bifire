import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { CountUp, GrowLine, Reveal, Stagger, StaggerItem } from "@/components/motion/Motion";
import { ArticleNav } from "@/components/site/ArticleNav";
import { FaqList } from "@/components/site/FaqList";
import { GuideInvite } from "@/components/site/GuideInvite";
import { RichText } from "@/components/site/RichText";
import { extractFaq, isFaqTitle, splitHtmlSections } from "@/lib/html-sections";

const GUIDE_TITLE = /rehber(i|in)den ilgili/i;

/** Bölüm gövdesini H3 alt başlıklarına böler: başlık öncesi metin + alt başlık kartları. */
function subParts(html: string) {
  const parts = html.split(/<h3>([\s\S]*?)<\/h3>/);
  const intro = (parts[0] ?? "").trim();
  const subs: { title: string; html: string }[] = [];
  for (let i = 1; i < parts.length; i += 2) subs.push({ title: (parts[i] ?? "").replace(/<[^>]+>/g, "").trim(), html: (parts[i + 1] ?? "").trim() });
  return { intro, subs };
}

/**
 * Kategori ve hizmet sayfalarının uzun SEO metni (Admin'deki zengin metin). Giriş bandı (bölüm/soru/okuma süresi),
 * okuma ilerlemeli içindekiler (masaüstü cam kart, mobilde yapışkan çipler), her bölüm cam kart; H3 alt başlıklar
 * kart ızgarası. SSS akordeon, "Şömine Rehberinden ilgili içerikler" bağlantı kartları. Metnin tamamı SSR HTML'indedir;
 * FAQPage şeması sayfada `extractFaq` ile aynı içerikten üretilir.
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
  const words = (html ?? "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const stats = [
    { value: body.length, label: "bölüm" },
    { value: faqs.length, label: "soru-cevap" },
    { value: Math.max(1, Math.round(words / 200)), label: "dk okuma" },
  ].filter((s) => s.value);

  return (
    <>
      <section aria-label={`${name} hakkında`} className="relative border-t border-sand bg-bone">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="absolute -top-48 -right-40 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgb(146_113_78/0.16),transparent_65%)] motion-safe:animate-[pulse_7s_ease-in-out_infinite]" />
          <span className="absolute top-[40%] -left-56 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgb(146_113_78/0.08),transparent_65%)]" />
        </div>

        {/* Giriş bandı */}
        <div className="shell relative pt-16 sm:pt-24">
          <Reveal className="relative overflow-hidden rounded-[2rem] bg-ink p-7 text-white sm:p-10 lg:p-14">
            <span aria-hidden="true" className="pointer-events-none absolute -right-24 -bottom-32 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgb(146_113_78/0.35),transparent_65%)]" />
            <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="eyebrow text-ember">{name} rehberi</p>
                {lead ? <RichText html={lead} className="mt-6 [--tw-prose-body:rgb(255_255_255/0.82)] [&_p]:text-[17px] [&_p]:leading-relaxed sm:[&_p]:text-[19px]" /> : null}
              </div>
              <ul className="grid grid-cols-3 gap-3 lg:col-span-4">
                {stats.map((s) => (
                  <li key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                    <CountUp value={s.value} className="block font-display text-3xl font-semibold text-white sm:text-4xl" />
                    <span className="mt-1 block text-[12px] tracking-[0.08em] text-white/60">{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <div className="shell relative grid grid-cols-1 gap-8 pt-10 pb-16 sm:pb-24 lg:grid-cols-12 lg:gap-12 lg:pt-14">
          <aside className="min-w-0 lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <ArticleNav items={toc} target="makale" />
            </div>
          </aside>

          <div id="makale" className="min-w-0 space-y-6 lg:col-span-8 [&_h2]:scroll-mt-40 lg:[&_h2]:scroll-mt-32">
            {body.map((s, i) => {
              const { intro, subs } = subParts(s.html);
              return (
                <Reveal key={s.title} className="article-card group relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/70 p-6 shadow-[0_30px_60px_-45px_rgb(40_42_40/0.45)] backdrop-blur-xl transition-[border-color,box-shadow] duration-500 hover:border-ember/40 hover:shadow-[0_40px_70px_-45px_rgb(146_113_78/0.55)] sm:p-9 lg:p-10">
                  <GrowLine className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-ember via-ember/50 to-transparent" />
                  <span aria-hidden="true" className="pointer-events-none absolute -top-6 -right-2 font-display text-[5rem] leading-none font-bold text-transparent transition-transform duration-700 [-webkit-text-stroke:1.5px_rgb(146_113_78/0.16)] group-hover:-translate-x-2 sm:text-[9rem]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 id={`bolum-${i + 1}`} className="relative flex items-start gap-4 pr-14 font-display text-[1.5rem] leading-snug font-semibold text-balance text-ink sm:text-3xl">
                    <span aria-hidden="true" className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ember text-[13px] font-semibold text-white tabular-nums sm:mt-1">
                      {i + 1}
                    </span>
                    {s.title}
                  </h2>
                  {subs.length >= 2 ? (
                    <>
                      {intro ? <RichText html={intro} className="relative mt-5" /> : null}
                      <Stagger as="ul" className="relative mt-6 grid gap-4 sm:grid-cols-2">
                        {subs.map((sub) => (
                          <StaggerItem key={sub.title} className="h-full sm:last:odd:col-span-2">
                            <div className="flex h-full flex-col rounded-2xl border border-linen bg-paper/80 p-5 transition-colors duration-300 hover:border-ember/50 sm:p-6">
                              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-ember shadow-[0_0_0_6px_rgb(146_113_78/0.15)]" />
                              <h3 className="mt-4 font-display text-lg leading-snug font-semibold text-ink">{sub.title}</h3>
                              <RichText html={sub.html} className="mt-2 [&_p]:text-[15px] [&_p]:leading-relaxed" />
                            </div>
                          </StaggerItem>
                        ))}
                      </Stagger>
                    </>
                  ) : (
                    <RichText html={s.html} className="relative mt-5" />
                  )}
                </Reveal>
              );
            })}
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

      <GuideInvite />

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
                    className="group flex h-full flex-col justify-between gap-8 rounded-[1.4rem] border border-linen bg-paper p-6 transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-0.5 hover:border-ember hover:shadow-[0_24px_48px_-30px_rgb(146_113_78/0.55)] sm:p-7"
                  >
                    <BookOpen aria-hidden="true" className="h-5 w-5 text-ember-ink" />
                    <span className="flex items-end justify-between gap-4">
                      <span className="font-display text-lg leading-snug font-semibold text-ink">{g.title}</span>
                      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-colors duration-500 group-hover:bg-ember group-hover:text-white">
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
