import Link from "next/link";
import { Gauge, Fuel, Cog, Calendar } from "lucide-react";
import { formatPrice, formatKm } from "@/lib/format";
import { Tilt } from "./Motion";
import { SaveButton } from "./Saved";

export type CardVehicle = {
  slug: string; title: string; price: string | number | { toString(): string }; year: number; mileage: number; fuelType: string; transmission: string;
  status: string; condition: string; city: string | null; featured: boolean;
  brand: { name: string }; images: { url: string; thumbUrl: string | null; alt: string | null }[];
};

export default function VehicleCard({ v, symbol = "Rs." }: { v: CardVehicle; symbol?: string }) {
  const img = v.images[0];
  return (
    <Tilt><div className="relative"><SaveButton slug={v.slug} className="absolute right-3 top-3 z-10" /><Link href={`/inventory/${v.slug}`} className="group block bg-white transition hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-charcoal">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img.thumbUrl || img.url} alt={img.alt || v.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        ) : <div className="grid h-full place-items-center text-xs text-white/40">No photo</div>}
        <div className="absolute left-3 top-3 flex gap-2">
          {v.featured && <span className="bg-accent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink">Featured</span>}
          {v.status !== "AVAILABLE" && <span className="bg-ink/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">{v.status === "SOLD" ? "Sold" : "Reserved"}</span>}
        </div>
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide2 text-charcoal-700">{v.brand.name}{v.city ? ` · ${v.city}` : ""}</p>
        <h3 className="mt-1 line-clamp-1 text-xl font-semibold">{v.title}</h3>
        <p className="mt-2 text-xl font-semibold text-accent-ink">{formatPrice(v.price, symbol)}</p>
        <ul className="mt-4 grid grid-cols-2 gap-y-2 border-t border-ink/10 pt-4 text-[13px] text-charcoal-700">
          <li className="flex items-center gap-1.5"><Calendar size={14} />{v.year}</li>
          <li className="flex items-center gap-1.5"><Gauge size={14} />{formatKm(v.mileage)}</li>
          <li className="flex items-center gap-1.5"><Fuel size={14} />{v.fuelType}</li>
          <li className="flex items-center gap-1.5"><Cog size={14} />{v.transmission}</li>
        </ul>
      </div>
    </Link></div></Tilt>
  );
}
