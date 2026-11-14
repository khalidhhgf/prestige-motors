"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Phone, Heart } from "lucide-react";

type Props = { name: string; logoUrl: string; phone: string; items: { label: string; href: string }[] };

export default function Header({ name, logoUrl, phone, items }: Props) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const isActive = (href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

  // close on route change
  useEffect(() => setOpen(false), [path]);

  // mobile menu: Escape closes (focus returns to the button) and page scroll is locked while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); toggleRef.current?.focus(); } };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/95 text-white backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between lg:h-20">
        <Link href="/" className="flex items-center gap-3" aria-label={`${name} – home`}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={name} className="h-9 w-auto" />
          ) : (
            <span className="whitespace-nowrap font-display text-xl font-semibold uppercase tracking-[0.15em] sm:text-2xl sm:tracking-[0.2em]">{name}</span>
          )}
        </Link>
        <nav className="hidden items-center gap-7 xl:flex" aria-label="Main">
          {items.map((i) => (
            <Link key={i.href + i.label} href={i.href} prefetch={false} aria-current={isActive(i.href) ? "page" : undefined}
              className={`relative whitespace-nowrap py-2 text-[13px] font-medium uppercase tracking-wider transition after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-accent after:transition-transform ${isActive(i.href) ? "text-white after:scale-x-100" : "text-white/80 after:scale-x-0 hover:text-white hover:after:scale-x-100"}`}>
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-3">
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="hidden items-center gap-2 whitespace-nowrap text-sm text-white/80 hover:text-white 2xl:flex">
            <Phone size={16} /> {phone}
          </a>
          <Link href="/saved" aria-label="Saved cars" className="grid h-11 w-11 place-items-center text-white/80 hover:text-white"><Heart size={21} /></Link>
          <Link href="/book-test-drive" prefetch={false} className="btn-accent hidden !min-h-[40px] !px-4 !py-2 text-xs sm:inline-flex whitespace-nowrap">Test Drive</Link>
          <button ref={toggleRef} className="grid h-11 w-11 place-items-center xl:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/10 bg-ink xl:hidden" aria-label="Mobile">
          <div className="container-x flex flex-col py-3">
            {items.map((i) => (
              <Link key={i.href + i.label} href={i.href} aria-current={isActive(i.href) ? "page" : undefined}
                className={`flex min-h-[52px] items-center justify-between border-b border-white/10 text-sm uppercase tracking-wider ${isActive(i.href) ? "text-accent" : "text-white/90"}`}>
                {i.label}{isActive(i.href) && <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />}
              </Link>
            ))}
            <Link href="/book-test-drive" className="btn-accent my-5">Book a Test Drive</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
