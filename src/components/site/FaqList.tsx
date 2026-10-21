import { Plus } from "lucide-react";

/**
 * SSS akordeonu (yerel <details>: JS'siz çalışır, klavye/ekran okuyucu uyumlu). Cevaplar SSR HTML'inde
 * bulunur — arama motorları ve AI asistanları içeriği görür. FAQPage şeması sayfada `faqNode` ile verilir.
 */
export function FaqList({ items, className = "" }: { items: { q: string; a: string }[]; className?: string }) {
  if (!items.length) return null;
  return (
    <div className={`divide-y divide-linen border-y border-linen ${className}`}>
      {items.map((it, i) => (
        <details key={it.q} className="group" open={i === 0}>
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-display text-lg font-semibold text-ink outline-offset-4 [&::-webkit-details-marker]:hidden">
            {it.q}
            <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-linen text-ember-ink transition-transform duration-300 group-open:rotate-45">
              <Plus className="h-4 w-4" />
            </span>
          </summary>
          <p className="max-w-3xl pb-6 text-[16px] leading-relaxed text-steel">{it.a}</p>
        </details>
      ))}
    </div>
  );
}
