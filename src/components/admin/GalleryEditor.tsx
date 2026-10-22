"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import { useMarkDirty } from "./AdminForm";
import { MediaLibrary } from "./MediaLibrary";

export type GalleryItem = { url: string; alt: string; variant?: string };

/**
 * Çoklu görsel (galeri): yükle/kütüphaneden seç, sırala, alt metin gir. Değer `name` gizli alanında JSON.
 * `withVariant`: her görsele seçenek eşleşmesi alanı (ölçü çizimleri için; boşsa tüm modellerde gösterilir).
 */
export function GalleryEditor({ name, defaultValue, nameHint, withVariant, emptyText = "Galeride görsel yok." }: { name: string; defaultValue: GalleryItem[]; nameHint?: string; withVariant?: boolean; emptyText?: string }) {
  const [items, setItemsState] = useState<GalleryItem[]>(defaultValue);
  const [open, setOpen] = useState(false);
  const markDirty = useMarkDirty();
  const setItems = (fn: (prev: GalleryItem[]) => GalleryItem[]) => {
    setItemsState(fn);
    markDirty();
  };
  const move = (i: number, d: number) =>
    setItems((prev) => {
      const next = [...prev];
      const j = i + d;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.length ? (
        <ul className="space-y-3">
          {items.map((it, i) => (
            <li key={`${it.url}-${i}`} className="flex gap-3 border border-neutral-200 bg-white p-2">
              <div className="relative h-20 w-28 shrink-0 bg-neutral-100">
                <Image src={it.url} alt={it.alt} fill sizes="112px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <label className="block text-xs text-neutral-500" htmlFor={`${name}-alt-${i}`}>
                  Alt metin
                </label>
                <input
                  id={`${name}-alt-${i}`}
                  value={it.alt}
                  maxLength={250}
                  onChange={(e) => setItems((prev) => prev.map((x, n) => (n === i ? { ...x, alt: e.target.value } : x)))}
                  className="mt-1 block min-h-10 w-full border border-neutral-300 px-2 text-sm outline-none focus:border-ink"
                />
                {withVariant ? (
                  <>
                    <label className="mt-2 block text-xs text-neutral-500" htmlFor={`${name}-variant-${i}`}>
                      Seçenek (ops.) — ör. <code>{"Seri 01 / 90'lık"}</code> veya <code>{"90'lık"}</code>; boşsa tüm modellerde
                    </label>
                    <input
                      id={`${name}-variant-${i}`}
                      value={it.variant ?? ""}
                      maxLength={80}
                      onChange={(e) => setItems((prev) => prev.map((x, n) => (n === i ? { ...x, variant: e.target.value } : x)))}
                      className="mt-1 block min-h-10 w-full border border-neutral-300 px-2 text-sm outline-none focus:border-ink"
                    />
                  </>
                ) : null}
              </div>
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Yukarı taşı" className="flex h-8 w-8 items-center justify-center hover:bg-neutral-100 disabled:opacity-30">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Aşağı taşı" className="flex h-8 w-8 items-center justify-center hover:bg-neutral-100 disabled:opacity-30">
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
              <button type="button" onClick={() => setItems((prev) => prev.filter((_, n) => n !== i))} aria-label="Görseli kaldır" className="flex w-10 items-center justify-center text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500">{emptyText}</p>
      )}
      <button type="button" onClick={() => setOpen(true)} className="mt-3 inline-flex min-h-10 items-center gap-2 border border-neutral-300 bg-white px-3 text-sm hover:border-ink">
        <ImagePlus aria-hidden="true" className="h-4 w-4" /> Görsel ekle
      </button>
      <MediaLibrary
        open={open}
        multiple
        nameHint={nameHint}
        onClose={() => setOpen(false)}
        onSelect={(sel) => setItems((prev) => [...prev, ...sel.filter((m) => !prev.some((p) => p.url === m.url)).map((m) => ({ url: m.url, alt: m.alt ?? "" }))])}
      />
    </div>
  );
}
