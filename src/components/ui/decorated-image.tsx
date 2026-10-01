import Image from "next/image";
import type { LucideIcon } from "lucide-react";

/**
 * SYMC "DecoratedImage" (Greek Harmony deseni) Bifire uyarlaması: yuvarlak çerçeveli fotoğraf, ofset ateş turuncusu
 * çizgi, köşelerde yavaşça süzülen ikon rozetleri. Görsel yoksa sıcak açık yer tutucu.
 * Rozetler dekoratiftir (aria-hidden); hareket `prefers-reduced-motion` ile durur.
 */
export function DecoratedImage({
  src,
  alt,
  icons,
  aspect = "aspect-[4/5]",
  sizes = "(min-width: 1024px) 40vw, 100vw",
}: {
  src: string | null;
  alt: string;
  icons: LucideIcon[];
  aspect?: string;
  sizes?: string;
}) {
  const spots = ["-left-4 -top-5 animate-float", "-right-4 -top-5 animate-float-reverse", "-bottom-5 -right-4 animate-float", "-bottom-5 -left-4 animate-float-reverse"];
  return (
    <figure className="relative isolate mx-4 my-6">
      <span aria-hidden="true" className="absolute -inset-3 rounded-[2rem] border border-ember/45" />
      <span aria-hidden="true" className="absolute -inset-3 -z-10 translate-x-3 translate-y-3 rounded-[2rem] bg-gradient-to-br from-ember/20 to-transparent" />
      <div className={`relative overflow-hidden rounded-[1.5rem] bg-bone shadow-[0_30px_60px_-30px_rgb(12_12_13/0.35)] ${aspect}`}>
        {src ? (
          <Image src={src} alt={alt} fill sizes={sizes} className="object-cover transition-transform duration-700 ease-(--ease-premium) hover:scale-[1.02]" />
        ) : (
          <span aria-hidden="true" className="ember-placeholder absolute inset-0" />
        )}
      </div>
      {icons.slice(0, 4).map((Icon, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`absolute flex h-12 w-12 items-center justify-center rounded-2xl border border-ember/30 bg-white/95 text-ember-ink shadow-lg backdrop-blur sm:h-14 sm:w-14 ${spots[i]}`}
        >
          <Icon className="h-6 w-6" strokeWidth={1.6} />
        </span>
      ))}
    </figure>
  );
}
