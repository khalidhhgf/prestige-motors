import { publicRoute, parse } from "@/lib/api";
import { db } from "@/lib/db";
import { leadPublicSchema } from "@/lib/validators";
import { plain, normalizePkPhone } from "@/lib/text";
import { notifyNewLead } from "@/lib/mail";

// Public inquiry endpoint (vehicle inquiry, contact, sell-your-car, finance).
export const POST = publicRoute("lead", 8, async (req) => {
  const d = await parse(req, leadPublicSchema);
  if (d.website) return { ok: true }; // honeypot tripped – pretend success (nothing stored)
  const phone = normalizePkPhone(d.phone);
  const message = plain(d.message || "");
  const vehicle = d.vehicleId ? await db.vehicle.findFirst({ where: { id: d.vehicleId, deletedAt: null }, select: { id: true, title: true } }) : null;
  const kinds = { INQUIRY: "vehicle inquiry", CONTACT: "contact message", SELL_CAR: "sell-your-car request", FINANCE: "finance request" };
  void notifyNewLead({ kind: kinds[d.type], name: plain(d.name), phone, email: d.email, vehicle: vehicle?.title, message });

  // Repeat contacts (same phone, still open) attach to the existing lead as a new inquiry.
  const existing = await db.lead.findFirst({
    where: { phone, deletedAt: null, status: { notIn: ["CONVERTED", "LOST"] }, ...(vehicle ? { vehicleId: vehicle.id } : {}) },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    await db.inquiry.create({ data: { leadId: existing.id, message: message || "(no message)", channel: "Website" } });
    await db.lead.update({ where: { id: existing.id }, data: { updatedAt: new Date() } });
  } else {
    await db.lead.create({
      data: {
        name: plain(d.name), phone, email: d.email ?? null, message, type: d.type, vehicleId: vehicle?.id ?? null, source: "Website",
        inquiries: { create: { message: message || "(no message)" } },
      },
    });
  }
  return { ok: true };
});
