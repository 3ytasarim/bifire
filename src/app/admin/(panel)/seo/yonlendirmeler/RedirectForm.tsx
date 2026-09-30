"use client";

import { AdminForm, SaveBar } from "@/components/admin/AdminForm";
import { SelectInput, TextInput } from "@/components/admin/fields";
import { saveRedirect } from "../actions";

export function RedirectForm() {
  return (
    <AdminForm action={saveRedirect} resetOnSuccess className="border border-neutral-200 bg-white p-5">
      <h2 className="mb-4 font-semibold">Yönlendirme ekle</h2>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_140px]">
        <TextInput name="sourcePath" label="Eski adres" placeholder="/eski-urun-adresi" required maxLength={500} />
        <TextInput name="destinationPath" label="Yeni adres" placeholder="/urun/yeni-adres" required maxLength={500} />
        <SelectInput name="statusCode" label="Tür" defaultValue="301" options={[{ value: "301", label: "301 Kalıcı" }, { value: "302", label: "302 Geçici" }, { value: "308", label: "308 Kalıcı" }]} />
      </div>
      <div className="mt-4">
        <TextInput name="note" label="Not" maxLength={200} />
      </div>
      <SaveBar label="Ekle" />
    </AdminForm>
  );
}
