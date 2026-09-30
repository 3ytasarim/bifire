"use client";

import { useState } from "react";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { uploadDocumentAction } from "@/app/admin/(panel)/medya/actions";
import { useMarkDirty } from "./AdminForm";

export type DocItem = { title: string; url: string; mimeType: string; size: number };

/** Ürün dokümanları (PDF katalog, teknik çizim). */
export function DocumentsEditor({ name, defaultValue }: { name: string; defaultValue: DocItem[] }) {
  const [docs, setDocsState] = useState<DocItem[]>(defaultValue);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const markDirty = useMarkDirty();
  const setDocs = (fn: (prev: DocItem[]) => DocItem[]) => {
    setDocsState(fn);
    markDirty();
  };

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!title.trim()) return setError("Önce doküman başlığı yazın (ör. “Teknik çizim”).");
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("title", title);
    const res = await uploadDocumentAction(fd);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setDocs((prev) => [...prev, { title: title.trim(), ...res.data }]);
    setTitle("");
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(docs)} />
      {docs.length ? (
        <ul className="mb-3 divide-y divide-neutral-200 border border-neutral-200 bg-white">
          {docs.map((d, i) => (
            <li key={d.url} className="flex items-center gap-3 p-3 text-sm">
              <FileText aria-hidden="true" className="h-5 w-5 shrink-0 text-ember-ink" />
              <input
                aria-label="Doküman başlığı"
                value={d.title}
                maxLength={160}
                onChange={(e) => setDocs((prev) => prev.map((x, n) => (n === i ? { ...x, title: e.target.value } : x)))}
                className="min-h-9 min-w-0 flex-1 border border-transparent px-2 hover:border-neutral-300 focus:border-ink focus:outline-none"
              />
              <a href={d.url} target="_blank" rel="noopener" className="text-neutral-500 underline">
                Aç
              </a>
              <span className="text-neutral-400">{(d.size / 1024 / 1024).toFixed(1)} MB</span>
              <button type="button" onClick={() => setDocs((prev) => prev.filter((_, n) => n !== i))} aria-label="Dokümanı kaldır" className="flex h-9 w-9 items-center justify-center text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Doküman başlığı"
          aria-label="Yeni doküman başlığı"
          maxLength={160}
          className="min-h-10 min-w-0 flex-1 border border-neutral-300 px-3 text-sm outline-none focus:border-ink"
        />
        <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 border border-neutral-300 bg-white px-3 text-sm hover:border-ink">
          {busy ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Upload aria-hidden="true" className="h-4 w-4" />}
          PDF yükle
          <input type="file" accept="application/pdf" className="sr-only" disabled={busy} onChange={(e) => upload(e.target.files?.[0]).then(() => (e.target.value = ""))} />
        </label>
      </div>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
