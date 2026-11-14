import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { toSlug } from "./text";
import type { VehicleInput } from "./validators";

export const vehicleInclude = {
  brand: true,
  model: true,
  category: true,
  images: { orderBy: { position: "asc" } },
  features: { include: { feature: true } },
} satisfies Prisma.VehicleInclude;

export type VehicleFull = Prisma.VehicleGetPayload<{ include: typeof vehicleInclude }>;

export async function uniqueVehicleSlug(base: string, excludeId?: string) {
  const root = toSlug(base);
  let s = root;
  let n = 1;
  for (;;) {
    const hit = await db.vehicle.findUnique({ where: { slug: s }, select: { id: true } });
    if (!hit || hit.id === excludeId) return s;
    s = `${root}-${++n}`;
  }
}

export async function resolveModelId(brandId: string, modelId?: string | null, modelName?: string | null) {
  if (modelId) return modelId;
  if (!modelName) return null;
  const slug = toSlug(modelName);
  const m = await db.carModel.upsert({
    where: { brandId_slug: { brandId, slug } },
    update: {},
    create: { brandId, slug, name: modelName },
  });
  return m.id;
}

export function vehicleData(input: VehicleInput, modelId: string | null): Omit<Prisma.VehicleUncheckedCreateInput, "slug"> {
  const { images: _i, featureIds: _f, specs, modelName: _m, ...rest } = input;
  return {
    ...rest,
    modelId,
    specs: specs as Prisma.InputJsonValue,
    soldAt: input.status === "SOLD" ? new Date() : null,
  } as Omit<Prisma.VehicleUncheckedCreateInput, "slug">;
}

export type Filters = {
  q?: string; brand?: string; model?: string; category?: string; minPrice?: number; maxPrice?: number;
  minYear?: number; maxYear?: number; maxMileage?: number; fuel?: string; transmission?: string; body?: string;
  minCc?: number; maxCc?: number; condition?: string; city?: string; availability?: string; origin?: string;
};
export type Sort = "newest" | "price-asc" | "price-desc" | "mileage-asc" | "year-desc";

export function buildWhere(f: Filters): Prisma.VehicleWhereInput {
  const and: Prisma.VehicleWhereInput[] = [{ published: true, deletedAt: null }];
  if (f.q) and.push({ OR: [{ title: { contains: f.q, mode: "insensitive" } }, { brand: { name: { contains: f.q, mode: "insensitive" } } }, { model: { name: { contains: f.q, mode: "insensitive" } } }] });
  if (f.brand) and.push({ brand: { slug: f.brand } });
  if (f.model) and.push({ model: { slug: f.model } });
  if (f.category) and.push({ category: { slug: f.category } });
  if (f.minPrice != null || f.maxPrice != null) and.push({ price: { gte: f.minPrice, lte: f.maxPrice } });
  if (f.minYear != null || f.maxYear != null) and.push({ year: { gte: f.minYear, lte: f.maxYear } });
  if (f.maxMileage != null) and.push({ mileage: { lte: f.maxMileage } });
  if (f.fuel) and.push({ fuelType: f.fuel });
  if (f.transmission) and.push({ transmission: f.transmission });
  if (f.body) and.push({ bodyType: f.body });
  if (f.minCc != null || f.maxCc != null) and.push({ engineCc: { gte: f.minCc, lte: f.maxCc } });
  if (f.condition && ["NEW", "USED", "RECONDITIONED"].includes(f.condition)) and.push({ condition: f.condition as never });
  if (f.origin && ["LOCAL", "IMPORTED"].includes(f.origin)) and.push({ origin: f.origin as never });
  if (f.city) and.push({ city: f.city });
  if (f.availability && ["AVAILABLE", "RESERVED", "SOLD"].includes(f.availability)) and.push({ status: f.availability as never });
  return { AND: and };
}

export function buildOrder(s: Sort): Prisma.VehicleOrderByWithRelationInput[] {
  switch (s) {
    case "price-asc": return [{ price: "asc" }];
    case "price-desc": return [{ price: "desc" }];
    case "mileage-asc": return [{ mileage: "asc" }];
    case "year-desc": return [{ year: "desc" }, { createdAt: "desc" }];
    default: return [{ createdAt: "desc" }];
  }
}

export const cardInclude = {
  brand: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
  images: { orderBy: { position: "asc" }, take: 1 },
} satisfies Prisma.VehicleInclude;
export type VehicleCardData = Prisma.VehicleGetPayload<{ include: typeof cardInclude }>;
