"use client";
import { useEffect, useRef, useState } from "react";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 3D tilt that follows the pointer, with a moving light glare. */
export function Tilt({ children, className = "", max = 9 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  function move(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || reduced()) return;
    const el = ref.current!, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max * 1.4}deg) translateZ(14px)`;
    el.style.setProperty("--gx", `${x * 100}%`); el.style.setProperty("--gy", `${y * 100}%`);
  }
  const leave = () => { if (ref.current) ref.current.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateZ(0)"; };
  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className={`tilt ${className}`}>
      {children}
      <span className="tilt-glare" aria-hidden="true" />
    </div>
  );
}

/** Fade/slide in when scrolled into view. */
export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (reduced()) return setOn(true);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`reveal ${on ? "reveal-on" : ""} ${className}`}>{children}</div>;
}

/** Hero with layered depth: background, glow and content move at different speeds with the mouse / scroll. */
export function HeroScene({ image, children }: { image?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (reduced()) return;
    const el = ref.current!;
    const set = (x: number, y: number) => { el.style.setProperty("--mx", String(x)); el.style.setProperty("--my", String(y)); };
    const move = (e: PointerEvent) => { const r = el.getBoundingClientRect(); set((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5); };
    const scroll = () => el.style.setProperty("--sy", String(Math.min(window.scrollY, 800)));
    el.addEventListener("pointermove", move); window.addEventListener("scroll", scroll, { passive: true });
    return () => { el.removeEventListener("pointermove", move); window.removeEventListener("scroll", scroll); };
  }, []);
  return (
    <section ref={ref} className="hero3d relative isolate flex min-h-[85vh] items-center overflow-hidden bg-ink text-white">
      {image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={image} alt="" fetchPriority="high" className="hero-bg absolute left-[-6%] top-[-6%] -z-30 h-[112%] w-[112%] max-w-none object-cover" />}
      <div className="absolute inset-0 -z-20 bg-gradient-to-r from-ink via-ink/70 to-ink/10" />
      <div className="hero-glow absolute -z-10" aria-hidden="true" />
      <div className="hero-lines absolute inset-0 -z-10" aria-hidden="true" />
      <div className="container-x hero-content py-24">{children}</div>
    </section>
  );
}
