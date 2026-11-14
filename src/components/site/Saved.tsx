"use client";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { api } from "@/lib/client";
import VehicleCard, { type CardVehicle } from "./VehicleCard";

const KEY = "saved-cars";
const read = (): string[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };

export function SaveButton({ slug, className = "" }: { slug: string; className?: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(read().includes(slug)); }, [slug]);
  function toggle(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    const cur = read(); const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug];
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode */ }
    setOn(!on);
  }
  return (
    <button onClick={toggle} aria-pressed={on} aria-label={on ? "Remove from saved cars" : "Save this car"} className={`grid h-11 w-11 place-items-center rounded-full bg-white/95 shadow-md transition hover:scale-110 ${className}`}>
      <Heart size={17} className={on ? "fill-red-500 text-red-500" : "text-ink"} />
    </button>
  );
}

export function SavedList({ symbol }: { symbol: string }) {
  const [items, setItems] = useState<CardVehicle[] | null>(null);
  useEffect(() => {
    const slugs = read();
    if (!slugs.length) return setItems([]);
    api<{ items: CardVehicle[] }>(`/api/vehicles?slugs=${encodeURIComponent(slugs.join(","))}`).then((r) => setItems(r.items)).catch(() => setItems([]));
  }, []);
  if (items === null) return <p className="py-16 text-center text-charcoal-500">Loading…</p>;
  if (!items.length) return <div className="bg-white p-16 text-center"><p className="font-display text-3xl">No saved cars yet</p><p className="mt-2 text-charcoal-500">Tap the heart on any car to keep it here.</p></div>;
  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((v) => <VehicleCard key={v.slug} v={v} symbol={symbol} />)}</div>;
}
