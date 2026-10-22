"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, ImageUp, Loader2, Lock, Trash2, X } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { submitDesignRequest, type DesignFormState } from "@/app/(site)/mekaniniza-ozel-tasarim/actions";
import { Button3D } from "@/components/ui/button-3d";
import { DESIGN_FLUE, DESIGN_PHOTO_MAX_MB, DESIGN_PHOTO_TYPES, DESIGN_PREFERENCES } from "@/content/design-service";
import { DISTRICT_OPTIONS } from "@/content/regions";
import { inputCls, Select } from "./RequestForm";

const EASE = [0.16, 1, 0.3, 1] as const;
const STEPS = ["Fotoğraf", "Tercihler", "Özet"] as const;

/** Telefondan gelen büyük fotoğrafı tarayıcıda küçültür (uzun kenar 2560 px, JPEG) — yükleme hızlı ve limit içinde kalır. */
async function downscale(file: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, 2560 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.88));
    // Her zaman bellekteki yeni kopya gönderilir (EXIF temizlenmiş, boyut sınırlı); dosya sistemi bağı kalmaz.
    return blob ?? file;
  } catch {
    return file;
  }
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button3D type="submit" tone="ember" disabled={pending} aria-disabled={pending}>
      {pending ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
      {pending ? "Gönderiliyor…" : "Bilgilerimi gönder"}
      {!pending ? <ArrowRight aria-hidden="true" className="h-4 w-4" /> : null}
    </Button3D>
  );
}

/**
 * "Mekânınıza özel tasarım" başvurusu: 1) mekân fotoğrafı 2) tercihler 3) özet + iletişim. Sayfadaki
 * `[data-design-open]` öğeleri ve #paylas bağlantısı pencereyi açar. Tüm adımlar tek <form>'dadır (gizli
 * adımların alanları korunur). Fotoğraf isteğe bağlıdır; özel depoya kaydedilir, yalnızca ekibimiz görür.
 */
