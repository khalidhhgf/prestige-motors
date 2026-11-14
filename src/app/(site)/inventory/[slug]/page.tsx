import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, CalendarCheck, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { vehicleInclude, cardInclude } from "@/lib/vehicles";
import { formatFullPrice, formatKm, SITE_URL, whatsappLink, vehicleWhatsappMessage } from "@/lib/format";
import Gallery from "@/components/site/Gallery";
import LeadForm from "@/components/site/LeadForm";
import VehicleCard from "@/components/site/VehicleCard";
import EmiCalculator from "@/components/site/EmiCalculator";
import { SaveButton } from "@/components/site/Saved";
import ShareButton from "@/components/site/ShareButton";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import { JsonLd } from "@/components/site/JsonLd";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  return db.vehicle.findFirst({ where: { slug, published: true, deletedAt: null }, include: vehicleInclude });
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const v = await load(slug);
  if (!v) return {};
  const s = await getSettings();
  const title = v.seoTitle || `${v.title} – ${v.year}`;
  const desc = v.seoDescription || `${v.title} ${v.year}, ${formatKm(v.mileage)}, ${v.fuelType}, ${v.transmission}. ${formatFullPrice(v.price, s.currencySymbol)}.`;
  const img = v.images[0]?.url;
  return {
    title, description: desc,
    alternates: { canonical: `${SITE_URL}/inventory/${v.slug}` },
    openGraph: { title, description: desc, type: "website", url: `${SITE_URL}/inventory/${v.slug}`, images: img ? [img.startsWith("http") ? img : SITE_URL + img] : undefined },
  };
}

