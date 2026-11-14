import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/format";
import { ToastProvider } from "@/components/ui/Toast";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: s.seoTitle || s.siteName, template: `%s | ${s.siteName}` },
    description: s.seoDescription,
    icons: s.faviconUrl ? { icon: s.faviconUrl } : undefined,
    openGraph: { siteName: s.siteName, type: "website", images: s.ogImage ? [s.ogImage] : undefined, locale: "en_PK" },
    robots: s.maintenanceMode ? { index: false, follow: false } : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`} style={{ "--accent": s.primaryColor, "--accent-2": s.secondaryColor } as React.CSSProperties}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
