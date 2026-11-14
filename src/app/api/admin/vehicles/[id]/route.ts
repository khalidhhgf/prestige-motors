import { z } from "zod";
import { adminRoute, parse } from "@/lib/api";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/auth";
import { vehicleSchema } from "@/lib/validators";
import { vehicleData, resolveModelId, uniqueVehicleSlug, vehicleInclude } from "@/lib/vehicles";
import { logActivity } from "@/lib/activity";

type P = { id: string };

export const GET = adminRoute<P>("vehicles", async (_req, _u, ctx) => {
  const { id } = await ctx.params;
  const item = await db.vehicle.findFirst({ where: { id, deletedAt: null }, include: vehicleInclude });
  if (!item) throw new HttpError(404, "Vehicle not found");
  return { item };
});

export const PUT = adminRoute<P>("vehicles", async (req, user, ctx) => {
  const { id } = await ctx.params;
  const input = await parse(req, vehicleSchema);
  const existing = await db.vehicle.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new HttpError(404, "Vehicle not found");
  const modelId = await resolveModelId(input.brandId, input.modelId, input.modelName);
  const data = vehicleData(input, modelId);
  // keep original soldAt if it was already sold
  if (input.status === "SOLD" && existing.soldAt) data.soldAt = existing.soldAt;
  const v = await db.$transaction(async (tx) => {
    await tx.vehicleImage.deleteMany({ where: { vehicleId: id } });
    await tx.vehicleFeature.deleteMany({ where: { vehicleId: id } });
    return tx.vehicle.update({
      where: { id },
      data: {
        ...data,
        images: { create: input.images.map((im, i) => ({ url: im.url, thumbUrl: im.thumbUrl ?? null, alt: im.alt ?? input.title, position: i, isPrimary: i === 0 })) },
        features: { create: input.featureIds.map((featureId) => ({ featureId })) },
      },
    });
  });
  await logActivity(user, "vehicle.update", "vehicle", id, v.title);
  return { item: v };
});

const patchSchema = z.object({
  action: z.enum(["publish", "unpublish", "feature", "unfeature", "available", "reserved", "sold", "duplicate"]),
});

// Quick actions: publish/unpublish, feature, status, duplicate
export const PATCH = adminRoute<P>("vehicles", async (req, user, ctx) => {
  const { id } = await ctx.params;
  const { action } = await parse(req, patchSchema);
  const v = await db.vehicle.findFirst({ where: { id, deletedAt: null }, include: { images: true, features: true } });
  if (!v) throw new HttpError(404, "Vehicle not found");

  if (action === "duplicate") {
    const { id: _id, slug: _s, createdAt: _c, updatedAt: _u, images, features, views: _v, ...rest } = v;
    const copy = await db.vehicle.create({
      data: {
        ...rest,
        specs: rest.specs ?? undefined,
        title: `${v.title} (Copy)`,
        slug: await uniqueVehicleSlug(`${v.title}-copy`),
        published: false, featured: false, status: "AVAILABLE", soldAt: null,
        images: { create: images.map((im) => ({ url: im.url, thumbUrl: im.thumbUrl, alt: im.alt, position: im.position, isPrimary: im.isPrimary })) },
        features: { create: features.map((f) => ({ featureId: f.featureId })) },
      },
    });
    await logActivity(user, "vehicle.duplicate", "vehicle", copy.id, copy.title);
    return { item: copy };
  }

  const data =
    action === "publish" ? { published: true }
    : action === "unpublish" ? { published: false }
    : action === "feature" ? { featured: true }
    : action === "unfeature" ? { featured: false }
    : action === "available" ? { status: "AVAILABLE" as const, soldAt: null }
    : action === "reserved" ? { status: "RESERVED" as const, soldAt: null }
    : { status: "SOLD" as const, soldAt: new Date() };
  const item = await db.vehicle.update({ where: { id }, data });
  await logActivity(user, `vehicle.${action}`, "vehicle", id, v.title);
  return { item };
});

export const DELETE = adminRoute<P>("vehicles", async (_req, user, ctx) => {
  const { id } = await ctx.params;
  const v = await db.vehicle.update({ where: { id }, data: { deletedAt: new Date(), published: false } });
  await logActivity(user, "vehicle.delete", "vehicle", id, v.title);
  return { ok: true };
});
