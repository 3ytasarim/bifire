import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Sunucu tarafı sayfalama bağlantıları (?sayfa=2). Sayfa 1 her zaman parametresiz URL. */
export function Pagination({ basePath, page, pages }: { basePath: string; page: number; pages: number }) {
  if (pages <= 1) return null;
  const href = (n: number) => (n <= 1 ? basePath : `${basePath}?sayfa=${n}`);
  return (
    <nav aria-label="Sayfalama" className="mt-16 flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" aria-label="Önceki sayfa" className="flex h-12 w-12 items-center justify-center border border-sand hover:border-ink">
          <ChevronLeft className="h-5 w-5" />
        </Link>
      ) : null}
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? "page" : undefined}
          className={`flex h-12 min-w-12 items-center justify-center border px-3 text-sm font-semibold ${n === page ? "border-ink bg-ink text-bone" : "border-sand hover:border-ink"}`}
        >
          {n}
        </Link>
      ))}
      {page < pages ? (
        <Link href={href(page + 1)} rel="next" aria-label="Sonraki sayfa" className="flex h-12 w-12 items-center justify-center border border-sand hover:border-ink">
          <ChevronRight className="h-5 w-5" />
        </Link>
      ) : null}
    </nav>
  );
}
