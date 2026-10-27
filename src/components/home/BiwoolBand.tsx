import Image from "next/image";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Motion";
import { StudioEyebrow, StudioLink } from "./studio";

const POINTS = [
  { no: "01", title: "Kendi üretimimiz", text: "Hazne, kaplama ve mimari yerleşimi bir bütün olarak ele alıyoruz." },
  { no: "02", title: "Isı odasına uzanan uzmanlık", text: "Biwool şömine taş yünü yalıtımını, projenin teknik koşullarıyla birlikte değerlendiriyoruz." },
  { no: "03", title: "Kendi ekibimizle uygulama", text: "Keşiften montaja uzanan süreci aynı proje yaklaşımıyla yürütüyoruz." },
];

/** Varsayılan görsel: Biwool şömine taş yünü (rehber 121 kapağı). */
const DEFAULT_IMAGE = "/uploads/2026/10/bifire-rehber-121_biwool-somine-tas-yunu-nedir-urun-secerken-hangi-bilgiler-incelenm-a4091b.webp";

/** Bifire × Biwool: koyu bant — markanın Biwool'a ait olduğu ve üretim + yalıtım + montaj bütünlüğü. */
export function BiwoolBand({ image, imageAlt }: { image?: string | null; imageAlt?: string | null }) {
  return (
    <section aria-labelledby="home-biwool" className="section-pad dark-surface overflow-hidden bg-anthracite text-white">
      <div className="shell grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <Reveal>
            <StudioEyebrow no="02" tone="light">
              Tasarımın ardındaki uzmanlık
            </StudioEyebrow>
            <h2 id="home-biwool" className="mt-5 font-display text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] text-balance sm:text-[2.45rem] lg:text-[2.7rem]">
              Görünen tasarımın ardında <span className="text-amber">Biwool uzmanlığı.</span>
            </h2>
            <p className="mt-6 max-w-[520px] text-[16px] leading-relaxed text-white/72">
              Bifire Şömine, Biwool markasına aittir. Şömine üretimini, ısı odası yalıtımı alanındaki birikimimizle aynı çatı altında buluşturuyoruz.
            </p>
          </Reveal>
          <Stagger as="ol" className="mt-9 divide-y divide-white/12 border-y border-white/12" gap={0.1}>
            {POINTS.map((p) => (
              <StaggerItem key={p.no} className="group grid grid-cols-[2.75rem_1fr] gap-x-4 py-5">
                <span className="pt-0.5 text-[12px] font-semibold tracking-[0.16em] text-amber tabular-nums">{p.no}</span>
                <span>
                  <span className="block font-display text-[17px] font-medium text-white transition-colors duration-300 group-hover:text-amber">{p.title}</span>
                  <span className="mt-1 block text-[14px] leading-relaxed text-white/65">{p.text}</span>
                </span>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal delay={0.1}>
            <StudioLink href="/kurumsal" tone="light" className="mt-7">
              Bifire ve Biwool&apos;u yakından tanıyın
            </StudioLink>
          </Reveal>
        </div>
        <Reveal delay={0.08}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-graphite lg:aspect-[605/540]">
            <Image src={image || DEFAULT_IMAGE} alt={imageAlt || "Biwool şömine taş yünü yalıtım levhası ve şömine"} fill sizes="(min-width: 1024px) 605px, 100vw" className="object-cover" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
