import Link from "next/link";
import type { Crumb } from "@/lib/seo/json-ld";

/** Görünür breadcrumb. Aynı `items` dizisi sayfada BreadcrumbList JSON-LD'ye de verilir (tek kaynak). */
export function Breadcrumbs({ items, tone = "dark" }: { items: Crumb[]; tone?: "dark" | "light" }) {
  const muted = tone === "light" ? "text-white/55 hover:text-white" : "text-steel hover:text-ink";
  const current = tone === "light" ? "text-white" : "text-ink";
  return (
    <nav aria-label="Sayfa konumu">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium tracking-[0.08em] uppercase">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className={`${current} line-clamp-1`}>
                  {c.name}
                </span>
              ) : (
                <>
                  <Link href={c.path} className={`${muted} transition-colors`}>
                    {c.name}
                  </Link>
                  <span aria-hidden="true" className="text-ember">
                    /
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
