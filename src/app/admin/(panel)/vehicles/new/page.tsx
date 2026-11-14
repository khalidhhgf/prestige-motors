import { db } from "@/lib/db";
import { guard } from "@/lib/guard";
import { getSettings } from "@/lib/settings";
import VehicleForm from "@/components/admin/VehicleForm";

export default async function NewVehicle() {
  await guard("vehicles");
  const [brands, models, categories, features, s] = await Promise.all([
    db.brand.findMany({ where: { deletedAt: null, active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.carModel.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, brandId: true } }),
    db.category.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    db.feature.findMany({ orderBy: [{ group: "asc" }, { name: "asc" }], select: { id: true, name: true, group: true } }),
    getSettings(),
  ]);
  return <VehicleForm brands={brands} models={models} categories={categories} features={features} cities={s.cities} />;
}
