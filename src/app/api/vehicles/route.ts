import { publicRoute } from "@/lib/api";
import { db } from "@/lib/db";
import { buildWhere, buildOrder, cardInclude, type Sort } from "@/lib/vehicles";
import { parseFilters } from "@/lib/filters";

// Public JSON API used by "load more" on the inventory page.
export const GET = publicRoute("vehicles", 120, async (req) => {
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const page = Math.max(1, Number(sp.page ?? 1));
  const take = 12;
  const slugs = sp.slugs ? sp.slugs.split(",").slice(0, 30) : null;
  const where = slugs ? { published: true, deletedAt: null, slug: { in: slugs } } : buildWhere(parseFilters(sp));
  const [items, total] = await Promise.all([
    db.vehicle.findMany({ where, orderBy: buildOrder((sp.sort as Sort) ?? "newest"), skip: (page - 1) * take, take, include: cardInclude }),
    db.vehicle.count({ where }),
  ]);
  return { items: JSON.parse(JSON.stringify(items)), total, page, pages: Math.ceil(total / take) };
});
