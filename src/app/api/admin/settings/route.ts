import { z } from "zod";
import { adminRoute, parse } from "@/lib/api";
import { getSettings, saveSettings } from "@/lib/settings";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #b8935a");
const schema = z.object({
  siteName: z.string().trim().min(1).max(80),
  tagline: z.string().max(200),
  logoUrl: z.string().max(1000),
  faviconUrl: z.string().max(1000),
  primaryColor: hex,
  secondaryColor: hex,
  phone: z.string().max(30),
  whatsapp: z.string().max(30).regex(/^\+?\d[\d\s]*$/, "Digits only, with country code"),
  email: z.string().email().or(z.literal("")),
  address: z.string().max(300),
  currency: z.string().max(5),
  currencySymbol: z.string().max(6),
  country: z.string().max(60),
  timezone: z.string().max(60),
  cities: z.array(z.string().trim().min(1).max(60)).max(100),
  openingHours: z.string().max(400),
  mapEmbedUrl: z.string().max(1000).refine((s) => !s || /^https:\/\/(www\.)?google\.[a-z.]+\/maps/.test(s), "Use a Google Maps embed URL"),
  facebook: z.string().max(300),
  instagram: z.string().max(300),
  youtube: z.string().max(300),
  tiktok: z.string().max(300),
  seoTitle: z.string().max(70),
  seoDescription: z.string().max(170),
  ogImage: z.string().max(1000),
  footerText: z.string().max(300),
  maintenanceMode: z.boolean(),
}).partial();

export const GET = adminRoute("settings", async () => ({ settings: await getSettings() }));

export const PUT = adminRoute("settings", async (req, user) => {
  const patch = await parse(req, schema);
  await saveSettings(patch);
  await logActivity(user, "settings.update", "settings", null, Object.keys(patch).join(", "));
  revalidatePath("/", "layout");
  return { ok: true };
});
