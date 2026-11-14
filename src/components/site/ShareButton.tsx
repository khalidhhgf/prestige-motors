"use client";
import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton({ title }: { title: string }) {
  const [done, setDone] = useState(false);
  async function share() {
    const url = location.href;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else { await navigator.clipboard.writeText(url); setDone(true); setTimeout(() => setDone(false), 2000); }
    } catch { /* user cancelled */ }
  }
  return <button onClick={share} className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal-500 hover:text-ink">{done ? <><Check size={14} /> Link copied</> : <><Share2 size={14} /> Share</>}</button>;
}
