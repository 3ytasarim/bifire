"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Public sayfalarda beklenmeyen sunucu hatası: boş ekran yerine anlaşılır mesaj + yeniden dene. */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") console.error(error);
  }, [error]);

  return (
    <section className="bg-paper py-32">
      <div className="shell max-w-2xl">
        <p className="eyebrow text-ember-ink">Bir sorun oluştu</p>
        <h1 className="display-2 mt-5">Sayfa şu an yüklenemedi.</h1>
        <p className="lead mt-6 text-steel">Geçici bir hata olabilir. Lütfen tekrar deneyin; sorun sürerse bizimle iletişime geçin.</p>
        {error.digest ? <p className="mt-4 text-sm text-stone">Hata kodu: {error.digest}</p> : null}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="btn btn-dark">
            Tekrar dene
          </button>
          <Link href="/" className="btn btn-ghost-dark">
            Ana sayfa
          </Link>
        </div>
      </div>
    </section>
  );
}
