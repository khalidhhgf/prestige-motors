import type { Metadata } from "next";
// Fonts are bundled with the app (no build-time or runtime requests to Google)
import "@fontsource-variable/inter";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/700.css";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/format";
import { ToastProvider } from "@/components/ui/Toast";


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
    <html lang="en" style={{ "--accent": s.primaryColor, "--accent-2": s.secondaryColor } as React.CSSProperties}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
