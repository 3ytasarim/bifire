import { HOME } from "@/content/home";

/**
 * "Neden Bifire?" — ikon kartı dizilimi yerine editoryal liste: solda sabit (sticky) başlık,
 * sağda büyük numaralı satırlar; hover'da közün ışığı gibi beliren turuncu çizgi.
 */
export function WhyBifire() {
  const w = HOME.why;
  return (
    <section aria-labelledby="home-why" className="bg-paper py-20 sm:py-28 lg:py-36">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <p className="eyebrow reveal text-ember-ink">{w.eyebrow}</p>
            <h2 id="home-why" className="display-2 reveal mt-5 text-ink">
              {w.title}
            </h2>
          </div>
        </div>
        <ol className="border-t border-ink/15 lg:col-span-7">
          {w.items.map((item, i) => (
            <li key={item.title} className="reveal group relative grid gap-3 border-b border-ink/15 py-9 sm:grid-cols-[6rem_1fr] sm:gap-8 sm:py-11">
              <span
                aria-hidden="true"
                className="absolute bottom-[-1px] left-0 h-px w-0 bg-ember transition-all duration-700 ease-(--ease-premium) group-hover:w-full"
              />
              <span className="font-display text-5xl leading-none font-semibold tracking-[-0.04em] text-sand transition-colors duration-500 group-hover:text-ember sm:text-6xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-2xl font-semibold text-ink">{item.title}</h3>
                <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-steel">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
