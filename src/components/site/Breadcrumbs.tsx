import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Crumb } from "@/lib/seo/json-ld";

/** Görünür breadcrumb. Aynı `items` dizisi sayfada BreadcrumbList JSON-LD'ye de verilir (tek kaynak). */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Sayfa konumu">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-steel">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="line-clamp-1 font-medium text-ink">
                  {c.name}
                </span>
              ) : (
                <>
                  <Link href={c.path} className="transition-colors hover:text-ember-ink">
                    {c.name}
                  </Link>
                  <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-stone" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
