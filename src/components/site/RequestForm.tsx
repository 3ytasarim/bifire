"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
import { submitRequest, type RequestFormState } from "@/app/(site)/actions";
import { Button3D } from "@/components/ui/button-3d";
import { PROJECT_STAGES, PROJECT_TIMELINES, PROJECT_TOPICS } from "@/content/company";
import { DISTRICT_OPTIONS } from "@/content/regions";
import { selectionStore } from "@/lib/selection-store";

type Option = { id: string; name: string };

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button3D type="submit" disabled={pending} aria-disabled={pending} tone="ember" className="w-full sm:w-auto">
      {pending ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
      {pending ? "Gönderiliyor…" : label}
      {!pending ? <ArrowRight aria-hidden="true" className="h-4 w-4" /> : null}
    </Button3D>
  );
}

const inputCls =
  "mt-2 block min-h-12 w-full rounded-xl border border-sand bg-white px-4 text-[16px] text-ink transition-colors outline-none placeholder:text-stone/70 focus:border-ink aria-[invalid=true]:border-red-700";

function Select({ id, name, label, options, defaultValue, placeholder = "Seçiniz" }: { id: string; name: string; label: string; options: readonly string[]; defaultValue?: string; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        <select id={id} name={name} defaultValue={defaultValue ?? ""} className={`${inputCls} appearance-none pr-10`}>
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 mt-1 h-4 w-4 -translate-y-1/2 text-steel" />
      </div>
    </div>
  );
}

/**
 * İletişim + teklif + showroom randevusu + proje başvurusu formu (tüm sayfalarda ortak).
 * - `showroomToggle`: "Proje teklifi / Showroom randevusu" seçimi (talep türünü değiştirir).
 * - `district`: proje ilçesi; `project`: konu, proje aşaması ve uygulama dönemi alanları.
 * - Ürün sayfasında seçilen seçenekler (selectionStore) gizli alanla gönderilir ve formda gösterilir.
 * Durumlar: yükleniyor (buton kilitli → çift gönderim yok), alan hataları, sunucu hatası, başarı.
 */
