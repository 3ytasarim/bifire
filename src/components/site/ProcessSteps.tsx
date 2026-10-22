import { Reveal, Stagger, StaggerItem } from "@/components/motion/Motion";
import { PROCESS } from "@/content/company";

/** "Hazneden uygulamaya" proje adımları (4 adım) — ürün, hizmet ve bölge sayfalarında ortak; kademeli giriş. */
export function ProcessSteps({ eyebrow = "Mekânınız için planlayalım", title = "Hazneden uygulamaya, birlikte netleşen bir süreç.", id = "surec" }: { eyebrow?: string; title?: string; id?: string }) {
  return (
    <section aria-labelledby={id} className="bg-white py-16 sm:py-24">
      <div className="shell">
        <Reveal>
          <p className="eyebrow text-ember-ink">{eyebrow}</p>
          <h2 id={id} className="display-3 mt-5 max-w-2xl text-balance">
            {title}
          </h2>
        </Reveal>
        <div className="relative mt-12">
          {/* Adımları birbirine bağlayan çizgi (masaüstü) */}
          <span aria-hidden="true" className="absolute top-[2.15rem] right-[12.5%] left-[12.5%] hidden h-px bg-gradient-to-r from-ember/0 via-ember/50 to-ember/0 lg:block" />
          <Stagger as="ol" className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4" gap={0.12}>
            {PROCESS.map((s, i) => (
              <StaggerItem key={s.key} className="group relative rounded-2xl border border-linen bg-paper p-6 transition-colors duration-500 hover:border-ember/40 hover:bg-white sm:p-7">
                <span
                  aria-hidden="true"
                  className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-ember/30 bg-white font-display text-sm font-semibold text-ember-ink tabular-nums transition-colors duration-500 group-hover:bg-ember group-hover:text-ink"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-5 text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">{s.label}</p>
                <h3 className="mt-2 font-display text-xl font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-steel">{s.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
