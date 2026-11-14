"use client";
import { useState } from "react";
import { api } from "@/lib/client";
import { useToast } from "@/components/ui/Toast";

export default function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/newsletter", { body: { email } });
      toast.success("Thanks for subscribing!");
      setEmail("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="flex w-full max-w-md">
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" aria-label="Email address"
        className={`min-w-0 flex-1 border px-4 py-3 text-sm outline-none ${dark ? "border-white/20 bg-transparent text-white placeholder:text-white/40 focus:border-accent" : "border-ink/20 bg-white focus:border-ink"}`} />
      <button disabled={busy} className="btn-accent !px-5">{busy ? "…" : "Subscribe"}</button>
    </form>
  );
}
