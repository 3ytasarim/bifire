import Image from "next/image";
import { Reveal } from "@/components/motion/Motion";
import { RichText } from "@/components/site/RichText";
import type { LocalContent } from "@/lib/local-content";

/**
 * Sayfaya özel içerik bölümü (Admin > Yerel İçerik). Ortak şablondan önce, sayfanın kendi bilgisini öne çıkarır:
 * açıklama + not (zengin metin) ve en fazla iki gerçek görsel (model: ürün fotoğrafı + teknik çizim;
 * bölge: uygulama fotoğrafları). Görseller sayfa HTML'inde gerçek <img> ve açıklayıcı alt metinle bulunur.
 */
export function LocalContentSection({
  content,
  id,
  eyebrow,
  title,
  noteTitle,
  fallbackAlt,
}: {
  content: LocalContent;
  id: string;
  eyebrow: string;
  title: string;
  noteTitle: string;
  fallbackAlt: string;
}) {
  const images = [
    content.image ? { url: content.image, alt: content.imageAlt || fallbackAlt } : null,
    content.image2 ? { url: content.image2, alt: content.image2Alt || fallbackAlt } : null,
  ].filter((x): x is { url: string; alt: string } => Boolean(x));
  const hasText = Boolean(content.intro || content.note);

  return (
    <section aria-labelledby={id} className="border-t border-sand bg-white py-16 sm:py-24">
      <div className={`shell grid gap-12 ${hasText && images.length ? "lg:grid-cols-2 lg:gap-16" : ""}`}>
        {hasText ? (
          <Reveal>
            <p className="eyebrow text-ember-ink">{eyebrow}</p>
            <h2 id={id} className="display-3 mt-5 text-balance">
              {title}
            </h2>
            {content.intro ? <RichText html={content.intro} className="mt-6 max-w-none text-steel" /> : null}
            {content.note ? (
              <div className="mt-8 rounded-2xl border border-linen bg-paper p-6">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">{noteTitle}</p>
                <RichText html={content.note} className="mt-3 max-w-none text-[16px] text-steel" />
              </div>
            ) : null}
          </Reveal>
        ) : (
          <h2 id={id} className="sr-only">
            {title}
          </h2>
        )}
        {images.length ? (
          <Reveal delay={0.1} className={`grid gap-4 ${!hasText && images.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {images.map((im) => (
              <figure key={im.url} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-bone">
                <Image src={im.url} alt={im.alt} fill sizes="(min-width: 1024px) 620px, 100vw" className="object-cover" />
              </figure>
            ))}
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
