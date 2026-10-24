"use client";

import { AdminForm } from "@/components/admin/AdminForm";
import { Checkbox, TextArea, TextInput } from "@/components/admin/fields";
import { saveTemplate } from "@/app/admin/(panel)/crm/actions";

export function TemplateForm({ values }: { values: { id?: string; title: string; body: string; sortOrder: number; active: boolean } }) {
  return (
    <AdminForm action={saveTemplate} className="space-y-4">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-[1fr_6rem]">
        <TextInput name="title" label="Mesaj türü" required defaultValue={values.title} maxLength={120} />
        <TextInput name="sortOrder" label="Sıra" type="number" min={0} max={999} defaultValue={values.sortOrder} />
      </div>
      <TextArea name="body" label="Metin" required rows={5} defaultValue={values.body} maxLength={2000} />
      <div className="flex items-center justify-between gap-4">
        <Checkbox name="active" label="Proje kartında göster" defaultChecked={values.active} />
        <button type="submit" className="inline-flex min-h-10 items-center bg-ink px-4 text-sm font-semibold text-white hover:bg-graphite">
          Kaydet
        </button>
      </div>
    </AdminForm>
  );
}
