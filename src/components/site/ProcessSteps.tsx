import { PROCESS } from "@/content/company";

/** "Hazneden uygulamaya" proje adımları (4 adım) — ürün, hizmet ve bölge sayfalarında ortak. */
export function ProcessSteps({ eyebrow = "Mekânınız için planlayalım", title = "Hazneden uygulamaya, birlikte netleşen bir süreç.", id = "surec" }: { eyebrow?: string; title?: string; id?: string }) {
  return (
    <section aria-labelledby={id} className="bg-white py-16 sm:py-24">
      <div className="shell">
        <p className="eyebrow reveal text-ember-ink">{eyebrow}</p>
        <h2 id={id} className="display-3 reveal mt-5 max-w-2xl text-balance">
          {title}
        </h2>
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((s, i) => (
            <li key={s.key} className="reveal relative rounded-2xl border border-linen bg-paper p-6 sm:p-7">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase tabular-nums">
                {String(i + 1).padStart(2, "0")} / {s.label}
              </p>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-steel">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
