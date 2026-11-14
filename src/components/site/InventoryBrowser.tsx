"use client";
import { useState } from "react";
import { api } from "@/lib/client";
import VehicleCard, { type CardVehicle } from "./VehicleCard";

/** Server renders page 1; "Load more" fetches subsequent pages from /api/vehicles with the same filters. */
export default function InventoryBrowser({ initial, total, pages, query, symbol }: { initial: CardVehicle[]; total: number; pages: number; query: string; symbol: string }) {
  const [items, setItems] = useState(initial);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function more() {
    setBusy(true); setErr("");
    try {
      const r = await api<{ items: CardVehicle[] }>(`/api/vehicles?${query}&page=${page + 1}`);
      setItems((a) => [...a, ...r.items]);
      setPage(page + 1);
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((v) => <VehicleCard key={v.slug} v={v} symbol={symbol} />)}
      </div>
      {err && <p className="mt-6 text-center text-sm text-red-600">{err}</p>}
      {page < pages && (
        <div className="mt-12 text-center">
          <button onClick={more} disabled={busy} className="btn-outline">{busy ? "Loading…" : `Load more (${items.length} of ${total})`}</button>
        </div>
      )}
    </>
  );
}
