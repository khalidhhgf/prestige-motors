import { z } from "zod";

const opt = <T extends z.ZodTypeAny>(s: T) => s.optional().nullable();
const emptyToNull = (v: unknown) => (v === "" ? null : v);
const optStr = (max = 500) => z.preprocess(emptyToNull, z.string().trim().max(max).nullish());
const optInt = z.preprocess((v) => (v === "" || v === null || v === undefined ? null : Number(v)), z.number().int().nonnegative().nullable());

export const vehicleSchema = z.object({
  title: z.string().trim().min(3).max(160),
  brandId: z.string().min(1),
  modelId: z.preprocess(emptyToNull, z.string().nullish()),
  modelName: optStr(80), // create model on the fly
  categoryId: z.preprocess(emptyToNull, z.string().nullish()),
  price: z.coerce.number().int().min(0).max(100_000_000_000),
  priceNegotiable: z.boolean().default(false),
  year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1),
  mileage: z.coerce.number().int().min(0).max(2_000_000).default(0),
  engineCc: optInt,
  transmission: z.string().trim().max(40).default("Automatic"),
  fuelType: z.string().trim().max(40).default("Petrol"),
  bodyType: optStr(40),
  exteriorColor: optStr(40),
  interiorColor: optStr(40),
  condition: z.enum(["NEW", "USED", "RECONDITIONED"]).default("USED"),
  city: optStr(60),
  registrationCity: optStr(60),
  description: optStr(10000),
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD"]).default("AVAILABLE"),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  origin: z.enum(["LOCAL", "IMPORTED"]).default("LOCAL"),
  auctionGrade: optStr(20),
  importYear: optInt,
  registrationYear: optInt,
  originalMileage: optInt,
  verifiedMileage: optInt,
  tokenTaxInfo: optStr(200),
  customsDetails: optStr(500),
  auctionSheetUrl: optStr(500),
  specs: z.array(z.object({ key: z.string().trim().min(1).max(60), value: z.string().trim().max(200) })).default([]),
  featureIds: z.array(z.string()).default([]),
  seoTitle: optStr(70),
  seoDescription: optStr(170),
  images: z
    .array(z.object({ url: z.string().min(1), thumbUrl: z.string().nullish(), alt: z.string().nullish() }))
    .default([]), // order = position; first = featured image
});
export type VehicleInput = z.infer<typeof vehicleSchema>;

export const leadPublicSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(20).regex(/^[+\d][\d\s\-()]+$/, "Enter a valid phone number"),
  email: z.preprocess(emptyToNull, z.string().email().max(120).nullish()),
  message: z.string().trim().max(2000).optional().default(""),
  vehicleId: z.preprocess(emptyToNull, z.string().nullish()),
  type: z.enum(["INQUIRY", "SELL_CAR", "CONTACT", "FINANCE"]).default("INQUIRY"),
  website: z.string().max(200).optional(), // honeypot – humans leave it empty; handler silently drops filled ones
});

export const testDriveSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(20).regex(/^[+\d][\d\s\-()]+$/, "Enter a valid phone number"),
  email: z.preprocess(emptyToNull, z.string().email().nullish()),
  vehicleId: z.preprocess(emptyToNull, z.string().nullish()),
  preferredDate: z.coerce.date().refine((d) => d.getTime() > Date.now() - 86400000, "Pick a future date"),
  preferredTime: optStr(20),
  message: optStr(1000),
  website: z.string().max(200).optional(),
});

export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1).max(200) });

export const userSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().max(120).transform((s) => s.toLowerCase()),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "INVENTORY_MANAGER", "SALES_MANAGER", "CONTENT_MANAGER"]),
  active: z.boolean().default(true),
  password: z.string().min(10, "Use at least 10 characters").max(100).optional().or(z.literal("")),
});

export { opt, optStr, optInt, emptyToNull };
