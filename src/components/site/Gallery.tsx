"use client";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";

export default function Gallery({ images, title }: { images: { url: string; thumbUrl: string | null; alt: string | null }[]; title: string }) {
  const [i, setI] = useState(0);
  const [full, setFull] = useState(false);
  const n = images.length;
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);

  useEffect(() => {
    if (!full) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setFull(false); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [full, go]);

  if (!n) return <div className="grid aspect-[16/10] place-items-center bg-charcoal text-white/40">No photos available</div>;
  const cur = images[i];
  return (
    <div>
      <div className="group relative aspect-[16/10] overflow-hidden bg-charcoal">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cur.url} alt={cur.alt || `${title} – photo ${i + 1}`} className="h-full w-full object-cover" />
        {n > 1 && (
          <>
            <button aria-label="Previous photo" onClick={() => go(-1)} className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center bg-ink/70 text-white hover:bg-ink"><ChevronLeft /></button>
            <button aria-label="Next photo" onClick={() => go(1)} className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center bg-ink/70 text-white hover:bg-ink"><ChevronRight /></button>
          </>
        )}
        <button aria-label="Full screen" onClick={() => setFull(true)} className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center bg-ink/70 text-white hover:bg-ink"><Expand size={18} /></button>
        <span className="absolute bottom-3 left-3 bg-ink/70 px-2.5 py-1 text-xs text-white">{i + 1} / {n}</span>
      </div>
      {n > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {images.map((im, k) => (
            <button key={k} onClick={() => setI(k)} aria-label={`Show photo ${k + 1}`} className={`aspect-[4/3] overflow-hidden border-2 ${k === i ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.thumbUrl || im.url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {full && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/95" role="dialog" aria-modal="true" aria-label="Photo viewer">
          <button aria-label="Close" onClick={() => setFull(false)} className="absolute right-4 top-4 text-white"><X size={28} /></button>
          {n > 1 && <button aria-label="Previous" onClick={() => go(-1)} className="absolute left-3 text-white"><ChevronLeft size={40} /></button>}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cur.url} alt={cur.alt || title} className="max-h-[90vh] max-w-[92vw] object-contain" />
          {n > 1 && <button aria-label="Next" onClick={() => go(1)} className="absolute right-3 text-white"><ChevronRight size={40} /></button>}
        </div>
      )}
    </div>
  );
}
