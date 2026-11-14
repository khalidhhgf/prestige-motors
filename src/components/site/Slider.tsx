"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Swipeable slider (CSS scroll-snap) with arrows, dots and optional autoplay. Each child is one slide. */
export default function Slider({ children, autoplay = 4500, dark = false }: { children: React.ReactNode[]; autoplay?: number; dark?: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [scrollable, setScrollable] = useState(true);
  const n = children.length;

  const go = useCallback((i: number) => {
    const el = track.current; if (!el) return;
    const next = (i + n) % n;
    const slide = el.children[next] as HTMLElement;
    el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: "smooth" });
    setIndex(next);
  }, [n]);

  // keep dots in sync when the user swipes
  useEffect(() => {
    const el = track.current; if (!el) return;
    const onScroll = () => {
      const left = el.scrollLeft + el.offsetLeft;
      let best = 0, d = Infinity;
      Array.from(el.children).forEach((c, i) => { const dist = Math.abs((c as HTMLElement).offsetLeft - left); if (dist < d) { d = dist; best = i; } });
      setIndex(best);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // On wide screens all slides fit: hide controls and skip autoplay.
  useEffect(() => {
    const el = track.current; if (!el) return;
    const check = () => setScrollable(el.scrollWidth > el.clientWidth + 4);
    check();
    const ro = new ResizeObserver(check); ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!scrollable || !autoplay || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => go(index + 1), autoplay);
    return () => clearInterval(t);
  }, [scrollable, autoplay, paused, index, go]);

  const btn = `grid h-11 w-11 place-items-center border transition ${dark ? "border-white/30 text-white hover:bg-white hover:text-ink" : "border-ink/30 text-ink hover:bg-ink hover:text-white"}`;
  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} onTouchStart={() => setPaused(true)}>
      <div ref={track} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2" role="region" aria-roledescription="carousel" aria-label="Slider" tabIndex={0}
        onKeyDown={(e) => { if (e.key === "ArrowRight") go(index + 1); if (e.key === "ArrowLeft") go(index - 1); }}>
        {children.map((c, i) => (
          <div key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${n}`} className="w-[84%] shrink-0 snap-start sm:w-[46%] lg:w-[calc(25%-12px)]">{c}</div>
        ))}
      </div>
      <div className={`mt-6 items-center justify-between ${scrollable ? "flex" : "hidden"}`}>
        <div className="flex gap-2" role="tablist" aria-label="Choose slide">
          {children.map((_, i) => (
            <button key={i} role="tab" aria-selected={i === index} aria-label={`Go to slide ${i + 1}`} onClick={() => go(i)} className="group flex h-11 items-center px-0.5">
              <span className={`block h-1.5 transition-all ${i === index ? "w-10 bg-accent" : `w-5 ${dark ? "bg-white/30 group-hover:bg-white/60" : "bg-ink/25 group-hover:bg-ink/50"}`}`} />
            </button>
          ))}
        </div>
        <div className="flex gap-2"><button className={btn} onClick={() => go(index - 1)} aria-label="Previous slide"><ChevronLeft size={20} /></button><button className={btn} onClick={() => go(index + 1)} aria-label="Next slide"><ChevronRight size={20} /></button></div>
      </div>
    </div>
  );
}
