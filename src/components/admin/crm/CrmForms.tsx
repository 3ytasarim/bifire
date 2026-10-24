"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { AdminForm } from "@/components/admin/AdminForm";
import { SelectInput, TextArea, TextInput } from "@/components/admin/fields";
import { addActivity, createTask } from "@/app/admin/(panel)/crm/actions";

type Opt = { value: string; label: string };

function Submit({ label }: { label: string }) {
  return (
    <button type="submit" className="inline-flex min-h-10 items-center bg-ink px-4 text-sm font-semibold text-white hover:bg-graphite">
      {label}
    </button>
  );
}

/** Görüşme notu: tür + not + isteğe bağlı sonraki takip tarihi. */
export function ActivityForm({ projectId, types }: { projectId: string; types: Opt[] }) {
  return (
    <AdminForm action={addActivity} resetOnSuccess className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectInput name="type" label="Tür" defaultValue="CALL" options={types} />
        <TextInput name="nextFollowUpAt" label="Sonraki takip (isteğe bağlı)" type="date" />
      </div>
      <TextArea name="body" label="Görüşme notu" rows={3} maxLength={4000} required />
      <Submit label="Görüşmeyi kaydet" />
    </AdminForm>
  );
}

/** Görev ekleme (proje kartında veya Görevler ekranında). */
export function TaskForm({ projectId, owners, projects }: { projectId?: string; owners: Opt[]; projects?: Opt[] }) {
  return (
    <AdminForm action={createTask} resetOnSuccess className="space-y-4">
      {projectId ? <input type="hidden" name="projectId" value={projectId} /> : null}
      <TextInput name="title" label="Görev" required maxLength={200} placeholder="ör. Showroom gün ve saatini teyit edin" />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput name="dueAt" label="Tarih" type="date" required />
        <SelectInput name="assigneeId" label="Sorumlu" placeholder="Atanmadı" options={owners} />
      </div>
      {projects ? <SelectInput name="projectId" label="Proje (isteğe bağlı)" placeholder="Projesiz görev" options={projects} /> : null}
      <Submit label="Görev ekle" />
    </AdminForm>
  );
}

/** Hızlı aşama değiştirici: seçince form gönderilir (JS yoksa "Değiştir" düğmesi). */
export function StageSelect({ id, stage, stages, action, compact }: { id: string; stage: string; stages: Opt[]; action: (fd: FormData) => Promise<void>; compact?: boolean }) {
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <label className="sr-only" htmlFor={`stage-${id}`}>
        Aşama
      </label>
      <select
        id={`stage-${id}`}
        name="stage"
        defaultValue={stage}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={`border border-neutral-300 bg-white text-sm outline-none focus:border-ink ${compact ? "min-h-8 w-full px-1.5 text-xs" : "min-h-10 px-2"}`}
      >
        {stages.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="min-h-8 border border-neutral-300 px-2 text-xs">
          Değiştir
        </button>
      </noscript>
    </form>
  );
}

/**
 * Hazır mesaj: şablon seçilir, [Ad] müşteri adıyla doldurulur, metin düzenlenip kopyalanır veya WhatsApp'ta
 * hazır metinle açılır. Otomatik gönderim yoktur — mesajı ekip elle gönderir.
 */
export function MessagePicker({ templates, name, phone }: { templates: { id: string; title: string; body: string }[]; name: string; phone?: string | null }) {
  const first = name.trim().split(/\s+/)[0] ?? name;
  const fill = (body: string) => body.replace(/\[Ad\]/g, first);
  const [tid, setTid] = useState(templates[0]?.id ?? "");
  const [text, setText] = useState(templates[0] ? fill(templates[0].body) : "");
  const [copied, setCopied] = useState(false);
  const wa = useMemo(() => {
    const digits = (phone ?? "").replace(/\D/g, "");
    const intl = digits.length === 10 ? `90${digits}` : digits.length === 11 && digits.startsWith("0") ? `9${digits}` : digits;
    return intl.length >= 11 ? `https://wa.me/${intl}?text=${encodeURIComponent(text)}` : null;
  }, [phone, text]);
  const open = /\[[^\]]+\]/.test(text);

  if (!templates.length) return <p className="text-sm text-neutral-500">Hazır mesaj yok. CRM › Hazır mesajlar ekranından ekleyebilirsiniz.</p>;
  return (
    <div className="space-y-3">
      <select
        aria-label="Mesaj türü"
        value={tid}
        onChange={(e) => {
          setTid(e.target.value);
          const t = templates.find((x) => x.id === e.target.value);
          setText(t ? fill(t.body) : "");
          setCopied(false);
        }}
        className="min-h-10 w-full border border-neutral-300 bg-white px-2 text-sm outline-none focus:border-ink"
      >
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.title}
          </option>
        ))}
      </select>
      <textarea aria-label="Düzenlenebilir mesaj" value={text} onChange={(e) => setText(e.target.value)} rows={6} className="block w-full border border-neutral-300 bg-white p-3 text-sm outline-none focus:border-ink" />
      {open ? <p className="text-xs text-amber-700">Köşeli parantezli alanları tamamlayın.</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(text);
            setCopied(true);
          }}
          className="inline-flex min-h-10 items-center gap-2 border border-neutral-300 bg-white px-3 text-sm font-semibold hover:border-ink"
        >
          {copied ? <Check aria-hidden="true" className="h-4 w-4 text-emerald-600" /> : <Copy aria-hidden="true" className="h-4 w-4" />} {copied ? "Kopyalandı" : "Mesajı kopyala"}
        </button>
        {wa ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 bg-[#1f7a4a] px-3 text-sm font-semibold text-white hover:opacity-90">
            <MessageCircle aria-hidden="true" className="h-4 w-4" /> WhatsApp&apos;ta aç
          </a>
        ) : null}
      </div>
      <p className="text-xs text-neutral-500">Otomatik gönderim yapılmaz; mesajı kontrol edip siz gönderirsiniz. Teknik uygunluk, kesin fiyat ve montaj tarihi ekip onayıyla paylaşılır.</p>
    </div>
  );
}
