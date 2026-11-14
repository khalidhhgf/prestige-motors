"use client";
import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

/** Filters are always visible on desktop; on phones they collapse behind a button so results come first. */
export default function FilterPanel({ children, activeCount }: { children: React.ReactNode; activeCount: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="filters"
        className="flex min-h-[52px] w-full items-center justify-between border border-ink/20 bg-white px-5 text-sm font-semibold uppercase tracking-wider lg:hidden">
        <span className="flex items-center gap-2"><SlidersHorizontal size={18} /> Filters{activeCount > 0 && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-ink px-1.5 text-xs text-white">{activeCount}</span>}</span>
        <ChevronDown size={18} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
      <div id="filters" className={`${open ? "mt-3 block" : "hidden"} lg:mt-0 lg:block`}>{children}</div>
    </div>
  );
}
