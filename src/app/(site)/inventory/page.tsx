import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { buildWhere, buildOrder, cardInclude, type Sort } from "@/lib/vehicles";
import { parseFilters } from "@/lib/filters";
import PageHero from "@/components/site/PageHero";
import InventoryBrowser from "@/components/site/InventoryBrowser";
import FilterPanel from "@/components/site/FilterPanel";
import { SITE_URL } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inventory", description: "Browse our full range of verified premium, imported and local vehicles.", alternates: { canonical: `${SITE_URL}/inventory` } };

type SP = Record<string, string | undefined>;
const SORTS: [Sort, string][] = [["newest", "Newest arrivals"], ["price-asc", "Price: low to high"], ["price-desc", "Price: high to low"], ["mileage-asc", "Lowest mileage"], ["year-desc", "Latest model year"]];
const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() + 1 - i);

export default async function InventoryPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const s = await getSettings();
  const filters = parseFilters(sp);
  const sort = (SORTS.some(([k]) => k === sp.sort) ? sp.sort : "newest") as Sort;
  const where = buildWhere(filters);

  const [items, total, brands, models, cats, facets] = await Promise.all([
    db.vehicle.findMany({ where, orderBy: buildOrder(sort), take: 12, include: cardInclude }),
    db.vehicle.count({ where }),
    db.brand.findMany({ where: { active: true, deletedAt: null }, orderBy: { name: "asc" } }),
    filters.brand ? db.carModel.findMany({ where: { brand: { slug: filters.brand } }, orderBy: { name: "asc" } }) : Promise.resolve([]),
    db.category.findMany({ where: { active: true, deletedAt: null }, orderBy: { sortOrder: "asc" } }),
    db.vehicle.findMany({ where: { published: true, deletedAt: null }, select: { fuelType: true, transmission: true, bodyType: true } }),
  ]);
  const uniq = (k: "fuelType" | "transmission" | "bodyType") => [...new Set(facets.map((f) => f[k]).filter(Boolean) as string[])].sort();

  const qs = new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && k !== "page") as [string, string][]).toString();
  const active = Object.entries(sp).filter(([k, v]) => v && k !== "sort").length;

  return (
    <>
      <PageHero title="Our Inventory" subtitle={`${total} vehicle${total === 1 ? "" : "s"} matching your search`} crumbs={[{ label: "Inventory" }]} />
      <div className="container-x grid gap-10 py-12 lg:grid-cols-[300px_1fr]">
        <aside>
          <FilterPanel activeCount={active}>
          <form className="space-y-4 bg-white p-6 lg:sticky lg:top-24">
            <p className="font-display text-2xl font-semibold">Refine search</p>
            <div><label className="label">Keyword</label><input name="q" defaultValue={sp.q} className="input" placeholder="e.g. Civic" /></div>
            <div><label className="label">Brand</label><select name="brand" defaultValue={sp.brand ?? ""} className="input"><option value="">All</option>{brands.map((b) => <option key={b.id} value={b.slug}>{b.name}</option>)}</select></div>
            {models.length > 0 && <div><label className="label">Model</label><select name="model" defaultValue={sp.model ?? ""} className="input"><option value="">All</option>{models.map((m) => <option key={m.id} value={m.slug}>{m.name}</option>)}</select></div>}
            <div><label className="label">Category</label><select name="category" defaultValue={sp.category ?? ""} className="input"><option value="">All</option>{cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Min price</label><input name="minPrice" type="number" min={0} defaultValue={sp.minPrice} className="input" /></div>
              <div><label className="label">Max price</label><input name="maxPrice" type="number" min={0} defaultValue={sp.maxPrice} className="input" /></div>
              <div><label className="label">Year from</label><select name="minYear" defaultValue={sp.minYear ?? ""} className="input"><option value="">Any</option>{YEARS.map((y) => <option key={y}>{y}</option>)}</select></div>
              <div><label className="label">Year to</label><select name="maxYear" defaultValue={sp.maxYear ?? ""} className="input"><option value="">Any</option>{YEARS.map((y) => <option key={y}>{y}</option>)}</select></div>
              <div><label className="label">Min engine cc</label><input name="minCc" type="number" min={0} defaultValue={sp.minCc} className="input" /></div>
              <div><label className="label">Max engine cc</label><input name="maxCc" type="number" min={0} defaultValue={sp.maxCc} className="input" /></div>
            </div>
            <div><label className="label">Max mileage (km)</label><input name="maxMileage" type="number" min={0} step={5000} defaultValue={sp.maxMileage} className="input" /></div>
            <div><label className="label">Fuel type</label><select name="fuel" defaultValue={sp.fuel ?? ""} className="input"><option value="">Any</option>{uniq("fuelType").map((x) => <option key={x}>{x}</option>)}</select></div>
            <div><label className="label">Transmission</label><select name="transmission" defaultValue={sp.transmission ?? ""} className="input"><option value="">Any</option>{uniq("transmission").map((x) => <option key={x}>{x}</option>)}</select></div>
            <div><label className="label">Body type</label><select name="body" defaultValue={sp.body ?? ""} className="input"><option value="">Any</option>{uniq("bodyType").map((x) => <option key={x}>{x}</option>)}</select></div>
            <div><label className="label">Condition</label><select name="condition" defaultValue={sp.condition ?? ""} className="input"><option value="">Any</option><option value="NEW">New</option><option value="USED">Used</option><option value="RECONDITIONED">Reconditioned</option></select></div>
            <div><label className="label">Origin</label><select name="origin" defaultValue={sp.origin ?? ""} className="input"><option value="">Any</option><option value="LOCAL">Local assembled</option><option value="IMPORTED">Imported</option></select></div>
            <div><label className="label">City</label><select name="city" defaultValue={sp.city ?? ""} className="input"><option value="">Any</option>{s.cities.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label className="label">Availability</label><select name="availability" defaultValue={sp.availability ?? ""} className="input"><option value="">All</option><option value="AVAILABLE">Available</option><option value="RESERVED">Reserved</option><option value="SOLD">Sold</option></select></div>
            <input type="hidden" name="sort" value={sort} />
            <button className="btn-primary w-full">Apply filters</button>
            {active > 0 && <Link href="/inventory" className="block text-center py-2 text-xs uppercase tracking-wider text-charcoal-700 underline hover:text-ink">Clear all filters</Link>}
          </form>
          </FilterPanel>
        </aside>
        <section>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-charcoal-500">Showing {Math.min(items.length, total)} of {total}</p>
            <div className="flex flex-wrap gap-2 text-[13px]">
              {SORTS.map(([k, label]) => {
                const p = new URLSearchParams(qs); p.set("sort", k);
                return <Link key={k} href={`/inventory?${p}`} aria-current={sort === k ? "true" : undefined} className={`border px-3.5 py-2.5 ${sort === k ? "border-ink bg-ink text-white" : "border-ink/20 hover:border-ink"}`}>{label}</Link>;
              })}
            </div>
          </div>
          {items.length === 0 ? (
            <div className="bg-white p-16 text-center">
              <p className="font-display text-3xl">No vehicles match your filters</p>
              <p className="mt-2 text-charcoal-500">Try widening your search, or let us source it for you.</p>
              <div className="mt-6 flex justify-center gap-3"><Link href="/inventory" className="btn-outline">Reset filters</Link><Link href="/contact" className="btn-primary">Contact us</Link></div>
            </div>
          ) : (
            <InventoryBrowser key={qs + sort} initial={JSON.parse(JSON.stringify(items))} total={total} pages={Math.ceil(total / 12)} query={new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(qs)), sort }).toString()} symbol={s.currencySymbol} />
          )}
        </section>
      </div>
    </>
  );
}
