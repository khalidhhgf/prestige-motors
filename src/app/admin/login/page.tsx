"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      await api("/api/auth/login", { body: { email, password } });
      router.replace("/admin");
      router.refresh();
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-5">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 bg-white p-8 shadow-2xl">
        <div className="text-center"><p className="font-display text-3xl font-semibold uppercase tracking-[0.2em]">Admin</p><p className="mt-1 text-sm text-charcoal-500">Sign in to manage your dealership</p></div>
        <div><label className="label" htmlFor="e">Email</label><input id="e" type="email" required autoComplete="username" className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label" htmlFor="p">Password</label><input id="p" type="password" required autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
        <button disabled={busy} className="btn-primary w-full">{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </main>
  );
}
