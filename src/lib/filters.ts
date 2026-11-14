import type { Filters } from "./vehicles";

const num = (v?: string) => {
  if (v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const str = (v?: string) => (v ? v.slice(0, 80) : undefined);

export function parseFilters(sp: Record<string, string | undefined>): Filters {
  return {
    q: str(sp.q), brand: str(sp.brand), model: str(sp.model), category: str(sp.category),
    minPrice: num(sp.minPrice), maxPrice: num(sp.maxPrice), minYear: num(sp.minYear), maxYear: num(sp.maxYear),
    maxMileage: num(sp.maxMileage), fuel: str(sp.fuel), transmission: str(sp.transmission), body: str(sp.body),
    minCc: num(sp.minCc), maxCc: num(sp.maxCc), condition: str(sp.condition), city: str(sp.city),
    availability: str(sp.availability), origin: str(sp.origin),
  };
}
