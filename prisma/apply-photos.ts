// Replaces the vector placeholder art on the sample vehicles/hero with stock photography.
// Only touches images that still point at /seed/*.svg, so your own uploads are never overwritten.
import { PrismaClient } from "@prisma/client";
import { photoUrls, HERO, ABOUT } from "./photos";

const db = new PrismaClient();

async function main() {
  let n = 0;
  const vehicles = await db.vehicle.findMany({ include: { images: true } });
  for (const v of vehicles) {
    const urls = photoUrls(v.title);
    if (!urls.length || !v.images.every((i) => i.url.startsWith("/seed/"))) continue;
    await db.vehicleImage.deleteMany({ where: { vehicleId: v.id } });
    await db.vehicleImage.createMany({ data: urls.map((url, i) => ({ vehicleId: v.id, url, thumbUrl: url.replace("w=1600", "w=640"), alt: `${v.title} – view ${i + 1}`, position: i, isPrimary: i === 0 })) });
    n++;
  }
  for (const [type, image] of [["hero", HERO], ["about", ABOUT]] as const) {
    const s = await db.cmsSection.findFirst({ where: { type } });
    const cfg = (s?.config ?? {}) as Record<string, unknown>;
    if (s && typeof cfg.image === "string" && cfg.image.startsWith("/seed/")) await db.cmsSection.update({ where: { id: s.id }, data: { config: { ...cfg, image } } });
  }
  console.log(`Updated photos on ${n} vehicles + hero/about`);
}
main().finally(() => db.$disconnect());
