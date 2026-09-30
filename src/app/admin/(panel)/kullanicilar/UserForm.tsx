"use client";

import { AdminForm, SaveBar } from "@/components/admin/AdminForm";
import { Checkbox, Section, SelectInput, TextInput } from "@/components/admin/fields";
import { saveUser } from "./actions";

const ROLES = [
  { value: "EDITOR", label: "Editör — içerik ve talepler" },
  { value: "ADMIN", label: "Yönetici — + silme, ayarlar, kullanıcılar" },
  { value: "SUPERADMIN", label: "Süper yönetici" },
];

export function UserForm({ user }: { user?: { id: string; name: string; email: string; role: string; active: boolean } | null }) {
  return (
    <AdminForm action={saveUser} className="max-w-2xl">
      {user ? <input type="hidden" name="id" value={user.id} /> : null}
      <Section title={user ? "Kullanıcıyı düzenle" : "Yeni kullanıcı"}>
        <TextInput name="name" label="Ad soyad" required defaultValue={user?.name ?? ""} maxLength={120} autoComplete="off" />
        <TextInput name="email" label="E-posta" type="email" required defaultValue={user?.email ?? ""} maxLength={160} autoComplete="off" />
        <SelectInput name="role" label="Rol" defaultValue={user?.role ?? "EDITOR"} options={ROLES} />
        <TextInput name="password" label={user ? "Yeni şifre (değiştirmek için)" : "Şifre"} type="password" required={!user} autoComplete="new-password" hint="En az 10 karakter. Kullanıcıya güvenli bir kanaldan iletin; ilk girişte Profilim'den değiştirmesini isteyin." />
        <Checkbox name="active" label="Aktif" defaultChecked={user?.active ?? true} hint="Pasif kullanıcı giriş yapamaz; açık oturumları kapatılır." />
      </Section>
      <SaveBar />
    </AdminForm>
  );
}