export function DesignRequest() {
  const ref = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const startedAt = useRef(0);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [photo, setPhoto] = useState<{ blob: Blob; name: string; url: string } | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [prefs, setPrefs] = useState({ preference: "Birlikte seçelim", wallWidth: "", ceilingHeight: "", flue: "Henüz bilmiyorum", note: "" });
  const [state, action] = useActionState<DesignFormState, FormData>(submitDesignRequest, { status: "idle" });

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest("[data-design-open]");
      if (!t) return;
      e.preventDefault();
      setOpen(true);
    };
    document.addEventListener("click", onClick);
    // #paylas ile gelindiyse pencere açılır (başka sayfalardaki "fotoğrafımı paylaş" bağlantıları).
    const raf = window.location.hash === "#paylas" ? requestAnimationFrame(() => setOpen(true)) : 0;
    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      if (!startedAt.current) startedAt.current = Date.now();
    }
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (open) titleRef.current?.focus({ preventScroll: true });
  }, [open, step, state]);

  // Sunucu fotoğraf hatası döndürürse ilk adıma dön (render sırasında durum ayarlama: React önerilen kalıp).
  const [seen, setSeen] = useState(state);
  if (seen !== state) {
    setSeen(state);
    if (state.status === "error" && state.errors?.photo) setStep(0);
  }

  useEffect(() => () => void (photo && URL.revokeObjectURL(photo.url)), [photo]);

  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
  };

  const pick = async (file: File | undefined) => {
    setPhotoError(null);
    if (!file) return;
    if (file.size === 0) return setPhotoError("Fotoğraf okunamadı. Lütfen başka bir dosya seçin.");
    if (!(DESIGN_PHOTO_TYPES as readonly string[]).includes(file.type)) return setPhotoError("Yalnızca JPG, PNG veya WebP fotoğraf seçebilirsiniz.");
    if (file.size > DESIGN_PHOTO_MAX_MB * 1024 * 1024) return setPhotoError(`Fotoğraf en fazla ${DESIGN_PHOTO_MAX_MB} MB olabilir.`);
    setBusy(true);
    const blob = await downscale(file);
    setBusy(false);
    setPhoto({ blob, name: file.name.replace(/\.[^.]+$/, "") + ".jpg", url: URL.createObjectURL(blob) });
  };

  const submit = (fd: FormData) => {
    fd.set("startedAt", String(startedAt.current));
    fd.delete("photoPicker");
    if (photo) fd.set("photo", photo.blob, photo.name);
    for (const [k, v] of Object.entries(prefs)) fd.set(k, v);
    action(fd);
  };

  const err = state.status === "error" ? (state.errors ?? {}) : {};
  const v = state.values ?? {};
  const summary = [
    ["Mekân fotoğrafı", photo ? "Eklendi" : "Eklenmedi"],
    ["Şömine tercihi", prefs.preference],
    ["Duvar genişliği", prefs.wallWidth ? `~${prefs.wallWidth} cm` : "Belirtilmedi"],
    ["Tavan yüksekliği", prefs.ceilingHeight ? `~${prefs.ceilingHeight} cm` : "Belirtilmedi"],
    ["Baca durumu", prefs.flue],
  ];

  return (
    <MotionConfig reducedMotion="user">
      <dialog
        ref={ref}
        aria-labelledby="dr-title"
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-ink/70 backdrop:backdrop-blur-sm sm:m-auto sm:h-auto sm:max-h-[92dvh] sm:w-[min(52rem,calc(100vw-3rem))] sm:rounded-[1.75rem]"
      >
        <div data-lenis-prevent className="flex h-full max-h-[100dvh] flex-col overflow-hidden bg-paper sm:max-h-[92dvh] sm:rounded-[1.75rem]">
          <header className="border-b border-sand bg-white px-5 pt-3 pb-4 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">Bifire tasarım hazırlığı</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Kapat" className="-mr-2 flex h-12 w-12 items-center justify-center rounded-full text-ink transition-colors hover:bg-bone">
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            {state.status !== "success" ? (
              <ol className="mt-1 grid grid-cols-3 gap-2" aria-label="Adımlar">
                {STEPS.map((s, i) => (
                  <li key={s} aria-current={i === step ? "step" : undefined}>
                    <span className="block h-1 overflow-hidden rounded-full bg-sand">
                      <motion.span className="block h-full bg-ember" initial={false} animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.5, ease: EASE }} />
                    </span>
                    <span className={`mt-2 block text-[11px] font-semibold tracking-[0.14em] uppercase ${i === step ? "text-ink" : "text-stone"}`}>
                      {i + 1} · {s}
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}
          </header>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-7 sm:px-8 sm:py-9">
            {state.status === "success" ? (
              <div role="status" className="py-6 text-center">
                <CheckCircle2 aria-hidden="true" className="mx-auto h-12 w-12 text-ember" />
                <h2 id="dr-title" ref={titleRef} tabIndex={-1} className="mt-5 font-display text-3xl font-semibold text-ink outline-none">
                  Mekânınız bize ulaştı.
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-steel">{state.message}</p>
                <p className="mx-auto mt-3 max-w-lg text-[13px] leading-relaxed text-stone">Görsel öneri tasarımı anlatır; kesin ölçü ve uygulama detayları keşif ve teknik değerlendirmeyle netleşir.</p>
                <button type="button" onClick={() => setOpen(false)} className="mt-8 inline-flex min-h-12 items-center rounded-full border border-sand bg-white px-6 text-[14px] font-semibold text-ink hover:border-ink">
                  Kapat
                </button>
              </div>
            ) : (
              <form action={submit} noValidate>
                <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label htmlFor="dr-website">Web siteniz</label>
                  <input id="dr-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                </div>
                <AnimatePresence mode="wait" initial={false} custom={dir}>
                  <motion.div key={step} initial={{ opacity: 0, x: dir * 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -28 }} transition={{ duration: 0.35, ease: EASE }}>
                    {step === 0 ? (
                      <section>
                        <h2 id="dr-title" ref={titleRef} tabIndex={-1} className="font-display text-2xl leading-tight font-semibold text-ink outline-none sm:text-3xl">
                          Mekânınızı tanıyalım.
                        </h2>
                        <p className="mt-3 text-[15px] leading-relaxed text-steel">Duvarın ve yakın çevresinin net göründüğü bir fotoğrafla başlayın.</p>
                        {photo ? (
                          <figure className="mt-6 overflow-hidden rounded-2xl border border-sand bg-white">
                            <div className="relative aspect-[4/3] bg-bone">
                              <Image src={photo.url} alt="Seçtiğiniz mekân fotoğrafı" fill unoptimized sizes="(min-width: 640px) 48rem, 100vw" className="object-contain" />
                            </div>
                            <figcaption className="flex min-h-14 items-center justify-between gap-3 px-4">
                              <span className="truncate text-[14px] font-semibold text-ink">{photo.name}</span>
                              <button type="button" onClick={() => setPhoto(null)} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 px-2 text-[13px] font-semibold text-red-800 hover:underline">
                                <Trash2 aria-hidden="true" className="h-4 w-4" /> Fotoğrafı kaldır
                              </button>
                            </figcaption>
                          </figure>
                        ) : (
                          <label
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              void pick(e.dataTransfer.files[0]);
                            }}
                            className="group mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sand bg-white px-6 py-12 text-center transition-colors hover:border-ember has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ember"
                          >
                            <input name="photoPicker" type="file" accept={DESIGN_PHOTO_TYPES.join(",")} className="sr-only" onChange={(e) => void pick(e.target.files?.[0])} />
                            <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-full bg-bone text-ember transition-colors duration-300 group-hover:bg-ember group-hover:text-ink">
                              {busy ? <Loader2 className="h-7 w-7 animate-spin" /> : <ImageUp className="h-7 w-7" />}
                            </span>
                            <span className="mt-4 font-display text-lg font-semibold text-ink">{busy ? "Fotoğraf hazırlanıyor…" : "Fotoğraf seçin"}</span>
                            <span className="mt-1 text-[13px] text-stone">JPG, PNG veya WebP · En fazla {DESIGN_PHOTO_MAX_MB} MB</span>
                          </label>
                        )}
                        {photoError || err.photo ? (
                          <p role="alert" className="mt-3 text-sm text-red-800">
                            {photoError || err.photo}
                          </p>
                        ) : null}
                        <p className="mt-4 flex gap-2 text-[13px] leading-relaxed text-stone">
                          <Lock aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Fotoğrafınız herkese açık yayınlanmaz; yalnızca talebinizi değerlendiren ekibimiz görür. Konum gibi dosya içi bilgiler temizlenir.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                          <button type="button" onClick={() => go(1)} className="inline-flex min-h-12 items-center px-1 text-[14px] font-semibold text-ink underline-offset-4 hover:underline">
                            Fotoğrafım hazır değil, tercihlerle devam et
                          </button>
                          <Button3D type="button" tone="ember" onClick={() => go(1)} disabled={!photo || busy}>
                            Tercihlere geç <ArrowRight aria-hidden="true" className="h-4 w-4" />
                          </Button3D>
                        </div>
                      </section>
                    ) : step === 1 ? (
                      <section>
                        <h2 id="dr-title" ref={titleRef} tabIndex={-1} className="font-display text-2xl leading-tight font-semibold text-ink outline-none sm:text-3xl">
                          Nasıl bir şömine hayal ediyorsunuz?
                        </h2>
                        <p className="mt-3 text-[15px] leading-relaxed text-steel">Bilmiyorsanız birlikte değerlendirebiliriz.</p>
                        <fieldset className="mt-6">
                          <legend className="text-sm font-semibold text-ink">Şömine tercihiniz</legend>
                          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {DESIGN_PREFERENCES.map((p) => {
                              const on = prefs.preference === p;
                              return (
                                <label
                                  key={p}
                                  className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-3 text-center text-[14px] font-semibold transition-colors duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ember ${
                                    on ? "border-ink bg-ink text-white" : "border-sand bg-white text-ink hover:border-ink"
                                  }`}
                                >
                                  <input type="radio" name="preferencePicker" value={p} checked={on} onChange={() => setPrefs((x) => ({ ...x, preference: p }))} className="sr-only" />
                                  {p}
                                </label>
                              );
                            })}
                          </div>
                        </fieldset>
                        <div className="mt-6 grid gap-5 sm:grid-cols-2">
                          {(
                            [
                              ["wallWidth", "Yaklaşık duvar genişliği", "ör. 320"],
                              ["ceilingHeight", "Yaklaşık tavan yüksekliği", "ör. 280"],
                            ] as const
                          ).map(([k, label, ph]) => (
                            <div key={k}>
                              <label htmlFor={`dr-${k}`} className="text-sm font-semibold text-ink">
                                {label} <span className="font-normal text-stone">· İsteğe bağlı</span>
                              </label>
                              <div className="relative">
                                <input
                                  id={`dr-${k}`}
                                  inputMode="numeric"
                                  placeholder={ph}
                                  value={prefs[k]}
                                  maxLength={5}
                                  aria-invalid={Boolean(err[k])}
                                  onChange={(e) => setPrefs((x) => ({ ...x, [k]: e.target.value.replace(/[^\d]/g, "") }))}
                                  className={`${inputCls} pr-12`}
                                />
                                <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 mt-1 -translate-y-1/2 text-[14px] text-stone">
                                  cm
                                </span>
                              </div>
                              {err[k] ? <p className="mt-1.5 text-sm text-red-800">{err[k]}</p> : null}
                            </div>
                          ))}
                          <div className="sm:col-span-2">
                            <label htmlFor="dr-flue" className="text-sm font-semibold text-ink">
                              Baca durumu
                            </label>
                            <select id="dr-flue" value={prefs.flue} onChange={(e) => setPrefs((x) => ({ ...x, flue: e.target.value }))} className={`${inputCls} appearance-none`}>
                              {DESIGN_FLUE.map((f) => (
                                <option key={f}>{f}</option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label htmlFor="dr-note" className="text-sm font-semibold text-ink">
                              Tasarım notunuz <span className="font-normal text-stone">· İsteğe bağlı</span>
                            </label>
                            <textarea
                              id="dr-note"
                              rows={3}
                              maxLength={2000}
                              value={prefs.note}
                              placeholder="Beğendiğiniz malzeme, renk veya yerleşim fikri…"
                              onChange={(e) => setPrefs((x) => ({ ...x, note: e.target.value }))}
                              className={`${inputCls} min-h-28 py-3`}
                            />
                          </div>
                        </div>
                        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                          <button type="button" onClick={() => go(0)} className="inline-flex min-h-12 items-center gap-2 px-1 text-[14px] font-semibold text-ink underline-offset-4 hover:underline">
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Fotoğrafa dön
                          </button>
                          <Button3D type="button" tone="ember" onClick={() => go(2)}>
                            Özeti hazırla <ArrowRight aria-hidden="true" className="h-4 w-4" />
                          </Button3D>
                        </div>
                      </section>
                    ) : null}
                  </motion.div>
                </AnimatePresence>

                {/* Son adım AnimatePresence dışında: form alanları (ad, telefon…) sunucu hatasında korunur. */}
                <section hidden={step !== 2}>
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-ember-ink uppercase">Görüşmeye hazırlık</p>
                  <h2 id={step === 2 ? "dr-title" : undefined} ref={step === 2 ? titleRef : undefined} tabIndex={-1} className="mt-3 font-display text-2xl leading-tight font-semibold text-ink outline-none sm:text-3xl">
                    Fikrinizi birlikte geliştirelim.
                  </h2>
                  <div className="mt-6 grid gap-4 rounded-2xl border border-sand bg-white p-4 sm:grid-cols-[9rem_1fr] sm:p-5">
                    {photo ? (
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-bone">
                        <Image src={photo.url} alt="" fill unoptimized sizes="9rem" className="object-cover" />
                      </div>
                    ) : null}
                    <dl className={`grid gap-x-6 gap-y-2 sm:grid-cols-2 ${photo ? "" : "sm:col-span-2"}`}>
                      {summary.map(([k, v]) => (
                        <div key={k}>
                          <dt className="text-[11px] font-semibold tracking-[0.14em] text-stone uppercase">{k}</dt>
                          <dd className="text-[14px] font-semibold text-ink">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  {state.status === "error" && state.message ? (
                    <p role="alert" className="mt-5 border-l-2 border-red-700 bg-red-50 px-4 py-3 text-[15px] text-red-800">
                      {state.message}
                    </p>
                  ) : null}
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="dr-name" className="text-sm font-semibold text-ink">
                        Ad Soyad <span className="text-ember-ink">*</span>
                      </label>
                      <input id="dr-name" name="name" autoComplete="name" defaultValue={v.name} aria-invalid={Boolean(err.name)} className={inputCls} />
                      {err.name ? <p className="mt-1.5 text-sm text-red-800">{err.name}</p> : null}
                    </div>
                    <div>
                      <label htmlFor="dr-phone" className="text-sm font-semibold text-ink">
                        Telefon <span className="text-ember-ink">*</span>
                      </label>
                      <input id="dr-phone" name="phone" type="tel" defaultValue={v.phone} inputMode="tel" autoComplete="tel" placeholder="05xx xxx xx xx" aria-invalid={Boolean(err.phone)} className={inputCls} />
                      {err.phone ? <p className="mt-1.5 text-sm text-red-800">{err.phone}</p> : null}
                    </div>
                    <div>
                      <label htmlFor="dr-email" className="text-sm font-semibold text-ink">
                        E-posta
                      </label>
                      <input id="dr-email" name="email" type="email" defaultValue={v.email} inputMode="email" autoComplete="email" aria-invalid={Boolean(err.email)} className={inputCls} />
                      {err.email ? <p className="mt-1.5 text-sm text-red-800">{err.email}</p> : null}
                    </div>
                    <div className="sm:col-span-2">
                      <Select id="dr-district" name="district" label="Proje ilçesi" options={DISTRICT_OPTIONS} defaultValue={v.district} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="flex gap-3 text-[14px] leading-relaxed text-steel">
                        <input name="kvkk" type="checkbox" aria-invalid={Boolean(err.kvkk)} className="mt-1 h-5 w-5 shrink-0 accent-ember" />
                        <span>
                          Kişisel verilerimin ve paylaştığım fotoğrafın talebimin değerlendirilmesi amacıyla işlenmesine ilişkin{" "}
                          <Link href="/kvkk" target="_blank" className="font-semibold text-ink underline underline-offset-4">
                            KVKK Aydınlatma Metni
                          </Link>
                          &apos;ni okudum, onaylıyorum. <span className="text-ember-ink">*</span>
                        </span>
                      </label>
                      {err.kvkk ? <p className="mt-1.5 text-sm text-red-800">{err.kvkk}</p> : null}
                    </div>
                  </div>
                  <p className="mt-6 text-[13px] leading-relaxed text-stone">Bilgilerinizi değerlendirip kapsamı sizinle netleştiririz ve görsel öneriyi hazırlarız. Fotoğraf yüklemek otomatik tasarım oluşturmaz.</p>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <button type="button" onClick={() => go(1)} className="inline-flex min-h-12 items-center gap-2 px-1 text-[14px] font-semibold text-ink underline-offset-4 hover:underline">
                      <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Tercihleri düzenle
                    </button>
                    <Submit />
                  </div>
                </section>
              </form>
            )}
          </div>
        </div>
      </dialog>
    </MotionConfig>
  );
}
