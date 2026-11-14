import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import slugify from "slugify";
import { photoUrls, HERO, ABOUT } from "./photos";

const db = new PrismaClient();
const slug = (s: string) => slugify(s, { lower: true, strict: true });

function writeSvg(name: string, svg: string) {
  const dir = path.join(process.cwd(), "public", "seed");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), svg);
  return `/seed/${name}`;
}

const BRANDS = ["Toyota", "Honda", "Suzuki", "Mercedes-Benz", "BMW", "Audi", "Land Rover", "Porsche", "KIA", "Hyundai"];
const CATEGORIES = [
  ["SUVs", "car-front"], ["Sedans", "car"], ["Hatchbacks", "car-taxi-front"], ["Luxury Cars", "gem"],
  ["Sports Cars", "gauge"], ["Electric Vehicles", "zap"], ["Pickup Trucks", "truck"], ["Commercial Vehicles", "bus"],
];
const FEATURES: [string, string][] = [
  ["Sunroof", "Exterior"], ["Alloy Wheels", "Exterior"], ["LED Headlamps", "Exterior"], ["Leather Seats", "Interior"],
  ["Climate Control", "Interior"], ["Push Start", "Interior"], ["Navigation", "Technology"], ["Apple CarPlay / Android Auto", "Technology"],
  ["Reverse Camera", "Safety"], ["360° Camera", "Safety"], ["ABS & EBD", "Safety"], ["Airbags", "Safety"],
  ["Cruise Control", "Comfort"], ["Keyless Entry", "Comfort"], ["Parking Sensors", "Safety"],
];

