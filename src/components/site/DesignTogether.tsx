"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Info, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { GUIDE_QUESTIONS, guideLabel, guideRecommendation, guideSteps, guideSummary, normalizeGuide, type GuideAnswers, type GuideKey } from "@/content/selection-guide";
import { selectionStore } from "@/lib/selection-store";
import { Button3D } from "@/components/ui/button-3d";
import { RequestForm } from "./RequestForm";

type Option = { id: string; name: string };
type Phase = "wizard" | "result" | "contact";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * "Birlikte bulalım / tasarlayalım": adım adım seçim rehberi (popup). Sonuç bir başlangıç yönüdür; son adımda
 * yanıtlar (ürün sayfasındaysa ürün seçimi de) teklif formuna özet olarak eklenir. Sonucu görmek için iletişim
 * bilgisi gerekmez. Native <dialog>: odak hapsi ve Esc tarayıcıdan gelir.
 * - `trigger="card"`: ürün sayfasındaki kart düğmesi.
 * - `trigger="none"`: düğme çizmez; sayfadaki `[data-guide-open]` öğelerine tıklanınca açılır (site geneli, header).
 */
export function DesignTogether({
  productName,
  categories,
  products,
  defaultProductId,
  defaultCategoryId,
  sourcePath,
  initial,
  trigger = "card",
}: {
  productName?: string;
  categories: Option[];
  products: (Option & { categoryId: string })[];
  defaultProductId?: string;
  defaultCategoryId?: string;
  sourcePath?: string;
  initial?: GuideAnswers;
  trigger?: "card" | "none";
}) {
  const pathname = usePathname();
  const ref = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<GuideAnswers>(initial ?? {});
  const [current, setCurrent] = useState<GuideKey>("place");
  const [phase, setPhase] = useState<Phase>("wizard");
  const [dir, setDir] = useState(1);
  const productSelection = useSyncExternalStore(selectionStore.subscribe, selectionStore.get, selectionStore.getServer);

  const steps = guideSteps(answers);
  const step = steps.includes(current) ? current : steps[0]!;
  const i = steps.indexOf(step);
  const q = GUIDE_QUESTIONS[step];
  const summary = guideSummary(answers);
  const rec = guideRecommendation(answers);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Site geneli kullanım: [data-guide-open] öğeleri (header düğmesi vb.) pencereyi açar.
  useEffect(() => {
    if (trigger !== "none") return;
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-guide-open]")) return;
      e.preventDefault();
      setOpen(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [trigger]);

  // Adım değişince ekran okuyucu ve klavye kullanıcısı için odak başlığa taşınır.
  useEffect(() => {
    if (open) titleRef.current?.focus({ preventScroll: true });
  }, [open, step, phase]);

  const goTo = (k: GuideKey, d: number) => {
    setDir(d);
    setCurrent(k);
    setPhase("wizard");
  };
  const next = () => {
    if (!answers[step]) return;
    if (i === steps.length - 1) {
      setDir(1);
      setPhase("result");
    } else goTo(steps[i + 1]!, 1);
  };
  const reset = () => {
    setAnswers({});
    goTo("place", -1);
  };

  const guideText = `Seçim rehberi — ${summary.map((s) => `${s.label}: ${s.value}`).join(" · ")}`;
  const selection = [productSelection, guideText].filter(Boolean).join(" | ");

  return (
    <MotionConfig reducedMotion="user">
      {trigger === "card" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="group relative mt-5 flex w-full items-center gap-5 overflow-hidden rounded-[1.5rem] border border-linen bg-white p-5 text-left transition-[border-color,box-shadow] duration-500 hover:border-ember/50 hover:shadow-[0_24px_48px_-28px_rgb(40_42_40/0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember sm:p-6"
      >
        <span aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-ember/0 blur-3xl transition-colors duration-700 group-hover:bg-ember/20" />
        <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-ember transition-colors duration-500 group-hover:bg-ember group-hover:text-white">
          <Sparkles className="h-6 w-6" />
        </span>
        <span className="relative min-w-0 flex-1">
          <span className="block text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">Seçim rehberi · adım adım</span>
          <span className="mt-1 block font-display text-xl font-semibold text-ink sm:text-2xl">Birlikte tasarlayalım</span>
          <span className="mt-1 block text-[14px] leading-relaxed text-steel">Mekânınızdan başlayıp size uygun şömineyi birkaç adımda birlikte bulalım.</span>
        </span>
        <ArrowUpRight aria-hidden="true" className="relative h-5 w-5 shrink-0 text-ink transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </button>
      ) : null}

      <dialog
        ref={ref}
        aria-labelledby="dt-title"
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-ink/70 backdrop:backdrop-blur-sm sm:m-auto sm:h-auto sm:max-h-[92dvh] sm:w-[min(64rem,calc(100vw-3rem))] sm:rounded-[1.75rem]"
      >
        {open ? (
          <div data-lenis-prevent className="flex h-full max-h-[100dvh] flex-col overflow-hidden bg-paper sm:max-h-[92dvh] sm:rounded-[1.75rem]">
            <header className="flex items-center justify-between gap-4 border-b border-sand bg-white px-5 py-3 sm:px-8">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">Bifire · Seçim rehberi</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Kapat" className="-mr-2 flex h-12 w-12 items-center justify-center rounded-full text-ink transition-colors hover:bg-bone">
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="grid gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <AnimatePresence mode="wait" initial={false} custom={dir}>
                    <motion.div
                      key={phase === "wizard" ? step : phase}
                      custom={dir}
                      initial={{ opacity: 0, x: dir * 28 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: dir * -28 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      {phase === "wizard" ? (
                        <>
                          <div className="flex items-center justify-between text-[11px] font-semibold tracking-[0.18em] text-stone uppercase">
                            <span>
                              Adım {i + 1} / {steps.length}
                            </span>
                            <span>{q.label}</span>
                          </div>
                          <div role="progressbar" aria-label="Rehber ilerlemesi" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={i + 1} className="mt-3 h-1 overflow-hidden rounded-full bg-sand">
                            <motion.span className="block h-full rounded-full bg-ember" initial={false} animate={{ width: `${((i + 1) / steps.length) * 100}%` }} transition={{ duration: 0.5, ease: EASE }} />
                          </div>
                          <fieldset className="mt-7">
                            <legend className="contents">
                              <h2 id="dt-title" ref={titleRef} tabIndex={-1} className="font-display text-2xl leading-tight font-semibold text-balance text-ink outline-none sm:text-3xl">
                                {q.title}
                              </h2>
                            </legend>
                            <p id="dt-help" className="mt-3 text-[15px] leading-relaxed text-steel">
                              {q.help}
                            </p>
                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                              {q.options.map((opt) => {
                                const on = answers[step] === opt.value;
                                return (
                                  <label
                                    key={opt.value}
                                    className={`relative flex min-h-[4.5rem] cursor-pointer gap-3 rounded-2xl border bg-white p-4 transition-[border-color,box-shadow] duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ember ${
                                      on ? "border-ember shadow-[0_16px_32px_-24px_rgb(146_113_78/0.8)]" : "border-sand hover:border-ink"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`dt-${step}`}
                                      value={opt.value}
                                      checked={on}
                                      aria-describedby="dt-help"
                                      onChange={() => setAnswers((a) => normalizeGuide({ ...a, [step]: opt.value }))}
                                      className="sr-only"
                                    />
                                    <span aria-hidden="true" className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${on ? "border-ember bg-ember text-white" : "border-sand"}`}>
                                      {on ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                                    </span>
                                    <span>
                                      <span className="block text-[15px] font-semibold text-ink">{opt.title}</span>
                                      <span className="mt-1 block text-[13px] leading-relaxed text-steel">{opt.help}</span>
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </fieldset>
                          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => i > 0 && goTo(steps[i - 1]!, -1)}
                              disabled={i === 0}
                              className="inline-flex min-h-12 items-center gap-2 px-1 text-[14px] font-semibold text-ink underline-offset-4 hover:underline disabled:opacity-30 disabled:hover:no-underline"
                            >
                              <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Önceki soru
                            </button>
                            <Button3D type="button" tone="ember" onClick={next} disabled={!answers[step]}>
                              {i === steps.length - 1 ? "Seçeneklerimi gör" : "Devam et"} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                            </Button3D>
                          </div>
                          <p className="mt-4 text-[13px] text-stone">Sonuçları görmek için iletişim bilgisi gerekmez.</p>
                        </>
                      ) : phase === "result" ? (
                        <>
                          <p className="text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">Görüşmeye başlangıç yönünüz</p>
                          <h2 id="dt-title" ref={titleRef} tabIndex={-1} className="mt-3 font-display text-3xl leading-tight font-semibold text-balance text-ink outline-none sm:text-4xl">
                            {rec.title}
                          </h2>
                          <p className="mt-4 text-[16px] leading-relaxed text-steel">{rec.why}</p>
                          <ul className="mt-5 flex flex-wrap gap-2">
                            {rec.links.map((l) => (
                              <li key={l.href}>
                                <Link href={l.href} onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-ember/30 bg-ember/[0.05] px-4 text-[14px] font-semibold text-ink transition-colors hover:border-ember">
                                  {l.label} <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-ember-ink" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                          <h3 className="mt-8 font-display text-lg font-semibold text-ink">Hangi konular netleşmeli?</h3>
                          <ul className="mt-3 space-y-2.5">
                            {rec.checks.map((c) => (
                              <li key={c} className="flex gap-2.5 text-[15px] leading-relaxed text-steel">
                                <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                                {c}
                              </li>
                            ))}
                          </ul>
                          <h3 className="mt-7 font-display text-lg font-semibold text-ink">Alternatifleri de konuşalım.</h3>
                          <p className="mt-2 text-[15px] leading-relaxed text-steel">{rec.alternatives}</p>
                          <h3 className="mt-7 font-display text-lg font-semibold text-ink">Görüşmeye ne hazırlayabilirsiniz?</h3>
                          <p className="mt-2 text-[15px] leading-relaxed text-steel">Mekânın genel fotoğrafları, yaklaşık ölçüler, varsa plan ve mevcut baca bilgisiyle başlayabilirsiniz. Bütün belgelerin hazır olması gerekmez.</p>
                          <p role="note" className="mt-6 flex gap-2.5 rounded-2xl border border-sand bg-white px-4 py-3 text-[13px] leading-relaxed text-steel">
                            <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                            Bu sonuç otomatik bir teknik onay, kapasite hesabı veya kesin model önerisi değildir. Belirli bir ürünün uygunluğu kendi belgeleri ve saha koşullarıyla değerlendirilir.
                          </p>
                          <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Button3D type="button" tone="ember" onClick={() => (setDir(1), setPhase("contact"))}>
                              Bu özetle görüşme planla <ArrowRight aria-hidden="true" className="h-4 w-4" />
                            </Button3D>
                            <button type="button" onClick={() => goTo(steps[steps.length - 1]!, -1)} className="inline-flex min-h-12 items-center gap-2 px-2 text-[14px] font-semibold text-ink underline-offset-4 hover:underline">
                              <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Yanıtlara dön
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">Son adım</p>
                          <h2 id="dt-title" ref={titleRef} tabIndex={-1} className="mt-3 font-display text-3xl leading-tight font-semibold text-balance text-ink outline-none sm:text-4xl">
                            Projenizi birlikte netleştirelim.
                          </h2>
                          <p className="mt-4 text-[15px] leading-relaxed text-steel">{productName ? <>Seçim özetiniz ve {productName} için yaptığınız seçimler talebinize eklenir.</> : "Seçim özetiniz talebinize eklenir."} Size dönüp görüşmeyi ya da Tuzla fabrika showroom ziyaretini planlayalım.</p>
                          <div className="mt-6">
                            <RequestForm
                              type="QUOTE"
                              idPrefix="rehber"
                              categories={categories}
                              products={products}
                              defaultCategoryId={defaultCategoryId}
                              defaultProductId={defaultProductId}
                              sourcePath={sourcePath ?? pathname ?? "/"}
                              selectionOverride={selection}
                              submitLabel="Görüşme talebimi gönder"
                              showroomToggle
                              district
                              compact
                            />
                          </div>
                          <button type="button" onClick={() => (setDir(-1), setPhase("result"))} className="mt-4 inline-flex min-h-12 items-center gap-2 px-1 text-[14px] font-semibold text-ink underline-offset-4 hover:underline">
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Sonuca dön
                          </button>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <aside aria-label="Seçimleriniz" className="h-fit rounded-2xl border border-sand bg-white p-5 lg:col-span-4">
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">Size ait bir başlangıç</p>
                  <h3 className="mt-2 font-display text-lg font-semibold text-ink">Seçim özetiniz</h3>
                  <dl className="mt-4 divide-y divide-sand border-y border-sand">
                    {steps.map((k) => (
                      <div key={k} className="flex items-start justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <dt className="text-[11px] font-semibold tracking-[0.14em] text-stone uppercase">{GUIDE_QUESTIONS[k].label}</dt>
                          <dd className={`mt-0.5 text-[14px] ${answers[k] ? "font-semibold text-ink" : "text-stone"}`}>{guideLabel(k, answers[k])}</dd>
                        </div>
                        {answers[k] ? (
                          <button type="button" onClick={() => goTo(k, -1)} aria-label={`${GUIDE_QUESTIONS[k].label} seçimini değiştir`} className="min-h-10 shrink-0 text-[13px] font-semibold text-ember-ink underline-offset-4 hover:underline">
                            Değiştir
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </dl>
                  {productSelection && productName ? (
                    <p className="mt-4 text-[13px] leading-relaxed text-steel">
                      <span className="font-semibold text-ink">{productName}:</span> {productSelection}
                    </p>
                  ) : null}
                  <p className="mt-4 text-[12px] leading-relaxed text-stone">Bu özet ürün siparişi veya teknik uygunluk onayı değildir.</p>
                  {summary.length ? (
                    <button type="button" onClick={reset} className="mt-3 min-h-10 text-[13px] font-semibold text-ink underline-offset-4 hover:underline">
                      Seçimleri temizle
                    </button>
                  ) : null}
                </aside>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </MotionConfig>
  );
}
