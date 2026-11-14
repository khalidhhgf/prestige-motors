"use client";
import { useState } from "react";
import { api } from "@/lib/client";
import { useToast } from "@/components/ui/Toast";
import { CheckCircle2 } from "lucide-react";

type Props = {
  type?: "INQUIRY" | "SELL_CAR" | "CONTACT" | "FINANCE";
  vehicleId?: string;
  defaultMessage?: string;
  submitLabel?: string;
  messageLabel?: string;
  testDrive?: boolean;
};

/** One form for inquiries, contact, sell-your-car, finance and test-drive requests. */
export default function LeadForm({ type = "INQUIRY", vehicleId, defaultMessage = "", submitLabel = "Send Inquiry", messageLabel = "Message", testDrive = false }: Props) {
  const [f, setF] = useState({ name: "", phone: "", email: "", message: defaultMessage, preferredDate: "", preferredTime: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const toast = useToast();
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (testDrive) await api("/api/test-drives", { body: { ...f, vehicleId } });
      else await api("/api/leads", { body: { name: f.name, phone: f.phone, email: f.email, message: f.message, website: f.website, vehicleId, type } });
      setDone(true);
      toast.success("Thank you! Our team will contact you shortly.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <div className="flex flex-col items-center gap-3 border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="text-emerald-600" size={36} />
        <p className="font-semibold">Request received</p>
        <p className="text-sm text-charcoal-500">We&apos;ll get back to you as soon as possible.</p>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="lf-name">Full name</label><input id="lf-name" required minLength={2} className="input" value={f.name} onChange={set("name")} autoComplete="name" /></div>
        <div><label className="label" htmlFor="lf-phone">Phone / WhatsApp</label><input id="lf-phone" required type="tel" inputMode="tel" placeholder="+92 300 1234567" className="input" value={f.phone} onChange={set("phone")} autoComplete="tel" /></div>
      </div>
      <div><label className="label" htmlFor="lf-email">Email (optional)</label><input id="lf-email" type="email" className="input" value={f.email} onChange={set("email")} autoComplete="email" /></div>
      {testDrive && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="lf-date">Preferred date</label><input id="lf-date" required type="date" min={new Date().toISOString().slice(0, 10)} className="input" value={f.preferredDate} onChange={set("preferredDate")} /></div>
          <div><label className="label" htmlFor="lf-time">Preferred time</label>
            <select id="lf-time" className="input" value={f.preferredTime} onChange={set("preferredTime")}>
              <option value="">Any time</option><option>Morning (10–1)</option><option>Afternoon (1–4)</option><option>Evening (4–7)</option>
            </select></div>
        </div>
      )}
      <div><label className="label" htmlFor="lf-msg">{messageLabel}</label><textarea id="lf-msg" rows={4} className="input" value={f.message} onChange={set("message")} maxLength={2000} /></div>
      {/* honeypot */}
      <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" name="website" value={f.website} onChange={set("website")} />
      <button disabled={busy} className="btn-primary w-full">{busy ? "Sending…" : submitLabel}</button>
    </form>
  );
}
