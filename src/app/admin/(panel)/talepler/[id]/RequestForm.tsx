"use client";

import { AdminForm, SaveBar } from "@/components/admin/AdminForm";
import { SelectInput, TextArea } from "@/components/admin/fields";
import { updateRequest } from "../actions";

export function RequestStatusForm({ id, status, adminNote, options }: { id: string; status: string; adminNote: string | null; options: { value: string; label: string }[] }) {
  return (
    <AdminForm action={updateRequest} className="border border-neutral-200 bg-white p-5">
      <input type="hidden" name="id" value={id} />
      <div className="space-y-5">
        <SelectInput name="status" label="Durum" defaultValue={status} options={options} />
        <TextArea name="adminNote" label="İç not" rows={6} defaultValue={adminNote ?? ""} maxLength={4000} hint="Yalnızca yöneticiler görür (ör. arama sonucu, teklif tutarı, keşif tarihi)." />
      </div>
      <SaveBar />
    </AdminForm>
  );
}
