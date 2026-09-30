"use client";

import Image from "next/image";
import { useState } from "react";
import { Lightbox, type GalleryImage } from "./Lightbox";

/** Proje galerisi: editoryal grid (her 3. görsel geniş), tıklayınca lightbox. */
export function ImageGrid({ images }: { images: GalleryImage[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!images.length) return null;
  return (
    <>
      <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {images.map((img, i) => (
          <li key={img.url} className={i % 3 === 0 ? "sm:col-span-2" : ""}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Görseli büyüt: ${img.alt}`}
              className={`zoom-media group relative block w-full bg-linen ${i % 3 === 0 ? "aspect-[16/9]" : "aspect-[4/3]"}`}
            >
              <Image src={img.url} alt={img.alt} fill sizes={i % 3 === 0 ? "(min-width: 1480px) 1400px, 100vw" : "(min-width: 640px) 50vw, 100vw"} className="object-cover" />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox images={images} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