export function RequestForm({
  type,
  categories,
  products,
  defaultProductId,
  defaultCategoryId,
  sourcePath,
  submitLabel = "Gönder",
  compact,
  showroomToggle,
  district,
  defaultDistrict,
  project,
  selectionOverride,
  idPrefix,
}: {
  /** Seçim deposu yerine gönderilecek seçim özeti (ör. seçim rehberi yanıtları + ürün seçimi). */
  selectionOverride?: string;
  /** Aynı sayfada iki form varsa alan id çakışmasını önler. */
  idPrefix?: string;
  type: "CONTACT" | "QUOTE" | "SHOWROOM";
  showroomToggle?: boolean;
  district?: boolean;
  defaultDistrict?: string;
  project?: boolean;
  categories: Option[];
  products: (Option & { categoryId: string })[];
  defaultProductId?: string;
  defaultCategoryId?: string;
  sourcePath: string;
  submitLabel?: string;
  compact?: boolean;
}) {
  const [state, action] = useActionState<RequestFormState, FormData>(submitRequest, { status: "idle" });
  const startedAt = useRef(0);
  const [categoryId, setCategoryId] = useState(defaultCategoryId ?? "");
  const [reqType, setReqType] = useState(type);
  const storeSelection = useSyncExternalStore(selectionStore.subscribe, selectionStore.get, selectionStore.getServer);
  const selection = selectionOverride ?? storeSelection;
  const statusRef = useRef<HTMLDivElement>(null);

  // Formun açılış zamanı (bot tuzağı) ref'te tutulur ve gönderim anında FormData'ya eklenir. DOM alanı
  // kullanılmaz: React 19 form action'ı hata sonrası formu sıfırlar; alan 0'a dönerse ilk denemesi hatalı
  // olan gerçek kullanıcı "bot" sanılıp talebi sessizce atılırdı.
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const submit = (fd: FormData) => {
    fd.set("startedAt", String(startedAt.current));
    action(fd);
  };
  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="rounded-2xl border border-linen bg-white p-8 outline-none sm:p-10">
        <CheckCircle2 aria-hidden="true" className="h-10 w-10 text-ember" />
        <p className="mt-5 font-display text-2xl font-semibold text-ink">Talebiniz alındı</p>
        <p className="mt-3 text-steel">{state.message}</p>
      </div>
    );
  }

  const v = state.values ?? {};
  const err = state.errors ?? {};
  const visibleProducts = categoryId ? products.filter((p) => p.categoryId === categoryId) : products;
  const fieldId = (n: string) => `${idPrefix ?? type.toLowerCase()}-${n}`;
  // Yarım genişlikli alan sayısı tekse son seçim kutusu tam genişliğe yayılır (boş hücre kalmasın).
  const oddHalf = [district, project, project, project].filter(Boolean).length % 2 === 1;

  return (
    <form action={submit} noValidate className="space-y-6">
      <input type="hidden" name="type" value={reqType} />
      <input type="hidden" name="sourcePath" value={sourcePath} />
      <input type="hidden" name="selection" value={selection} />
      {/* Honeypot: insanlar görmez/doldurmaz */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={fieldId("website")}>Web siteniz</label>
        <input id={fieldId("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div ref={statusRef} tabIndex={-1} className="outline-none" aria-live="assertive">
        {state.status === "error" && state.message ? (
          <p role="alert" className="border-l-2 border-red-700 bg-red-50 px-4 py-3 text-[15px] text-red-800">
            {state.message}
          </p>
        ) : null}
      </div>

      {showroomToggle ? (
        <fieldset>
          <legend className="text-sm font-semibold text-ink">Talebiniz</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-bone p-1.5">
            {(
              [
                ["QUOTE", "Proje teklifi"],
                ["SHOWROOM", "Showroom randevusu"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl px-3 text-center text-[14px] font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ember ${reqType === value ? "bg-white text-ink shadow-sm" : "text-steel hover:text-ink"}`}
              >
                <input type="radio" name="_reqType" value={value} checked={reqType === value} onChange={() => setReqType(value)} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {selection ? (
        <p className="flex flex-wrap items-center gap-2 rounded-2xl border border-ember/30 bg-ember/5 px-4 py-3 text-[14px] text-ink">
          <span className="text-[11px] font-semibold tracking-[0.18em] text-ember-ink uppercase">Seçiminiz</span>
          <span className="font-semibold">{selection}</span>
        </p>
      ) : null}

      <div className={`grid gap-6 ${compact ? "" : "sm:grid-cols-2"}`}>
        <div className={compact ? "" : "sm:col-span-2"}>
          <label htmlFor={fieldId("name")} className="text-sm font-semibold text-ink">
            Ad Soyad <span className="text-ember-ink">*</span>
          </label>
          <input
            id={fieldId("name")}
            name="name"
            autoComplete="name"
            required
            defaultValue={v.name}
            aria-invalid={Boolean(err.name)}
            aria-describedby={err.name ? fieldId("name-err") : undefined}
            className={inputCls}
          />
          {err.name ? <p id={fieldId("name-err")} className="mt-1.5 text-sm text-red-800">{err.name}</p> : null}
        </div>
        <div>
          <label htmlFor={fieldId("phone")} className="text-sm font-semibold text-ink">
            Telefon <span className="text-ember-ink">*</span>
          </label>
          <input
            id={fieldId("phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder="05xx xxx xx xx"
            defaultValue={v.phone}
            aria-invalid={Boolean(err.phone)}
            aria-describedby={err.phone ? fieldId("phone-err") : undefined}
            className={inputCls}
          />
          {err.phone ? <p id={fieldId("phone-err")} className="mt-1.5 text-sm text-red-800">{err.phone}</p> : null}
        </div>
        <div>
          <label htmlFor={fieldId("email")} className="text-sm font-semibold text-ink">
            E-posta
          </label>
          <input
            id={fieldId("email")}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            defaultValue={v.email}
            aria-invalid={Boolean(err.email)}
            aria-describedby={err.email ? fieldId("email-err") : undefined}
            className={inputCls}
          />
          {err.email ? <p id={fieldId("email-err")} className="mt-1.5 text-sm text-red-800">{err.email}</p> : null}
        </div>
        {district ? <Select id={fieldId("district")} name="district" label="Proje ilçesi" options={DISTRICT_OPTIONS} defaultValue={v.district ?? defaultDistrict} /> : null}
        {project ? (
          <>
            <Select id={fieldId("topic")} name="topic" label="İlgilendiğiniz konu" options={PROJECT_TOPICS} defaultValue={v.topic} />
            <Select id={fieldId("stage")} name="projectStage" label="Proje aşaması" options={PROJECT_STAGES} defaultValue={v.projectStage} />
            <Select id={fieldId("timeline")} name="timeline" label="Uygulama dönemi" options={PROJECT_TIMELINES} defaultValue={v.timeline} />
          </>
        ) : null}
        <div>
          <label htmlFor={fieldId("category")} className="text-sm font-semibold text-ink">
            İlgilendiğiniz kategori
          </label>
          <div className="relative">
            <select
              id={fieldId("category")}
              name="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={`${inputCls} appearance-none pr-10`}
            >
              <option value="">Seçiniz</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 mt-1 h-4 w-4 -translate-y-1/2 text-steel" />
          </div>
        </div>
        <div className={oddHalf && !compact ? "sm:col-span-2" : undefined}>
          <label htmlFor={fieldId("product")} className="text-sm font-semibold text-ink">
            İlgilendiğiniz ürün
          </label>
          <div className="relative">
            <select
              id={fieldId("product")}
              name="productId"
              defaultValue={v.productId ?? defaultProductId ?? ""}
              key={categoryId}
              className={`${inputCls} appearance-none pr-10`}
            >
              <option value="">Seçiniz</option>
              {visibleProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 mt-1 h-4 w-4 -translate-y-1/2 text-steel" />
          </div>
        </div>
        <div className={compact ? "" : "sm:col-span-2"}>
          <label htmlFor={fieldId("message")} className="text-sm font-semibold text-ink">
            Mesajınız
          </label>
          <textarea
            id={fieldId("message")}
            name="message"
            rows={compact ? 4 : 5}
            maxLength={3000}
            defaultValue={v.message}
            placeholder={
              reqType === "SHOWROOM"
                ? "Görmek istediğiniz model veya malzeme, size uygun gün ve saat…"
                : reqType === "QUOTE"
                  ? "Mekân ölçüleri, şömine yerleşimi, baca durumu ve beklentileriniz…"
                  : "Size nasıl yardımcı olabiliriz?"
            }
            className={`${inputCls} min-h-32 py-3`}
          />
        </div>
      </div>

      <div>
        <label className="flex items-start gap-3 text-[14px] leading-relaxed text-steel">
          <input
            name="kvkk"
            type="checkbox"
            required
            aria-invalid={Boolean(err.kvkk)}
            aria-describedby={err.kvkk ? fieldId("kvkk-err") : undefined}
            className="mt-1 h-5 w-5 shrink-0 accent-ember"
          />
          <span>
            Kişisel verilerimin talebimin yanıtlanması amacıyla işlenmesine ilişkin{" "}
            <Link href="/kvkk" target="_blank" className="font-semibold text-ink underline underline-offset-4">
              KVKK Aydınlatma Metni
            </Link>
            &apos;ni okudum, onaylıyorum. <span className="text-ember-ink">*</span>
          </span>
        </label>
        {err.kvkk ? <p id={fieldId("kvkk-err")} className="mt-1.5 text-sm text-red-800">{err.kvkk}</p> : null}
      </div>

      <Submit label={submitLabel} />
    </form>
  );
}
