"use client";

import { useRef, useState } from "react";
import { Film, Loader2, Trash2, Upload } from "lucide-react";
import { listMediaAction, uploadVideoAction, type MediaItem } from "@/app/admin/(panel)/medya/actions";
import { useFieldError, useMarkDirty } from "./AdminForm";
import { currentTitle } from "./form-title";

/**
 * Tek video alanı (slider arka planı): önizleme + bilgisayardan yükle + daha önce yüklenen videolardan seç + kaldır.
 * Değer gizli input'ta (`name`) URL olarak tutulur. Yükleme sırasında ilerleme gösterilmez (tek istek), düğme kilitlenir.
 */
export function VideoPicker({ name, label, defaultValue, hint, aspect = "aspect-video" }: { name: string; label: string; defaultValue?: string | null; hint?: string; aspect?: string }) {
  const [url, setUrlState] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [library, setLibrary] = useState<MediaItem[] | null>(null);
  const markDirty = useMarkDirty();
  const fieldError = useFieldError(name);
  const rootRef = useRef<HTMLDivElement>(null);

  const setUrl = (v: string) => {
    setUrlState(v);
    markDirty();
  };

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    const hint = currentTitle(rootRef.current);
    if (hint) fd.set("nameHint", `${hint} video`);
    const res = await uploadVideoAction(fd);
    setBusy(false);
    if (res.ok) setUrl(res.data.url);
    else setError(res.error);
  }

  return (
    <div ref={rootRef}>
      <p className="mb-1.5 text-sm font-medium text-neutral-800">{label}</p>
      <input type="hidden" name={name} value={url} />
      <div className={`relative ${aspect} w-full overflow-hidden rounded-lg border border-dashed ${fieldError ? "border-red-500" : "border-neutral-300"} bg-neutral-900`}>
        {url ? (
          // Önizleme: sessiz, döngülü, kontrollü
          <video key={url} src={url} muted loop playsInline autoPlay controls className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-neutral-400">
            <Film aria-hidden="true" className="h-7 w-7" />
            Video seçilmedi
          </div>
        )}
        {busy ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-sm text-white">
            <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin" />
            Video yükleniyor…
          </div>
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <label className={`inline-flex min-h-10 cursor-pointer items-center gap-2 border border-neutral-300 bg-white px-3 text-sm hover:border-ink ${busy ? "pointer-events-none opacity-50" : ""}`}>
          <Upload aria-hidden="true" className="h-4 w-4" /> Video yükle
          <input type="file" accept="video/mp4,video/webm" className="sr-only" disabled={busy} onChange={(e) => upload(e.target.files?.[0]).then(() => (e.target.value = ""))} />
        </label>
        <button
          type="button"
          onClick={async () => setLibrary((await listMediaAction("", 1, "video")).items)}
          className="min-h-10 border border-neutral-300 bg-white px-3 text-sm hover:border-ink"
        >
          Yüklenmiş videolardan seç
        </button>
        {url ? (
          <button type="button" onClick={() => setUrl("")} className="inline-flex min-h-10 items-center gap-1.5 px-3 text-sm text-red-700 hover:bg-red-50">
            <Trash2 aria-hidden="true" className="h-4 w-4" /> Kaldır
          </button>
        ) : null}
      </div>
      {library ? (
        library.length ? (
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {library.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => {
                    setUrl(v.url);
                    setLibrary(null);
                  }}
                  className="block w-full overflow-hidden rounded border border-neutral-200 text-left hover:border-ink"
                >
                  <video src={v.url} muted preload="metadata" playsInline className="aspect-video w-full bg-neutral-900 object-cover" />
                  <span className="block truncate px-2 py-1 text-xs text-neutral-600">{v.originalName}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-neutral-500">Henüz yüklenmiş video yok.</p>
        )
      ) : null}
      {hint ? <p className="mt-1.5 text-xs text-neutral-500">{hint}</p> : null}
      {error || fieldError ? <p className="mt-1.5 text-sm text-red-700">{error || fieldError}</p> : null}
    </div>
  );
}
