"use client";

import { useState } from "react";
import { AdminForm, SaveBar } from "@/components/admin/AdminForm";
import { Section, SelectInput, TextArea, TextInput } from "@/components/admin/fields";
import { createCustomerProject, updateProject } from "@/app/admin/(panel)/crm/actions";
import { checkDuplicates } from "@/app/admin/(panel)/crm/lookup";

type Opt = { value: string; label: string };
export type ProjectFormValues = {
  id?: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  title: string;
  location: string;
  stage: string;
  ownerId: string;
  nextFollowUpAt: string;
  quoteAmount: string;
  usage: string;
  chimney: string;
  notes: string;
  lostReason: string;
  source: string;
};

type Match = { id: string; label: string };

/**
 * Müşteri + proje formu (yeni kayıt ve düzenleme). Yeni kayıtta telefon/e-posta girilince eşleşen müşteriler
 * listelenir: mevcut müşteriye yeni proje eklenebilir ya da bilerek yeni müşteri açılabilir (mükerrer kayıt önlenir).
 */
export function ProjectForm({ values, stages, owners, sources, usages }: { values: ProjectFormValues; stages: Opt[]; owners: Opt[]; sources: Opt[]; usages: string[] }) {
  const isNew = !values.id;
  const [stage, setStage] = useState(values.stage);
  const [matches, setMatches] = useState<Match[]>([]);
  const [existing, setExisting] = useState("");

  async function lookup(form: HTMLFormElement) {
    if (!isNew) return;
    const fd = new FormData(form);
    const res = await checkDuplicates(String(fd.get("phone") ?? ""), String(fd.get("email") ?? ""));
    setMatches(res);
    if (!res.some((m) => m.id === existing)) setExisting("");
  }

  return (
    <AdminForm action={isNew ? createCustomerProject : updateProject}>
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section title="Müşteri">
            <div className="grid gap-5 sm:grid-cols-2" onBlur={(e) => lookup(e.currentTarget.closest("form")!)}>
              <TextInput name="name" label="Müşteri adı" required defaultValue={values.name} maxLength={160} />
              <TextInput name="phone" label="Telefon" defaultValue={values.phone} maxLength={40} inputMode="tel" />
              <TextInput name="email" label="E-posta" defaultValue={values.email} maxLength={160} type="email" />
              <SelectInput name="source" label="Kanal" defaultValue={values.source} options={sources} />
              <TextInput name="city" label="İl" defaultValue={values.city} maxLength={80} />
              <TextInput name="district" label="İlçe" defaultValue={values.district} maxLength={80} />
            </div>
            {isNew && matches.length ? (
              <div role="status" className="border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-semibold">Bu telefon veya e-posta ile kayıtlı müşteri var.</p>
                <ul className="mt-3 space-y-2">
                  {matches.map((m) => (
                    <li key={m.id}>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input type="radio" name="existingCustomerId" value={m.id} checked={existing === m.id} onChange={() => setExisting(m.id)} />
                        Mevcut müşteriye yeni proje ekle: <strong>{m.label}</strong>
                      </label>
                    </li>
                  ))}
                  <li>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input type="radio" name="confirmNew" value="1" checked={existing === "new"} onChange={() => setExisting("new")} />
                      Yine de yeni müşteri oluştur
                    </label>
                  </li>
                </ul>
              </div>
            ) : null}
          </Section>

          <Section title="Proje">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput name="title" label="Ürün veya şömine türü" required defaultValue={values.title} maxLength={160} placeholder="ör. L tipi odunlu şömine" />
              <TextInput name="location" label="Uygulama yeri (il / ilçe)" defaultValue={values.location} maxLength={160} />
              <SelectInput name="usage" label="Kullanım amacı" defaultValue={values.usage} placeholder="Seçilmedi" options={usages.map((u) => ({ value: u, label: u }))} />
              <TextInput name="chimney" label="Baca durumu" defaultValue={values.chimney} maxLength={200} placeholder="ör. Mevcut baca — teknik inceleme bekliyor" />
            </div>
            <TextArea name="notes" label="Proje notları" defaultValue={values.notes} maxLength={4000} rows={4} />
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Süreç">
            <SelectInput name="stage" label="Aşama" value={stage} onChange={(e) => setStage(e.target.value)} options={stages} />
            {stage === "LOST" ? <TextInput name="lostReason" label="Kaybedilme nedeni" defaultValue={values.lostReason} maxLength={300} /> : null}
            <SelectInput name="ownerId" label="Sorumlu" defaultValue={values.ownerId} placeholder="Atanmadı" options={owners} />
            <TextInput name="nextFollowUpAt" label="Sonraki takip tarihi" type="date" defaultValue={values.nextFollowUpAt} />
            <TextInput name="quoteAmount" label="Teklif tutarı (TL)" inputMode="decimal" defaultValue={values.quoteAmount} hint="Girilen teklif; ciro veya tahsilat değildir." />
          </Section>
        </div>
      </div>
      <SaveBar label={isNew ? "Kaydı oluştur" : undefined} />
    </AdminForm>
  );
}
