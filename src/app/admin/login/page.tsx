import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Giriş" };

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/admin");
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <span aria-hidden="true" className="ember-placeholder absolute inset-0" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <p className="font-display text-2xl font-semibold tracking-[0.34em]">BİFİRE</p>
          <p className="max-w-sm font-display text-3xl leading-tight font-semibold">İçerik, ürün ve taleplerinizi tek yerden yönetin.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <p className="font-display text-xl font-semibold tracking-[0.3em] lg:hidden">BİFİRE</p>
          <h1 className="mt-6 text-2xl font-semibold lg:mt-0">Yönetim paneli</h1>
          <p className="mt-2 text-sm text-neutral-500">Devam etmek için giriş yapın.</p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
