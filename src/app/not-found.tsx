import type { Metadata } from "next";
import Link from "next/link";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";

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
    <main className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-paper">
      <span
        aria-hidden="true"
        className="absolute -right-56 -bottom-72 -z-10 h-[820px] w-[820px] rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.2),rgb(246_194_139/0.1)_40%,transparent_70%)]"
      />
      <div className="shell py-24">
        <Link href="/" className="font-display text-xl font-semibold tracking-[0.34em] text-ink">
          BİFİRE
        </Link>
        <p className="mt-16 font-display text-[7rem] leading-none font-semibold tracking-[-0.05em] text-linen sm:text-[11rem]">404</p>
        <h1 className="display-2 -mt-6 max-w-2xl text-ink sm:-mt-10">Aradığınız sayfa sönmüş olabilir.</h1>
        <p className="lead mt-6 max-w-xl text-steel">Sayfa taşınmış, kaldırılmış ya da adres hatalı yazılmış olabilir. Aşağıdaki bağlantılardan devam edebilirsiniz.</p>
        <nav aria-label="Önerilen sayfalar" className="mt-10 flex flex-col items-start gap-3 sm:flex-row">
          <ArrowFillButton href="/urunler" tone="ember">
            Ürünleri keşfet
          </ArrowFillButton>
          <ArrowFillButton href="/" tone="light">
            Ana sayfa
          </ArrowFillButton>
          <ArrowFillButton href="/iletisim" tone="light">
            İletişim
          </ArrowFillButton>
        </nav>
      </div>
    </main>
  );
}
