"use client";

import { useMemo, useState } from "react";
import { useMarkDirty } from "./AdminForm";

/** Aramalı çoklu seçim (ilişkili ürünler vb.). Seçimler `name` adlı çoklu checkbox değerleri olarak gönderilir. */
export function MultiPicker({ name, options, defaultValue, label }: { name: string; label: string; options: { id: string; label: string; hint?: string }[]; defaultValue: string[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultValue));
  const [q, setQ] = useState("");
  const markDirty = useMarkDirty();
  const filtered = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("tr");
    return term ? options.filter((o) => `${o.label} ${o.hint ?? ""}`.toLocaleLowerCase("tr").includes(term)) : options;
  }, [q, options]);

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-neutral-800">
        {label} <span className="font-normal text-neutral-500">({selected.size} seçili)</span>
      </legend>
      {[...selected].map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ara…"
        aria-label={`${label} içinde ara`}
        className="mb-2 block min-h-10 w-full border border-neutral-300 px-3 text-sm outline-none focus:border-ink"
      />
      <ul className="max-h-64 overflow-y-auto border border-neutral-200 bg-white">
        {filtered.length ? (
          filtered.map((o) => (
            <li key={o.id}>
              <label className="flex min-h-10 cursor-pointer items-center gap-3 px-3 text-sm hover:bg-neutral-50">
                <input
                  type="checkbox"
                  checked={selected.has(o.id)}
                  onChange={() => {
                    setSelected((prev) => {
                      const next = new Set(prev);
                      if (next.has(o.id)) next.delete(o.id);
                      else next.add(o.id);
                      return next;
                    });
                    markDirty();
                  }}
                  className="h-4 w-4 accent-ink"
                />
                <span className="flex-1">{o.label}</span>
                {o.hint ? <span className="text-xs text-neutral-400">{o.hint}</span> : null}
              </label>
            </li>
          ))
        ) : (
          <li className="px-3 py-4 text-sm text-neutral-500">Sonuç yok.</li>
        )}
      </ul>
    </fieldset>
  );
}
