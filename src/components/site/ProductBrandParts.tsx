import Image from "next/image";
import { Factory, Hammer, Info, PencilRuler, Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion/Motion";

/** Ürün başka bir üreticinin cihazı mı (ör. Zaya)? Bifire markalı ya da markasız ürünler kendi üretimimizdir. */
export const isThirdPartyBrand = (brand: string | null | undefined) => Boolean(brand?.trim()) && !/bifire/i.test(brand!);

/** Görsellerin hemen altında görünen not (ör. yapay zekâyla oluşturulmuş temsili mekân tasarımı uyarısı). */
export function ImageNote({ text, dark }: { text: string; dark?: boolean }) {
  return (
    <p className={`mt-3 flex items-start gap-2 text-[12.5px] leading-relaxed ${dark ? "text-white/60" : "text-stone"}`}>
      <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {text}
    </p>
  );
}

/**
 * Üretici markalı cihazlarda (Zaya…) cihazın kimliği ile Bifire'nin hizmetini ayırır: cihaz üreticinindir;
 * dış tasarım, kaplama ve montaj Bifire'nindir. Bifire'nin bayilik/teşhir/servis iddiası içermez.
 */
export function ManufacturerPanel() {
  const items = [
    { icon: Factory, title: "Elektrikli cihaz", text: "Donanım ve ölçü bilgileri teknik tabloda yer alır; seçtiğiniz ölçüye göre birlikte netleştiririz." },
    { icon: PencilRuler, title: "Dış tasarım ve kaplama: Bifire", text: "Cihazın çevresini mekânınıza göre birlikte tasarlarız." },
    { icon: Hammer, title: "Uygulama: Bifire montaj ekibi", text: "Kaplama ve montajı kendi ekibimizle yaparız." },
  ];
  return (
    <div className="mt-8 overflow-hidden rounded-[1.4rem] border border-linen bg-white">
      <p className="border-b border-linen bg-paper px-5 py-3 text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">Kim ne yapar</p>
      <ul className="divide-y divide-linen">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3 px-5 py-4">
            <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ember/10 text-ember-ink">
              <Icon className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-[14px] font-semibold text-ink">{title}</span>
              <span className="mt-0.5 block text-[13px] leading-relaxed text-steel">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Ana galeriye konmayan temsili tasarım görseli (ör. kaynakta ürün fotoğrafı olmayan modeller için genel mekân
 * konsepti). Görsel notu hemen altında görünür.
 */
export function ConceptImage({ url, alt, note, productName }: { url: string; alt: string; note: string | null; productName: string }) {
  return (
    <section id="temsili-tasarim-bolum" aria-labelledby="temsili-tasarim" className="scroll-mt-28 bg-white py-16 sm:py-24">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
        <Reveal className="lg:col-span-4">
          <p className="eyebrow text-ember-ink">
            <Sparkles aria-hidden="true" className="mr-1.5 inline h-3.5 w-3.5 align-[-2px]" />
            Temsili tasarım önerisi
          </p>
          <h2 id="temsili-tasarim" className="display-3 mt-5 scroll-mt-32 text-balance">
            Mekânınızda nasıl bir çerçeve kurulabilir?
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-steel">
            Bu görsel {productName} modelinin fotoğrafı değildir; elektrikli bir şöminenin çevresinin nasıl tasarlanabileceğine dair genel bir mekân konseptidir. Gerçek ürün görünüşü, çerçevesi ve alev düzeni üreticiyle doğrulanır.
          </p>
        </Reveal>
        <Reveal className="lg:col-span-8" delay={0.08}>
          <figure>
            <div className="relative aspect-[16/9] overflow-hidden rounded-[1.75rem] bg-linen shadow-[0_30px_60px_-34px_rgb(12_12_13/0.4)]">
              <Image src={url} alt={alt} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
            </div>
            {note ? (
              <figcaption>
                <ImageNote text={note} />
              </figcaption>
            ) : null}
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Gerçek ürün fotoğrafı olmayan üretici ürünlerinde galerinin yerine geçen panel: boş görsel kutusu yerine
 * durumu açıkça söyler ve varsa temsili tasarım bölümüne yönlendirir. Ürün fotoğrafı eklenince galeri görünür.
 */
export function NoPhotoPanel({ name, specs, hasConcept }: { name: string; specs: { label: string; value: string }[]; hasConcept: boolean }) {
  return (
    <div className="relative flex aspect-[4/5] w-full flex-col justify-between overflow-hidden rounded-2xl bg-ink p-7 text-white sm:aspect-square sm:p-10">
      <span aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.45),transparent_65%)] motion-safe:animate-[pulse_6s_ease-in-out_infinite]" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgb(224_105_31/0.2),transparent_65%)]" />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[12px] font-semibold tracking-[0.06em] text-white/80 backdrop-blur">
          <Factory aria-hidden="true" className="h-3.5 w-3.5 text-ember" /> Elektrikli şömine
        </span>
        <p className="mt-6 max-w-sm font-display text-3xl leading-tight font-semibold text-balance sm:text-4xl">{name}</p>
      </div>
      {specs.length ? (
        <dl className="relative grid gap-3">
          {specs.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur">
              <dt className="text-[11px] font-semibold tracking-[0.16em] text-white/55 uppercase">{s.label}</dt>
              <dd className="mt-1 font-display text-xl font-semibold">{s.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <div className="relative">
        <p className="flex items-start gap-2 text-[13px] leading-relaxed text-white/65">
          <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Bu model için doğrulanmış ürün fotoğrafı henüz eklenmedi; görünüm, çerçeve ve alev düzeni üreticiyle teyit edilir.
        </p>
        {hasConcept ? (
          <a href="#temsili-tasarim" className="group mt-5 inline-flex min-h-12 items-center gap-3 rounded-full bg-ember pr-2 pl-6 text-[14px] font-semibold text-ink transition-colors hover:bg-white">
            Temsili tasarım önerisini görün
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/10 transition-transform duration-300 group-hover:translate-y-0.5">
              <Sparkles className="h-4 w-4" />
            </span>
          </a>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Ürün fotoğrafı olmayan modelde üst görsel alanı: temsili mekân tasarımı, üzerinde "Temsili mekân tasarımı"
 * etiketi ve hemen altında görsel notu — ürün fotoğrafı gibi sunulmaz.
 */
export function ConceptHero({ url, alt, note }: { url: string; alt: string; note: string | null }) {
  return (
    <figure>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-bone sm:aspect-square">
        <Image src={url} alt={alt} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
      </div>
      {note ? (
        <figcaption>
          <ImageNote text={note} />
        </figcaption>
      ) : null}
    </figure>
  );
}
