import { TrustPoints } from "@/components/site/TrustPoints";

/** Hero'nun hemen altındaki güven bandı: Tasarım / Üretim / Montaj + doğrulanmış firma gerçekleri. */
export function TrustBand() {
  return (
    <section aria-label="Tasarım, üretim ve montaj" className="border-b border-linen bg-white py-8 sm:py-10">
      <div className="shell grid items-center gap-6 lg:grid-cols-12">
        <p className="font-display text-[13px] font-semibold tracking-[0.32em] text-ink uppercase lg:col-span-3">
          Tasarım <span className="text-ember">/</span> Üretim <span className="text-ember">/</span> Montaj
        </p>
        <div className="lg:col-span-9">
          <TrustPoints />
        </div>
      </div>
    </section>
  );
}
