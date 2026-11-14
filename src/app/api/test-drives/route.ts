import { publicRoute, parse } from "@/lib/api";
import { db } from "@/lib/db";
import { testDriveSchema } from "@/lib/validators";
import { plain, normalizePkPhone } from "@/lib/text";
import { notifyNewLead } from "@/lib/mail";

export const POST = publicRoute("testdrive", 6, async (req) => {
  const d = await parse(req, testDriveSchema);
  if (d.website) return { ok: true };
  const vehicle = d.vehicleId ? await db.vehicle.findFirst({ where: { id: d.vehicleId, deletedAt: null }, select: { id: true, title: true } }) : null;
  void notifyNewLead({
    kind: "test-drive request", name: plain(d.name), phone: normalizePkPhone(d.phone), email: d.email, vehicle: vehicle?.title, message: d.message ? plain(d.message) : null,
    extra: `${d.preferredDate.toISOString().slice(0, 10)} ${d.preferredTime ?? ""}`.trim(),
  });
  await db.testDrive.create({
    data: {
      name: plain(d.name), phone: normalizePkPhone(d.phone), email: d.email ?? null, vehicleId: vehicle?.id ?? null,
      preferredDate: d.preferredDate, preferredTime: d.preferredTime ?? null, message: d.message ? plain(d.message) : null,
    },
  });
  // Also create a CRM lead so sales sees it in one place.
  await db.lead.create({
    data: {
      name: plain(d.name), phone: normalizePkPhone(d.phone), email: d.email ?? null, vehicleId: vehicle?.id ?? null,
      message: `Test drive requested for ${d.preferredDate.toISOString().slice(0, 10)} ${d.preferredTime ?? ""}`.trim(),
      source: "Test Drive Form", type: "INQUIRY",
    },
  });
  return { ok: true };
});
