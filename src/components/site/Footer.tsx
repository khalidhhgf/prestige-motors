import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import NewsletterForm from "./NewsletterForm";

export default function Footer({ s, links, pages }: { s: SiteSettings; links: { label: string; href: string }[]; pages: { label: string; href: string }[] }) {
  const socials = [
    { href: s.facebook, label: "Facebook" },
    { href: s.instagram, label: "Instagram" },
    { href: s.youtube, label: "YouTube" },
  ].filter((x) => x.href);
  return (
    <footer className="bg-ink text-white/75">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display whitespace-nowrap text-xl font-semibold uppercase tracking-[0.18em] text-white sm:text-2xl">{s.siteName}</p>
          <p className="mt-4 text-sm leading-6">{s.footerText}</p>
          <div className="mt-5 flex gap-3">
            {socials.map(({ href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="grid h-11 place-items-center border border-white/25 px-4 text-xs hover:border-accent hover:text-accent">
                {label}
              </a>
            ))}
            {s.tiktok && <a href={s.tiktok} target="_blank" rel="noopener noreferrer" className="grid h-9 place-items-center border border-white/20 px-3 text-xs hover:border-accent hover:text-accent">TikTok</a>}
          </div>
        </div>
        <div>
          <p className="eyebrow mb-4">Explore</p>
          <ul className="space-y-1 text-sm">
            {links.map((l) => <li key={l.href}><Link href={l.href} prefetch={false} className="inline-block py-1.5 hover:text-white">{l.label}</Link></li>)}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Visit & Contact</p>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-accent" />{s.address}</li>
            <li className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0 text-accent" /><a href={`tel:${s.phone.replace(/\s/g, "")}`} className="inline-block py-1.5 hover:text-white">{s.phone}</a></li>
            <li className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0 text-accent" /><a href={`mailto:${s.email}`} className="inline-block py-1.5 hover:text-white">{s.email}</a></li>
            <li className="flex gap-2"><Clock size={16} className="mt-0.5 shrink-0 text-accent" /><span className="whitespace-pre-line">{s.openingHours}</span></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Stay informed</p>
          <p className="mb-4 text-sm">New arrivals and offers, straight to your inbox.</p>
          <NewsletterForm dark />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} {s.siteName}. All rights reserved.</p>
          <div className="flex gap-5">{pages.map((p) => <Link key={p.href} href={p.href} prefetch={false} className="inline-block py-2 hover:text-white">{p.label}</Link>)}</div>
        </div>
      </div>
    </footer>
  );
}
