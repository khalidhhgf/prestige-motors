import { cache } from "react";
import { db } from "./db";

export type SiteSettings = {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  currency: string;
  currencySymbol: string;
  country: string;
  timezone: string;
  cities: string[];
  openingHours: string;
  mapEmbedUrl: string;
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  footerText: string;
  maintenanceMode: boolean;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Prestige Motors",
  tagline: "Pakistan's destination for premium automobiles",
  logoUrl: "",
  faviconUrl: "",
  primaryColor: "#b8935a",
  secondaryColor: "#8a6d3b",
  phone: "+92 300 0000000",
  whatsapp: "+923000000000",
  email: "sales@example.com",
  address: "Main Boulevard, Gulberg III, Lahore, Pakistan",
  currency: "PKR",
  currencySymbol: "Rs.",
  country: "Pakistan",
  timezone: "Asia/Karachi",
  cities: ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Gujranwala", "Peshawar"],
  openingHours: "Mon–Sat: 10:00 AM – 7:00 PM\nSunday: By appointment",
  mapEmbedUrl: "https://www.google.com/maps?q=Gulberg+III+Lahore&output=embed",
  facebook: "",
  instagram: "",
  youtube: "",
  tiktok: "",
  seoTitle: "Prestige Motors | Premium Cars in Pakistan",
  seoDescription: "Browse verified premium, imported and locally assembled vehicles. Test drives, financing and trade-in support.",
  ogImage: "",
  footerText: "Verified vehicles. Transparent pricing. Exceptional service.",
  maintenanceMode: false,
};

export const getSettings = cache(async (): Promise<SiteSettings> => {
  let rows: { key: string; value: unknown }[] = [];
  try {
    rows = await db.setting.findMany();
  } catch (e) {
    // Never take the whole site down because settings could not be read (e.g. database restarting): use defaults.
    console.error("getSettings: falling back to defaults", (e as Error).message?.slice(0, 120));
  }
  const out: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const r of rows) out[r.key] = r.value;
  return out as SiteSettings;
});

export async function saveSettings(patch: Partial<SiteSettings>) {
  await db.$transaction(
    Object.entries(patch).map(([key, value]) =>
      db.setting.upsert({ where: { key }, create: { key, value: value as never }, update: { value: value as never } }),
    ),
  );
}
