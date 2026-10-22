"use client";

import Image from "next/image";
import { useState } from "react";
import { Expand } from "lucide-react";
import { Lightbox, type GalleryImage } from "./Lightbox";

/**
 * Ürün galerisi. Tüm görseller (ana + küçük resimler) SSR HTML'inde gerçek <img>, açıklayıcı alt ve
 * gerçek en/boy ile bulunur (Google Görseller). İlk görsel priority (LCP).
 */
export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const [changed, setChanged] = useState(false); // ilk görsel animasyonsuz (LCP), sonraki seçimler yumuşak geçişli
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (!images.length) {
    return <div aria-hidden="true" className="ember-placeholder aspect-[4/5] w-full rounded-[1.5rem]" />;
  }
  const main = images[active] ?? images[0]!;

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightbox(active)}
        className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-bone sm:aspect-[5/5]"
        aria-label={`${name} görselini büyüt`}
      >
        <Image
          key={main.url}
          src={main.url}
          alt={main.alt}
          fill
          priority={active === 0}
          sizes="(min-width: 1024px) 55vw, 100vw"
          className={`object-cover ${changed ? "animate-fade" : ""}`}
        />
        <span className="absolute right-4 bottom-4 flex h-11 w-11 items-center justify-center bg-bone/90 text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Expand aria-hidden="true" className="h-5 w-5" />
        </span>
      </button>
      {images.length > 1 ? (
        <ul className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5" aria-label="Ürün görselleri">
          {images.map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                onClick={() => {
                  setChanged(true);
                  setActive(i);
                }}
                aria-label={`${i + 1}. görseli göster`}
                aria-current={i === active ? "true" : undefined}
                className={`relative block aspect-square w-full overflow-hidden rounded-xl bg-bone outline-offset-2 transition-opacity ${i === active ? "ring-2 ring-ember" : "opacity-70 hover:opacity-100"}`}
              >
                <Image src={img.url} alt={img.alt} fill sizes="120px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <Lightbox images={images} index={lightbox} onIndex={setLightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}