export default async function VehiclePage({ params }: P) {
  const { slug } = await params;
  const v = await load(slug);
  if (!v) notFound();
  const s = await getSettings();
  void db.vehicle.update({ where: { id: v.id }, data: { views: { increment: 1 } } }).catch(() => {});

  const similar = await db.vehicle.findMany({
    where: { published: true, deletedAt: null, id: { not: v.id }, OR: [{ brandId: v.brandId }, ...(v.categoryId ? [{ categoryId: v.categoryId }] : [])] },
    orderBy: { createdAt: "desc" }, take: 3, include: cardInclude,
  });

  const price = formatFullPrice(v.price, s.currencySymbol);
  const rows: [string, string | null | undefined][] = [
    ["Brand", v.brand.name], ["Model", v.model?.name], ["Model year", String(v.year)], ["Mileage", formatKm(v.mileage)],
    ["Engine", v.engineCc ? `${v.engineCc} cc` : null], ["Transmission", v.transmission], ["Fuel type", v.fuelType], ["Body type", v.bodyType],
    ["Exterior colour", v.exteriorColor], ["Interior colour", v.interiorColor], ["Condition", v.condition[0] + v.condition.slice(1).toLowerCase()],
    ["City", v.city], ["Registered in", v.registrationCity], ["Origin", v.origin === "IMPORTED" ? "Imported" : "Local assembled"],
    ["Auction grade", v.auctionGrade], ["Import year", v.importYear?.toString()], ["Registration year", v.registrationYear?.toString()],
    ["Original mileage", v.originalMileage != null ? formatKm(v.originalMileage) : null], ["Verified mileage", v.verifiedMileage != null ? formatKm(v.verifiedMileage) : null],
    ["Token tax", v.tokenTaxInfo], ["Customs / import", v.customsDetails],
  ];
  const specs = (Array.isArray(v.specs) ? v.specs : []) as { key: string; value: string }[];
  const grouped = v.features.reduce<Record<string, string[]>>((a, f) => { (a[f.feature.group] ??= []).push(f.feature.name); return a; }, {});
  const wa = whatsappLink(s.whatsapp, vehicleWhatsappMessage({ title: v.title, year: v.year, price: v.price.toString(), slug: v.slug }, s.currencySymbol));

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Car", name: v.title, brand: { "@type": "Brand", name: v.brand.name }, model: v.model?.name,
        vehicleModelDate: String(v.year), mileageFromOdometer: { "@type": "QuantitativeValue", value: v.mileage, unitCode: "KMT" },
        fuelType: v.fuelType, vehicleTransmission: v.transmission, color: v.exteriorColor, bodyType: v.bodyType,
        vehicleEngine: v.engineCc ? { "@type": "EngineSpecification", engineDisplacement: { "@type": "QuantitativeValue", value: v.engineCc, unitCode: "CMQ" } } : undefined,
        itemCondition: v.condition === "NEW" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
        image: v.images.map((i) => (i.url.startsWith("http") ? i.url : SITE_URL + i.url)), description: v.description?.slice(0, 500), url: `${SITE_URL}/inventory/${v.slug}`,
        offers: { "@type": "Offer", price: v.price.toString(), priceCurrency: s.currency, url: `${SITE_URL}/inventory/${v.slug}`,
          availability: v.status === "AVAILABLE" ? "https://schema.org/InStock" : v.status === "RESERVED" ? "https://schema.org/LimitedAvailability" : "https://schema.org/SoldOut",
          seller: { "@type": "AutoDealer", name: s.siteName } },
      }} />
      <div className="container-x py-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Inventory", href: "/inventory" }, { label: v.title }]} />
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0">
            <Gallery images={v.images.map((i) => ({ url: i.url, thumbUrl: i.thumbUrl, alt: i.alt }))} title={v.title} />
            <div className="mt-10 grid grid-cols-2 gap-px bg-ink/10 sm:grid-cols-4">
              {[["Year", v.year], ["Mileage", formatKm(v.mileage)], ["Fuel", v.fuelType], ["Gearbox", v.transmission]].map(([k, val]) => (
                <div key={String(k)} className="bg-white p-4"><p className="text-xs uppercase tracking-wider text-charcoal-700">{k}</p><p className="mt-1 font-semibold">{val}</p></div>
              ))}
            </div>
            {v.description && <section className="mt-12"><h2 className="text-3xl font-semibold">Overview</h2><p className="mt-4 whitespace-pre-line leading-7 text-charcoal-700">{v.description}</p></section>}
            <section className="mt-12">
              <h2 className="text-3xl font-semibold">Specifications</h2>
              <dl className="mt-5 grid gap-px bg-ink/10 sm:grid-cols-2">
                {[...rows, ...specs.map((x) => [x.key, x.value] as [string, string])].filter(([, val]) => val).map(([k, val]) => (
                  <div key={k} className="flex justify-between gap-4 bg-white px-4 py-3 text-sm"><dt className="text-charcoal-500">{k}</dt><dd className="text-right font-medium">{val}</dd></div>
                ))}
              </dl>
              {v.auctionSheetUrl && <a href={v.auctionSheetUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-accent underline">View auction sheet</a>}
            </section>
            {Object.keys(grouped).length > 0 && (
              <section className="mt-12">
                <h2 className="text-3xl font-semibold">Features</h2>
                <div className="mt-5 grid gap-6 sm:grid-cols-2">
                  {Object.entries(grouped).map(([g, list]) => (
                    <div key={g}><p className="eyebrow mb-2">{g}</p><ul className="space-y-1.5 text-sm">{list.map((f) => <li key={f}>✓ {f}</li>)}</ul></div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wide2 text-charcoal-700">{v.brand.name}{v.category ? ` · ${v.category.name}` : ""}</p>
              <div className="flex items-start justify-between gap-3"><h1 className="mt-1 text-3xl font-semibold leading-tight">{v.title}</h1><SaveButton slug={v.slug} className="shrink-0 border" /></div>
              <p className="mt-4 font-display text-4xl font-semibold text-accent-ink">{price}</p>
              <div className="mt-1"><ShareButton title={v.title} /></div>
              {v.priceNegotiable && <p className="text-xs text-charcoal-500">Price negotiable</p>}
              {v.status !== "AVAILABLE" && <p className="mt-3 inline-block bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">{v.status === "SOLD" ? "Sold" : "Reserved"}</p>}
              <ul className="mt-5 grid gap-1.5 border-y border-ink/10 py-4 text-xs text-charcoal-700"><li>✓ 150-point inspection report</li><li>✓ Verified mileage &amp; documents</li><li>✓ Financing and trade-in support</li></ul>
              <div className="mt-6 grid gap-3">
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-ink hover:brightness-95"><MessageCircle size={18} /> WhatsApp inquiry</a>
                <Link href={`/book-test-drive?vehicle=${v.slug}`} className="btn-primary"><CalendarCheck size={18} /> Request test drive</Link>
                <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="btn-outline"><Phone size={18} /> {s.phone}</a>
              </div>
            </div>
            <div className="bg-white p-6">
              <h2 className="mb-4 text-2xl font-semibold">Send an inquiry</h2>
              <LeadForm vehicleId={v.id} defaultMessage={`I'm interested in the ${v.title} (${v.year}). Please share more details.`} />
            </div>
            <EmiCalculator price={Number(v.price)} symbol={s.currencySymbol} />
            <div className="bg-white p-6 text-sm">
              <p className="eyebrow mb-2">Sold by</p>
              <p className="font-semibold">{s.siteName}</p>
              <p className="mt-1 text-charcoal-500">{s.address}</p>
              <p className="mt-1 whitespace-pre-line text-charcoal-500">{s.openingHours}</p>
            </div>
          </aside>
        </div>

        <div className="mobile-cta fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 border-t border-white/10 bg-ink lg:hidden">
          <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="flex flex-col items-center gap-1 py-3 text-xs uppercase tracking-wider text-white"><Phone size={18} />Call</a>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 bg-[#25D366] py-3 text-xs font-semibold uppercase tracking-wider text-ink"><MessageCircle size={18} />WhatsApp</a>
          <Link href={`/book-test-drive?vehicle=${v.slug}`} className="flex flex-col items-center gap-1 py-3 text-xs uppercase tracking-wider text-white"><CalendarCheck size={18} />Test drive</Link>
        </div>
        <div className="h-16 lg:hidden" />
        {similar.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-8 text-3xl font-semibold sm:text-4xl">Similar vehicles</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{similar.map((x) => <VehicleCard key={x.id} v={x} symbol={s.currencySymbol} />)}</div>
          </section>
        )}
      </div>
    </>
  );
}
