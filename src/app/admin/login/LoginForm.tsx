"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { loginAction, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error ? (
        <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          E-posta
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.email} className="block min-h-12 w-full border border-neutral-300 bg-white px-3 outline-none focus:border-ink" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Şifre
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="block min-h-12 w-full border border-neutral-300 bg-white px-3 outline-none focus:border-ink" />
      </div>
      <button type="submit" disabled={pending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-ink text-sm font-semibold tracking-wide text-white uppercase hover:bg-graphite disabled:opacity-60">
        {pending ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
        {pending ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>
    </form>
  );
}
