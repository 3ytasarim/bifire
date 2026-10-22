import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TrustPoints } from "@/components/site/TrustPoints";

/** Hero'nun hemen altındaki güven bandı: Tasarım / Üretim / Montaj + doğrulanmış firma gerçekleri. */
export function TrustBand() {
  return (
    <section aria-label="Tasarım, üretim ve montaj" className="border-b border-linen bg-white py-8 sm:py-10">
      <div className="shell grid items-center gap-6 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <p className="font-display text-[13px] font-semibold tracking-[0.32em] text-ink uppercase">
            Tasarım <span className="text-ember">/</span> Üretim <span className="text-ember">/</span> Montaj
          </p>
          <Link href="/hizmet-bolgeleri" className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-[13px] font-semibold text-ember-ink underline-offset-4 hover:underline">
            İstanbul hizmet bölgelerimiz <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="lg:col-span-9">
          <TrustPoints />
        </div>
      </div>
    </section>
  );
}
