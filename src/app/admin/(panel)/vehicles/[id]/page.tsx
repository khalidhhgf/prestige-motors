import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { guard } from "@/lib/guard";
import { vehicleInclude } from "@/lib/vehicles";
import { getSettings } from "@/lib/settings";
import VehicleForm from "@/components/admin/VehicleForm";

export default async function EditVehicle({ params }: { params: Promise<{ id: string }> }) {
  await guard("vehicles");
  const { id } = await params;
  const v = await db.vehicle.findFirst({ where: { id, deletedAt: null }, include: vehicleInclude });
  if (!v) notFound();
  const [brands, models, categories, features, s] = await Promise.all([
    db.brand.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.carModel.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, brandId: true } }),
    db.category.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    db.feature.findMany({ orderBy: [{ group: "asc" }, { name: "asc" }], select: { id: true, name: true, group: true } }),
    getSettings(),
  ]);
  return <VehicleForm key={v.updatedAt.toISOString()} initial={JSON.parse(JSON.stringify(v))} brands={brands} models={models} categories={categories} features={features} cities={s.cities} />;
}
