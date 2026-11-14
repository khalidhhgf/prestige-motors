import { MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { getUser } from "@/lib/auth";
import { whatsappLink } from "@/lib/format";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import TopBar from "@/components/site/TopBar";
import { JsonLd } from "@/components/site/JsonLd";
import { SITE_URL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, nav, pages, user] = await Promise.all([
    getSettings(),
    db.navItem.findMany({ where: { enabled: true }, orderBy: [{ sortOrder: "asc" }] }),
    db.page.findMany({ where: { showInFooter: true, published: true, deletedAt: null }, select: { title: true, slug: true } }),
    getUser(),
  ]);

  if (s.maintenanceMode && !user)
    return (
      <main className="grid min-h-screen place-items-center bg-ink px-6 text-center text-white">
        <div>
          <p className="font-display text-4xl uppercase tracking-[0.2em]">{s.siteName}</p>
          <p className="mx-auto mt-6 max-w-md text-white/70">We&apos;re performing scheduled maintenance and will be back shortly.</p>
          <a className="btn-accent mt-8" href={`tel:${s.phone.replace(/\s/g, "")}`}>Call {s.phone}</a>
        </div>
      </main>
    );

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org", "@type": "AutoDealer", name: s.siteName, url: SITE_URL, telephone: s.phone, email: s.email,
          address: { "@type": "PostalAddress", streetAddress: s.address, addressCountry: "PK" },
          sameAs: [s.facebook, s.instagram, s.youtube, s.tiktok].filter(Boolean), image: s.logoUrl || undefined,
        }}
      />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-ink">Skip to content</a>
      <TopBar s={s} />
      <Header name={s.siteName} logoUrl={s.logoUrl} phone={s.phone} items={nav.filter((n) => n.menu === "header")} />
      <main id="main">{children}</main>
      <Footer s={s} links={nav.filter((n) => n.menu === "footer")} pages={pages.map((p) => ({ label: p.title, href: `/${p.slug}` }))} />
      <a href={whatsappLink(s.whatsapp, `Hello ${s.siteName}, I have a question.`)} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
        className="wa-float fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105">
        <MessageCircle size={26} />
      </a>
    </>
  );
}