type V = {
  title: string; brand: string; model: string; cat: string; price: number; year: number; mileage: number; cc: number;
  trans: string; fuel: string; body: string; ext: string; int: string; cond: "NEW" | "USED" | "RECONDITIONED"; city: string;
  origin: "LOCAL" | "IMPORTED"; grade?: string; featured?: boolean; status?: "AVAILABLE" | "RESERVED" | "SOLD";
  color: string; bg: [string, string]; feats: number[];
};
const VEHICLES: V[] = [
  { title: "Toyota Land Cruiser ZX", brand: "Toyota", model: "Land Cruiser", cat: "SUVs", price: 89500000, year: 2022, mileage: 18000, cc: 4500, trans: "Automatic", fuel: "Diesel", body: "SUV", ext: "Pearl White", int: "Beige", cond: "USED", city: "Lahore", origin: "IMPORTED", grade: "5", featured: true, color: "#e9e7e2", bg: ["#2b2f36", "#0d0e10"], feats: [0, 1, 2, 3, 4, 5, 6, 8, 10, 11] },
  { title: "Mercedes-Benz S-Class S500", brand: "Mercedes-Benz", model: "S-Class", cat: "Luxury Cars", price: 112000000, year: 2021, mileage: 24000, cc: 3000, trans: "Automatic", fuel: "Petrol", body: "Sedan", ext: "Obsidian Black", int: "Cream Nappa", cond: "USED", city: "Karachi", origin: "IMPORTED", grade: "4.5", featured: true, color: "#17181c", bg: ["#3a3d45", "#0b0b0d"], feats: [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12] },
  { title: "BMW M4 Competition", brand: "BMW", model: "M4", cat: "Sports Cars", price: 78000000, year: 2022, mileage: 9500, cc: 3000, trans: "Automatic", fuel: "Petrol", body: "Coupe", ext: "Isle of Man Green", int: "Black Merino", cond: "USED", city: "Islamabad", origin: "IMPORTED", grade: "5", featured: true, color: "#1f4a3a", bg: ["#2a2d33", "#0c0d0f"], feats: [1, 2, 3, 5, 6, 7, 8, 11, 12] },
  { title: "Porsche Macan S", brand: "Porsche", model: "Macan", cat: "SUVs", price: 64500000, year: 2020, mileage: 31000, cc: 2900, trans: "Automatic", fuel: "Petrol", body: "SUV", ext: "Carrara White", int: "Black", cond: "USED", city: "Lahore", origin: "IMPORTED", grade: "4", featured: true, color: "#d9d9dc", bg: ["#383b42", "#0e0f11"], feats: [0, 1, 2, 3, 4, 5, 6, 8, 10, 11] },
  { title: "Land Rover Range Rover Vogue", brand: "Land Rover", model: "Range Rover", cat: "Luxury Cars", price: 135000000, year: 2021, mileage: 22000, cc: 5000, trans: "Automatic", fuel: "Petrol", body: "SUV", ext: "Santorini Black", int: "Tan", cond: "USED", city: "Lahore", origin: "IMPORTED", grade: "4.5", featured: true, color: "#1b1c20", bg: ["#33363c", "#0a0a0c"], feats: [0, 1, 2, 3, 4, 5, 6, 7, 9, 11, 12] },
  { title: "Audi e-tron GT", brand: "Audi", model: "e-tron GT", cat: "Electric Vehicles", price: 98000000, year: 2022, mileage: 7000, cc: 0, trans: "Automatic", fuel: "Electric", body: "Sedan", ext: "Daytona Grey", int: "Black", cond: "USED", city: "Karachi", origin: "IMPORTED", grade: "5", color: "#5c5f66", bg: ["#2c2f35", "#0b0c0e"], feats: [1, 2, 3, 5, 6, 7, 9, 11] },
  { title: "Honda Civic RS Turbo", brand: "Honda", model: "Civic", cat: "Sedans", price: 11250000, year: 2023, mileage: 8200, cc: 1500, trans: "Automatic", fuel: "Petrol", body: "Sedan", ext: "Rallye Red", int: "Black", cond: "USED", city: "Lahore", origin: "LOCAL", color: "#9d1f26", bg: ["#30333a", "#0d0e10"], feats: [0, 1, 2, 4, 5, 7, 8, 10, 11] },
  { title: "Toyota Corolla Altis X", brand: "Toyota", model: "Corolla", cat: "Sedans", price: 7850000, year: 2022, mileage: 29000, cc: 1600, trans: "Automatic", fuel: "Petrol", body: "Sedan", ext: "Silver Metallic", int: "Black", cond: "USED", city: "Rawalpindi", origin: "LOCAL", color: "#a3a6ad", bg: ["#2d3036", "#0c0d0f"], feats: [1, 2, 4, 5, 8, 10, 11] },
  { title: "Suzuki Alto VXL AGS", brand: "Suzuki", model: "Alto", cat: "Hatchbacks", price: 3150000, year: 2023, mileage: 12000, cc: 660, trans: "Automatic", fuel: "Petrol", body: "Hatchback", ext: "Superior White", int: "Grey", cond: "USED", city: "Faisalabad", origin: "LOCAL", color: "#ececec", bg: ["#2f3238", "#0d0e10"], feats: [10, 11, 13] },
  { title: "Toyota Hilux Revo G", brand: "Toyota", model: "Hilux", cat: "Pickup Trucks", price: 14900000, year: 2021, mileage: 41000, cc: 2800, trans: "Automatic", fuel: "Diesel", body: "Pickup", ext: "Attitude Black", int: "Black", cond: "USED", city: "Multan", origin: "LOCAL", color: "#202125", bg: ["#34373d", "#0c0d0f"], feats: [1, 2, 8, 10, 11, 12] },
  { title: "KIA Sportage Alpha", brand: "KIA", model: "Sportage", cat: "SUVs", price: 9350000, year: 2023, mileage: 15500, cc: 2000, trans: "Automatic", fuel: "Petrol", body: "SUV", ext: "Steel Grey", int: "Black", cond: "USED", city: "Gujranwala", origin: "LOCAL", status: "RESERVED", color: "#6b6e75", bg: ["#2c2f35", "#0b0c0e"], feats: [0, 1, 2, 4, 5, 8, 10, 11, 12] },
  { title: "Hyundai Tucson AWD", brand: "Hyundai", model: "Tucson", cat: "SUVs", price: 10250000, year: 2022, mileage: 21000, cc: 2000, trans: "Automatic", fuel: "Petrol", body: "SUV", ext: "Titanium Grey", int: "Black", cond: "USED", city: "Peshawar", origin: "LOCAL", status: "SOLD", color: "#7b7f86", bg: ["#2e3137", "#0c0d0f"], feats: [0, 1, 2, 4, 5, 8, 10, 11] },
];

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password || password.length < 10) throw new Error("Set SEED_ADMIN_PASSWORD (10+ chars) in .env before seeding");

  const admin = await db.user.upsert({
    where: { email },
    update: {},
    create: { name: "Super Admin", email, passwordHash: await bcrypt.hash(password, 12), role: "SUPER_ADMIN" },
  });

  const brands: Record<string, string> = {};
  for (const [i, name] of BRANDS.entries()) {
    const b = await db.brand.upsert({ where: { slug: slug(name) }, update: {}, create: { name, slug: slug(name), sortOrder: i, description: `${name} vehicles available at our showroom.` } });
    brands[name] = b.id;
  }
  const cats: Record<string, string> = {};
  for (const [i, [name, icon]] of CATEGORIES.entries()) {
    const c = await db.category.upsert({ where: { slug: slug(name) }, update: {}, create: { name, slug: slug(name), icon, sortOrder: i } });
    cats[name] = c.id;
  }
  const feats: string[] = [];
  for (const [name, group] of FEATURES) feats.push((await db.feature.upsert({ where: { name }, update: {}, create: { name, group } })).id);


  if ((await db.vehicle.count()) === 0) {
    for (const v of VEHICLES) {
      const model = await db.carModel.upsert({
        where: { brandId_slug: { brandId: brands[v.brand], slug: slug(v.model) } },
        update: {}, create: { name: v.model, slug: slug(v.model), brandId: brands[v.brand] },
      });
      const s = slug(`${v.title}-${v.year}`);
      const images = photoUrls(v.title).map((url, idx) => ({ url, thumbUrl: url.replace("w=1600", "w=640"), alt: `${v.title} – view ${idx + 1}`, position: idx, isPrimary: idx === 0 }));
      await db.vehicle.create({
        data: {
          slug: s, title: v.title, brandId: brands[v.brand], modelId: model.id, categoryId: cats[v.cat],
          price: v.price, year: v.year, mileage: v.mileage, engineCc: v.cc || null, transmission: v.trans, fuelType: v.fuel,
          bodyType: v.body, exteriorColor: v.ext, interiorColor: v.int, condition: v.cond, city: v.city, registrationCity: v.city,
          description: `Immaculately maintained ${v.title} in ${v.ext}. Full service history, inspected by our technicians, with a transparent verified report. Book a test drive today.\n\n(Sample listing – edit or delete from the admin dashboard.)`,
          status: v.status ?? "AVAILABLE", published: true, featured: !!v.featured, soldAt: v.status === "SOLD" ? new Date() : null,
          origin: v.origin, auctionGrade: v.grade ?? null, verifiedMileage: v.origin === "IMPORTED" ? v.mileage : null,
          importYear: v.origin === "IMPORTED" ? v.year + 1 : null, registrationYear: v.year + 1,
          specs: [{ key: "Drive", value: v.body === "SUV" || v.body === "Pickup" ? "4WD" : "FWD/RWD" }, { key: "Seating", value: "5" }] as Prisma.InputJsonValue,
          images: { create: images },
          features: { create: v.feats.map((i) => ({ featureId: feats[i] })) },
        },
      });
    }
  }

  if ((await db.cmsSection.count()) === 0) {
    const hero = HERO;
    const sections: [string, string, string, Record<string, unknown>][] = [
      ["hero", "Hero", "", { eyebrow: "Premium Automobiles", headline: "Drive the extraordinary.", subheadline: "Hand-selected, inspected and verified vehicles from Pakistan's most trusted showroom.", ctaLabel: "Explore Inventory", ctaHref: "/inventory", secondaryLabel: "Book a Test Drive", secondaryHref: "/book-test-drive", image: hero }],
      ["search", "Find your car", "", { title: "Find your next car" }],
      ["stats", "Trust numbers", "", { items: [{ value: 1500, suffix: "+", label: "Cars delivered" }, { value: 12, suffix: "", label: "Years of trust" }, { value: 150, suffix: "", label: "Point inspection" }, { value: 98, suffix: "%", label: "Happy customers" }] }],
      ["featured", "Featured Vehicles", "", { title: "Featured Vehicles", subtitle: "Our current showroom highlights", limit: 6 }],
      ["brands", "Popular Brands", "", { title: "Popular Brands" }],
      ["categories", "Browse by Category", "", { title: "Browse by Category" }],
      ["latest", "Latest Arrivals", "", { title: "Latest Arrivals", subtitle: "Fresh to the showroom", limit: 8 }],
      ["why", "Why Choose Us", "", { title: "Why choose us", items: [
        { title: "Inspected & Verified", text: "Every vehicle passes a 150-point inspection with documented mileage." },
        { title: "Transparent Pricing", text: "No hidden fees. The price you see is the price you pay." },
        { title: "Flexible Financing", text: "Partnerships with leading banks for easy installment plans." },
        { title: "After-Sales Care", text: "Dedicated support and service guidance long after delivery." } ] }],
      ["steps", "How it works", "", { title: "How buying works", subtitle: "From first click to the keys in your hand.", items: [{ title: "Choose", text: "Browse verified vehicles and shortlist your favourites." }, { title: "Inspect", text: "Book a test drive and review the full inspection report." }, { title: "Finance", text: "Compare installment plans or pay in full - we handle the paperwork." }, { title: "Drive away", text: "Registration, transfer and delivery support included." }] }],
      ["about", "Dealership intro", "", { title: "A showroom built on trust", text: "For over a decade we have helped families and professionals across Pakistan find the right vehicle with honesty and care. Visit our showroom, take a test drive and experience the difference.", ctaLabel: "About us", ctaHref: "/about", image: ABOUT }],
      ["testimonials", "Testimonials", "", { title: "What our customers say" }],
      ["blog", "Latest News", "", { title: "News & Insights", limit: 3 }],
      ["newsletter", "Newsletter", "", { title: "Never miss a new arrival", text: "Subscribe for exclusive listings and offers." }],
    ];
    await db.cmsSection.createMany({ data: sections.map(([type, title, , config], i) => ({ page: "home", type, title, config: config as Prisma.InputJsonValue, sortOrder: i })) });
  }

  if ((await db.testimonial.count()) === 0)
    await db.testimonial.createMany({ data: [
      { name: "Ahmed R.", title: "Lahore", quote: "Transparent from start to finish. The car matched the inspection report exactly.", sortOrder: 0 },
      { name: "Sana M.", title: "Islamabad", quote: "Professional team and a smooth financing process. Highly recommended.", sortOrder: 1 },
      { name: "Bilal K.", title: "Karachi", quote: "Best buying experience I've had. Delivery was prompt and the support continues.", sortOrder: 2 },
    ] });

  if ((await db.faq.count()) === 0)
    await db.faq.createMany({ data: [
      { question: "Can I inspect a vehicle before buying?", answer: "Absolutely. Book a test drive or visit the showroom; independent inspections are welcome.", sortOrder: 0 },
      { question: "Do you offer financing?", answer: "Yes, through partner banks. See our Financing page and submit an inquiry for a quote.", sortOrder: 1 },
      { question: "Do you buy used cars?", answer: "Yes. Use the Sell Your Car page and our team will contact you with an evaluation.", sortOrder: 2 },
      { question: "Are imported cars' mileage and auction grades verified?", answer: "Where available we publish the auction sheet and verified mileage on the vehicle page.", sortOrder: 3 },
    ] });

  if ((await db.blogPost.count()) === 0)
    await db.blogPost.createMany({ data: [
      { slug: "how-to-inspect-a-used-car", coverUrl: "https://images.unsplash.com/photo-1594070319944-7c0cbebb6f58?auto=format&fit=crop&w=1200&q=80", title: "How to inspect a used car like a professional", excerpt: "A practical checklist before you buy.", content: "<p>Check body panels for uneven gaps, review service records, test every electronic function and always take a test drive on varied roads.</p>", author: "Editorial Team", published: true, publishedAt: new Date() },
      { slug: "understanding-japanese-auction-grades", coverUrl: "https://images.unsplash.com/photo-1660209514955-032388bc33f7?auto=format&fit=crop&w=1200&q=80", title: "Understanding Japanese auction grades", excerpt: "What a grade 4.5 really means.", content: "<p>Auction grades summarise exterior and interior condition. Grades 4 and above are generally excellent, but always review the original auction sheet.</p>", author: "Editorial Team", published: true, publishedAt: new Date(Date.now() - 864e5 * 7) },
      { slug: "car-financing-in-pakistan-explained", coverUrl: "https://images.unsplash.com/photo-1610064094665-57e727e29f8b?auto=format&fit=crop&w=1200&q=80", title: "Car financing in Pakistan, explained", excerpt: "Down payments, tenures and what to ask your bank.", content: "<p>Most banks require 15–30% down payment with tenures up to 7 years. Compare markup rates, insurance and early-settlement terms.</p>", author: "Editorial Team", published: true, publishedAt: new Date(Date.now() - 864e5 * 14) },
    ] });

  const pages: [string, string, boolean, string][] = [
    ["about", "About Us", false, "<h2>Our story</h2><p>Founded with a simple belief: buying a car should feel exceptional. Today we are one of the region's most trusted premium dealerships.</p><h2>Mission</h2><p>To make premium vehicle ownership transparent, accessible and enjoyable.</p><h2>Vision</h2><p>To be Pakistan's most respected automotive destination.</p>"],
    ["services", "Services", false, "<h2>What we do</h2><ul><li>Vehicle sales — new, used and imported</li><li>Trade-ins and consignment</li><li>Financing assistance</li><li>Inspection and documentation support</li></ul>"],
    ["financing", "Financing", false, "<h2>Flexible financing</h2><p>We work with leading banks to arrange competitive installment plans. Submit an inquiry and our team will guide you through eligibility, down payment and documents.</p>"],
    ["privacy-policy", "Privacy Policy", true, "<p>We collect only the information you submit through our forms (name, phone, email, message) to respond to your inquiry. We never sell your data. Contact us to request deletion.</p><p>(Replace this sample text with your own legal policy from the admin dashboard.)</p>"],
    ["terms-and-conditions", "Terms and Conditions", true, "<p>Vehicle details and prices are subject to change and availability. Listings do not constitute a binding offer until confirmed in writing.</p><p>(Replace this sample text with your own terms from the admin dashboard.)</p>"],
  ];
  for (const [s, title, footer, html] of pages)
    await db.page.upsert({ where: { slug: s }, update: {}, create: { slug: s, title, system: true, showInFooter: footer, content: { html } } });

  if ((await db.navItem.count()) === 0) {
    const header = [["Home", "/"], ["Inventory", "/inventory"], ["Sell Your Car", "/sell-your-car"], ["Financing", "/financing"], ["About", "/about"], ["Contact", "/contact"]];
    const footer = [["Services", "/services"], ["Blog", "/blog"], ["FAQs", "/faqs"], ["Reviews", "/reviews"], ["Book a Test Drive", "/book-test-drive"]];
    await db.navItem.createMany({ data: [...header.map(([label, href], i) => ({ menu: "header", label, href, sortOrder: i })), ...footer.map(([label, href], i) => ({ menu: "footer", label, href, sortOrder: i }))] });
  }

  console.log(`Seed complete. Super Admin: ${admin.email}`);
}

main().then(() => db.$disconnect()).catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
