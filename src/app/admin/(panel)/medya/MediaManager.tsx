"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Copy, Loader2, Trash2, Upload } from "lucide-react";
import { deleteMediaAction, updateMediaAltAction, uploadImageAction, type MediaItem } from "./actions";

export function MediaManager({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [alt, setAlt] = useState("");
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();

  function pick(m: MediaItem) {
    setSelected(m);
    setAlt(m.alt ?? "");
    setMsg(null);
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setMsg(null);
    const errors: string[] = [];
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.set("file", f);
      const res = await uploadImageAction(fd);
      if (!res.ok) errors.push(`${f.name}: ${res.error}`);
    }
    setUploading(false);
    setMsg(errors.length ? { tone: "err", text: errors.join(" · ") } : { tone: "ok", text: `${files.length} görsel yüklendi.` });
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div>
        <label className="mb-4 flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-neutral-300 bg-white text-sm text-neutral-600 hover:border-ink">
          {uploading ? <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin" /> : <Upload aria-hidden="true" className="h-6 w-6" />}
          {uploading ? "Yükleniyor…" : "Görsel yüklemek için tıklayın (JPG, PNG, WebP, AVIF — en fazla 10 MB)"}
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" disabled={uploading} onChange={(e) => upload(e.target.files).then(() => (e.target.value = ""))} />
        </label>
        {msg ? <p className={`mb-4 border px-4 py-3 text-sm ${msg.tone === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>{msg.text}</p> : null}
        {items.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {items.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => pick(m)} aria-pressed={selected?.id === m.id} className={`relative block aspect-square w-full overflow-hidden bg-neutral-200 ${selected?.id === m.id ? "ring-3 ring-ember" : "hover:ring-2 hover:ring-neutral-400"}`}>
                  <Image src={m.url} alt={m.alt ?? ""} fill sizes="180px" className="object-cover" />
                  {!m.alt ? <span className="absolute top-1 left-1 bg-amber-100 px-1.5 text-[10px] font-semibold text-amber-800">alt yok</span> : null}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-16 text-center text-sm text-neutral-500">Henüz görsel yok.</p>
        )}
      </div>

      <aside className="h-fit border border-neutral-200 bg-white p-5 xl:sticky xl:top-8">
        {selected ? (
          <div className="space-y-4">
            <div className="relative aspect-[4/3] bg-neutral-100">
              <Image src={selected.url} alt={selected.alt ?? ""} fill sizes="340px" className="object-contain" />
            </div>
            <dl className="grid grid-cols-[90px_1fr] gap-y-1 text-xs">
              <dt className="text-neutral-500">Dosya</dt>
              <dd className="break-all">{selected.originalName}</dd>
              <dt className="text-neutral-500">Ölçü</dt>
              <dd>
                {selected.width}×{selected.height}px
              </dd>
              <dt className="text-neutral-500">Boyut</dt>
              <dd>{(selected.size / 1024).toFixed(0)} KB</dd>
              <dt className="text-neutral-500">Adres</dt>
              <dd className="break-all">{selected.url}</dd>
            </dl>
            <button type="button" onClick={() => navigator.clipboard?.writeText(selected.url)} className="inline-flex min-h-9 items-center gap-1.5 border border-neutral-300 px-3 text-xs hover:border-ink">
              <Copy aria-hidden="true" className="h-3.5 w-3.5" /> Adresi kopyala
            </button>
            <div>
              <label htmlFor="media-alt" className="mb-1 block text-sm font-medium">
                Alt metin
              </label>
              <textarea id="media-alt" value={alt} onChange={(e) => setAlt(e.target.value)} rows={3} maxLength={250} className="block w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-ink" />
              <p className="mt-1 text-xs text-neutral-500">Görseli yeni seçen formlarda varsayılan alt metin olarak kullanılır.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await updateMediaAltAction(selected.id, alt);
                    setSelected({ ...selected, alt });
                    setMsg({ tone: "ok", text: "Alt metin kaydedildi." });
                    router.refresh();
                  })
                }
                className="min-h-10 flex-1 bg-ink px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                Kaydet
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (!window.confirm("Görsel kalıcı olarak silinsin mi? (Kullanımdaysa silinmez.)")) return;
                  start(async () => {
                    const res = await deleteMediaAction(selected.id);
                    if (!res.ok) return setMsg({ tone: "err", text: res.error });
                    setSelected(null);
                    setMsg({ tone: "ok", text: "Görsel silindi." });
                    router.refresh();
                  });
                }}
                className="inline-flex min-h-10 items-center gap-1.5 px-3 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" /> Sil
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">Ayrıntıları görmek, alt metni düzenlemek veya silmek için bir görsel seçin.</p>
        )}
      </aside>
    </div>
  );
}
