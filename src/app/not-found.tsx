import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: { absolute: "Sayfa bulunamadı | Bifire" },
  robots: { index: false, follow: true },
};

/**
 * Global 404 (HTTP 404 döner). Silinmiş/pasif ürün, kategori, proje ve blog URL'leri notFound() ile buraya düşer.
 * Kök seviyede olduğu için site header'ı yok; kullanıcıyı en olası hedeflere yönlendirir.
 */
export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-ink text-white">
      <span aria-hidden="true" className="ember-placeholder absolute inset-0 -z-10 opacity-70" />
      <div className="shell py-24">
        <Link href="/" className="font-display text-xl font-semibold tracking-[0.34em]">
          BİFİRE
        </Link>
        <p className="mt-16 font-display text-[7rem] leading-none font-semibold tracking-[-0.05em] text-white/10 sm:text-[11rem]">404</p>
        <h1 className="display-2 -mt-6 max-w-2xl sm:-mt-10">Aradığınız sayfa sönmüş olabilir.</h1>
        <p className="lead mt-6 max-w-xl text-white/70">
          Sayfa taşınmış, kaldırılmış ya da adres hatalı yazılmış olabilir. Aşağıdaki bağlantılardan devam edebilirsiniz.
        </p>
        <nav aria-label="Önerilen sayfalar" className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/urunler" className="btn btn-ember">
            Ürünleri keşfet <ArrowRight aria-hidden="true" className="btn-arrow h-4 w-4" />
          </Link>
          <Link href="/" className="btn btn-ghost-light">
            Ana sayfa
          </Link>
          <Link href="/iletisim" className="btn btn-ghost-light">
            İletişim
          </Link>
        </nav>
      </div>
    </main>
  );
}
