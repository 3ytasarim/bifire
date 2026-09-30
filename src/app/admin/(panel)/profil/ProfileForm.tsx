"use client";

import { AdminForm, SaveBar } from "@/components/admin/AdminForm";
import { Section, TextInput } from "@/components/admin/fields";
import { updateProfile } from "../kullanicilar/actions";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  return (
    <AdminForm action={updateProfile} className="max-w-2xl">
      <Section title="Bilgiler">
        <TextInput name="name" label="Ad soyad" required defaultValue={name} maxLength={120} />
        <p className="text-sm text-neutral-500">E-posta: {email}</p>
      </Section>
      <div className="mt-6">
        <Section title="Şifre değiştir" description="Değiştirmek istemiyorsanız boş bırakın.">
          <TextInput name="currentPassword" label="Mevcut şifre" type="password" autoComplete="current-password" />
          <TextInput name="newPassword" label="Yeni şifre" type="password" autoComplete="new-password" hint="En az 10 karakter." />
          <TextInput name="confirmPassword" label="Yeni şifre (tekrar)" type="password" autoComplete="new-password" />
        </Section>
      </div>
      <SaveBar />
    </AdminForm>
  );
}
