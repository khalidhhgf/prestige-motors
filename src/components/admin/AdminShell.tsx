"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Car, Tags, Layers, Users, CalendarCheck, Home, FileText, Newspaper, MessageSquareQuote, HelpCircle, Menu as MenuIcon,
  Image as ImageIcon, Settings, UserCog, ScrollText, LogOut, X, ExternalLink, ListChecks, Mail,
} from "lucide-react";
import type { Permission, Role } from "@/lib/rbac";
import { ROLE_LABELS } from "@/lib/rbac";
import { api } from "@/lib/client";

const NAV: { group: string; items: { href: string; label: string; icon: React.ElementType; perm: Permission }[] }[] = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, perm: "dashboard" }] },
  { group: "Inventory", items: [
    { href: "/admin/vehicles", label: "Vehicles", icon: Car, perm: "vehicles" },
    { href: "/admin/brands", label: "Brands", icon: Tags, perm: "brands" },
    { href: "/admin/categories", label: "Categories", icon: Layers, perm: "categories" },
    { href: "/admin/features", label: "Features", icon: ListChecks, perm: "vehicles" },
  ] },
  { group: "Sales", items: [
    { href: "/admin/leads", label: "Leads / CRM", icon: Users, perm: "leads" },
    { href: "/admin/test-drives", label: "Test drives", icon: CalendarCheck, perm: "testdrives" },
    { href: "/admin/subscribers", label: "Subscribers", icon: Mail, perm: "leads" },
  ] },
  { group: "Website", items: [
    { href: "/admin/homepage", label: "Homepage sections", icon: Home, perm: "cms" },
    { href: "/admin/pages", label: "Pages", icon: FileText, perm: "cms" },
    { href: "/admin/blog", label: "Blog", icon: Newspaper, perm: "cms" },
    { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote, perm: "cms" },
    { href: "/admin/faqs", label: "FAQs", icon: HelpCircle, perm: "cms" },
    { href: "/admin/navigation", label: "Navigation", icon: MenuIcon, perm: "cms" },
    { href: "/admin/media", label: "Media library", icon: ImageIcon, perm: "media" },
  ] },
  { group: "System", items: [
    { href: "/admin/settings", label: "Settings", icon: Settings, perm: "settings" },
    { href: "/admin/users", label: "Users & roles", icon: UserCog, perm: "users" },
    { href: "/admin/logs", label: "Activity log", icon: ScrollText, perm: "logs" },
  ] },
];

export default function AdminShell({ user, perms, children }: { user: { name: string; email: string; role: Role }; perms: Permission[]; children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await api("/api/auth/logout", { method: "POST", body: {} });
    router.replace("/admin/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300">
      <div className="flex h-16 items-center justify-between px-5"><span className="font-display text-xl font-semibold uppercase tracking-[0.2em] text-white">Dealer Admin</span><button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X /></button></div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6" aria-label="Admin">
        {NAV.map((g) => {
          const items = g.items.filter((i) => perms.includes(i.perm));
          if (!items.length) return null;
          return (
            <div key={g.group}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">{g.group}</p>
              {items.map(({ href, label, icon: Icon }) => {
                const active = href === "/admin" ? path === href : path.startsWith(href);
                return (
                  <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${active ? "bg-slate-800 text-white" : "hover:bg-slate-800/60 hover:text-white"}`}>
                    <Icon size={17} /> {label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>
      {open && (<div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} /><aside className="absolute inset-y-0 left-0 w-72">{sidebar}</aside></div>)}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><MenuIcon /></button>
          <Link href="/" target="_blank" className="hidden items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 lg:flex"><ExternalLink size={15} /> View website</Link>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm leading-tight"><p className="font-medium">{user.name}</p><p className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</p></div>
            <button onClick={logout} className="a-btn-ghost" aria-label="Sign out"><LogOut size={16} /><span className="hidden sm:inline">Sign out</span></button>
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
