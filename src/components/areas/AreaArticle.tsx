import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { Reveal } from "@/components/motion/Motion";
import type { AreaSection } from "@/content/service-areas";
import { AreaToc } from "./AreaToc";

/** Bölüm başlığından kararlı bağlantı kimliği ("#keşif-ve-uygulama…" yerine kısa ascii). */
const anchor = (i: number) => `bolum-${i + 1}`;

/**
 * İl/ilçe sayfası içerik gövdesi: solda yapışkan içindekiler (okunan bölüm vurgulu) + ek kutu, sağda numaralı
 * bölüm kartları (paragraf + madde listesi). Kartlar görünüme girerken belirir; hover'da alt çizgi dolar.
 */
export function AreaArticle({ sections, aside, labelledBy }: { sections: AreaSection[]; aside?: ReactNode; labelledBy?: string }) {
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="hidden lg:col-span-4 lg:block">
        <div className="sticky top-32 space-y-10">
          <AreaToc items={sections.map((s, i) => ({ id: anchor(i), title: s.title }))} />
          {aside}
        </div>
      </div>
      <ol aria-labelledby={labelledBy} className="space-y-4 lg:col-span-8">
        {sections.map((s, i) => (
          <li key={s.title} id={anchor(i)} className="scroll-mt-32">
            <Reveal y={18}>
              <article className="group relative overflow-hidden rounded-[1.5rem] border border-linen bg-white p-7 transition-shadow duration-500 hover:shadow-[0_24px_48px_-28px_rgb(12_12_13/0.35)] sm:p-9">
                <span aria-hidden="true" className="absolute top-6 right-7 font-display text-5xl leading-none font-semibold tracking-[-0.04em] text-sand transition-colors duration-500 group-hover:text-ember/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-ember transition-transform duration-700 ease-(--ease-premium) group-hover:scale-x-100" />
                <h3 className="max-w-[85%] font-display text-xl font-semibold text-ink sm:text-2xl">{s.title}</h3>
                <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-steel">
                  {s.paras.map((p) => (
                    <p key={p.slice(0, 48)}>{p}</p>
                  ))}
                </div>
                {s.bullets.length ? (
                  <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {s.bullets.map((b) => (
                      <li key={b.slice(0, 48)} className="flex gap-3 rounded-xl bg-paper p-3.5 text-[14px] leading-relaxed text-ink">
                        <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                        {b}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
      {aside ? <div className="lg:hidden">{aside}</div> : null}
    </div>
  );
}
