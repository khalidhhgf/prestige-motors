import { adminRoute, parse } from "@/lib/api";
import { db } from "@/lib/db";
import { vehicleSchema } from "@/lib/validators";
import { vehicleData, resolveModelId, uniqueVehicleSlug } from "@/lib/vehicles";
import { logActivity } from "@/lib/activity";

export const GET = adminRoute("vehicles", async (req) => {
  const u = new URL(req.url);
  const q = u.searchParams.get("q") ?? "";
  const status = u.searchParams.get("status");
  const page = Math.max(1, Number(u.searchParams.get("page") ?? 1));
  const take = 20;
  const where = {
    deletedAt: null,
    ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { brand: { name: { contains: q, mode: "insensitive" as const } } }] } : {}),
    ...(status === "published" ? { published: true } : status === "draft" ? { published: false } : status && ["AVAILABLE", "RESERVED", "SOLD"].includes(status) ? { status: status as never } : {}),
  };
  const [items, total] = await Promise.all([
    db.vehicle.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * take, take,
      include: { brand: { select: { name: true } }, images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    db.vehicle.count({ where }),
  ]);
  return { items, total, page, pages: Math.ceil(total / take) };
});

export const POST = adminRoute("vehicles", async (req, user) => {
  const input = await parse(req, vehicleSchema);
  const modelId = await resolveModelId(input.brandId, input.modelId, input.modelName);
  const slug = await uniqueVehicleSlug(`${input.title}-${input.year}`);
  const v = await db.vehicle.create({
    data: {
      ...vehicleData(input, modelId),
      slug,
      images: { create: input.images.map((im, i) => ({ url: im.url, thumbUrl: im.thumbUrl ?? null, alt: im.alt ?? input.title, position: i, isPrimary: i === 0 })) },
      features: { create: input.featureIds.map((featureId) => ({ featureId })) },
    },
  });
  await logActivity(user, "vehicle.create", "vehicle", v.id, v.title);
  return { item: v };
});
