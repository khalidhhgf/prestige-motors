import Link from "next/link";
import { ArrowRight, ShieldCheck, BadgeDollarSign, Landmark, Wrench, Star, Search } from "lucide-react";
import { db } from "@/lib/db";
import { cardInclude } from "@/lib/vehicles";
import { formatDate } from "@/lib/format";
import type { SiteSettings } from "@/lib/settings";
import VehicleCard from "./VehicleCard";
import { Reveal, HeroScene } from "./Motion";
import CountUp from "./CountUp";
import Slider from "./Slider";
import NewsletterForm from "./NewsletterForm";
import { safeHtml } from "@/lib/text";

type Cfg = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Ctx = { cfg: Cfg; s: SiteSettings };

const Title = ({ eyebrow, title, subtitle, link }: { eyebrow?: string; title?: string; subtitle?: string; link?: { href: string; label: string } }) => (
  <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
    <div>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-3xl font-semibold sm:text-5xl">{title}</h2>
      {subtitle && <p className="mt-3 max-w-xl text-charcoal-700">{subtitle}</p>}
    </div>
    {link && <Link href={link.href} className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider hover:text-accent-ink">{link.label} <ArrowRight size={16} /></Link>}
  </div>
);

export async function HeroSection({ cfg }: Ctx) {
  return (
    <HeroScene image={cfg.image}>
      <div className="hero-rise">
        {cfg.eyebrow ? <p className="eyebrow mb-5">{cfg.eyebrow}</p> : <span />}
        <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] sm:text-7xl">{cfg.headline}</h1>
        <p className="mt-6 max-w-xl text-lg text-white/75">{cfg.subheadline}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          {cfg.ctaLabel && <Link href={cfg.ctaHref || "/inventory"} className="btn-accent">{cfg.ctaLabel}</Link>}
          {cfg.secondaryLabel && <Link href={cfg.secondaryHref || "/contact"} className="btn-outline-light">{cfg.secondaryLabel}</Link>}
        </div>
      </div>
    </HeroScene>
  );
}
export async function SearchSection({ cfg, s }: Ctx) {
  const [brands, cats, fuels] = await Promise.all([
    db.brand.findMany({ where: { active: true, deletedAt: null }, orderBy: { name: "asc" } }),
    db.category.findMany({ where: { active: true, deletedAt: null }, orderBy: { sortOrder: "asc" } }),
    db.vehicle.findMany({ where: { published: true, deletedAt: null }, distinct: ["fuelType"], select: { fuelType: true } }),
  ]);
  return (
    <section className="relative z-10 -mt-14 pb-6">
      <div className="container-x">
        <form action="/inventory" className="grid gap-4 bg-white p-6 shadow-2xl sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
          <div className="sm:col-span-2 lg:col-span-6"><p className="font-display text-2xl font-semibold">{cfg.title || "Find your next car"}</p></div>
          <div><label className="label">Brand</label><select name="brand" className="input"><option value="">All brands</option>{brands.map((b) => <option key={b.id} value={b.slug}>{b.name}</option>)}</select></div>
          <div><label className="label">Category</label><select name="category" className="input"><option value="">All categories</option>{cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}</select></div>
          <div><label className="label">Fuel</label><select name="fuel" className="input"><option value="">Any</option>{fuels.map((f) => <option key={f.fuelType}>{f.fuelType}</option>)}</select></div>
          <div><label className="label">City</label><select name="city" className="input"><option value="">Any city</option>{s.cities.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label className="label">Max price ({s.currencySymbol})</label><input name="maxPrice" type="number" min={0} step={100000} placeholder="No limit" className="input" /></div>
          <button className="btn-primary h-[46px]"><Search size={16} /> Search</button>
        </form>
      </div>
    </section>
  );
}

async function VehicleGrid({ where, order, limit, s, three = false }: { where: object; order: object; limit: number; s: SiteSettings; three?: boolean }) {
  const items = await db.vehicle.findMany({ where: { published: true, deletedAt: null, ...where }, orderBy: order as never, take: limit, include: cardInclude });
  if (!items.length) return <p className="py-10 text-center text-charcoal-500">No vehicles to show yet.</p>;
  // flex-wrap + centred so an incomplete last row sits in the middle instead of leaving a hole
  const width = `w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] ${three ? "" : "xl:w-[calc(25%-18px)]"}`;
  return <div className="flex flex-wrap justify-center gap-6">{items.map((v, i) => <Reveal key={v.id} delay={(i % 4) * 90} className={width}><VehicleCard v={v} symbol={s.currencySymbol} /></Reveal>)}</div>;
}

export async function FeaturedSection({ cfg, s }: Ctx) {
  return (
    <section className="py-20"><div className="container-x">
      <Title eyebrow="Showroom" title={cfg.title} subtitle={cfg.subtitle} link={{ href: "/inventory", label: "View all" }} />
      <VehicleGrid where={{ featured: true }} order={{ createdAt: "desc" }} limit={Number(cfg.limit) || 6} s={s} three />
    </div></section>
  );
}

export async function LatestSection({ cfg, s }: Ctx) {
  return (
    <section className="bg-white py-20"><div className="container-x">
      <Title eyebrow="Just in" title={cfg.title} subtitle={cfg.subtitle} link={{ href: "/inventory?sort=newest", label: "See more" }} />
      <VehicleGrid where={{}} order={{ createdAt: "desc" }} limit={Number(cfg.limit) || 8} s={s} />
    </div></section>
  );
}

export async function BrandsSection({ cfg }: Ctx) {
  const brands = await db.brand.findMany({ where: { active: true, deletedAt: null, vehicles: { some: { published: true, deletedAt: null } } }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  if (!brands.length) return null;
  return (
    <section className="py-20"><div className="container-x">
      <Title eyebrow="Marques" title={cfg.title} />
      <div className="grid grid-cols-2 gap-px bg-ink/10 sm:grid-cols-3 lg:grid-cols-5">
        {brands.map((b) => (
          <Link key={b.id} href={`/inventory?brand=${b.slug}`} className="group flex h-32 flex-col items-center justify-center gap-2 bg-bone p-4 transition hover:bg-white">
            {b.logoUrl /* eslint-disable-next-line @next/next/no-img-element */ ? <img src={b.logoUrl} alt={b.name} className="max-h-12 w-auto object-contain" loading="lazy" /> : null}
            <span className="text-sm font-semibold uppercase tracking-wider group-hover:text-accent-ink">{b.name}</span>
          </Link>
        ))}
      </div>
    </div></section>
  );
}

export async function CategoriesSection({ cfg }: Ctx) {
  const cats = await db.category.findMany({ where: { active: true, deletedAt: null }, orderBy: { sortOrder: "asc" }, include: { _count: { select: { vehicles: { where: { published: true, deletedAt: null } } } } } });
  if (!cats.length) return null;
  return (
    <section className="bg-ink py-20 text-white"><div className="container-x">
      <Title eyebrow="Body styles" title={cfg.title} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cats.map((c) => (
          <Link key={c.id} href={`/inventory?category=${c.slug}`} className="group relative flex h-40 flex-col justify-end overflow-hidden border border-white/10 p-5 transition hover:border-accent">
            {c.imageUrl && /* eslint-disable-next-line @next/next/no-img-element */ <img src={c.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 transition group-hover:scale-105" loading="lazy" />}
            <span className="relative text-xl font-semibold">{c.name}</span>
            <span className="relative text-xs uppercase tracking-wider text-white/75">{c._count.vehicles} vehicles</span>
          </Link>
        ))}
      </div>
    </div></section>
  );
}

const ICONS = [ShieldCheck, BadgeDollarSign, Landmark, Wrench];
export async function WhySection({ cfg }: Ctx) {
  const items: { title: string; text: string }[] = cfg.items ?? [];
  return (
    <section className="bg-white py-20"><div className="container-x">
      <Title eyebrow="The difference" title={cfg.title} />
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => { const Icon = ICONS[i % ICONS.length]; return (
          <div key={i}><Icon className="text-accent-ink" size={32} strokeWidth={1.4} /><h3 className="mt-5 text-xl font-semibold">{it.title}</h3><p className="mt-2 text-[15px] leading-7 text-charcoal-700">{it.text}</p></div>
        ); })}
      </div>
    </div></section>
  );
}

export async function AboutSection({ cfg }: Ctx) {
  return (
    <section className="py-20"><div className="container-x grid items-center gap-12 lg:grid-cols-2">
      <div className="aspect-[4/3] overflow-hidden bg-charcoal">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {cfg.image && <img src={cfg.image} alt="" className="h-full w-full object-cover" loading="lazy" />}
      </div>
      <div>
        <p className="eyebrow mb-3">Our dealership</p>
        <h2 className="text-3xl font-semibold sm:text-5xl">{cfg.title}</h2>
        <p className="mt-5 leading-7 text-charcoal-500">{cfg.text}</p>
        {cfg.ctaLabel && <Link href={cfg.ctaHref || "/about"} className="btn-outline mt-8">{cfg.ctaLabel}</Link>}
      </div>
    </div></section>
  );
}

export async function TestimonialsSection({ cfg }: Ctx) {
  const items = await db.testimonial.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" }, take: 6 });
  if (!items.length) return null;
  return (
    <section className="bg-charcoal py-20 text-white"><div className="container-x">
      <Title eyebrow="Reviews" title={cfg.title} link={{ href: "/reviews", label: "All reviews" }} />
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((t) => (
          <figure key={t.id} className="border border-white/10 p-7">
            <div className="flex gap-1 text-accent">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}</div>
            <blockquote className="mt-4 leading-7 text-ink/80">&ldquo;{t.quote}&rdquo;</blockquote>
            <figcaption className="mt-5 text-sm"><span className="font-semibold">{t.name}</span>{t.title && <span className="text-white/50"> · {t.title}</span>}</figcaption>
          </figure>
        ))}
      </div>
    </div></section>
  );
}

export async function BlogSection({ cfg }: Ctx) {
  const posts = await db.blogPost.findMany({ where: { published: true, deletedAt: null }, orderBy: { publishedAt: "desc" }, take: Number(cfg.limit) || 3 });
  if (!posts.length) return null;
  return (
    <section className="py-20"><div className="container-x">
      <Title eyebrow="Journal" title={cfg.title} link={{ href: "/blog", label: "All articles" }} />
      <div className="grid gap-8 md:grid-cols-3">
        {posts.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="group block">
            <div className="aspect-[16/10] overflow-hidden bg-charcoal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.coverUrl && <img src={p.coverUrl} alt={p.title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />}
            </div>
            <p className="mt-4 text-xs uppercase tracking-wider text-charcoal-700">{p.publishedAt && formatDate(p.publishedAt)}</p>
            <h3 className="mt-1 text-2xl font-semibold group-hover:text-accent-ink">{p.title}</h3>
            <p className="mt-2 text-sm text-charcoal-500">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </div></section>
  );
}

export async function NewsletterSection({ cfg }: Ctx) {
  return (
    <section className="bg-accent py-16 text-ink"><div className="container-x flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
      <div><h2 className="text-3xl font-semibold sm:text-4xl">{cfg.title}</h2><p className="mt-2 text-ink/80">{cfg.text}</p></div>
      <NewsletterForm />
    </div></section>
  );
}

export async function RichTextSection({ cfg }: Ctx) {
  return (
    <section className="py-16"><div className="container-x max-w-3xl">
      {cfg.title && <h2 className="mb-6 text-3xl font-semibold sm:text-4xl">{cfg.title}</h2>}
      <div className="prose-cms" dangerouslySetInnerHTML={{ __html: safeHtml(String(cfg.html || "")) }} />
    </div></section>
  );
}

export async function CtaSection({ cfg }: Ctx) {
  return (
    <section className="bg-ink py-20 text-center text-white"><div className="container-x">
      <h2 className="mx-auto max-w-2xl text-3xl font-semibold sm:text-5xl">{cfg.title}</h2>
      {cfg.text && <p className="mx-auto mt-4 max-w-xl text-white/70">{cfg.text}</p>}
      {cfg.ctaLabel && <Link href={cfg.ctaHref || "/contact"} className="btn-accent mt-8">{cfg.ctaLabel}</Link>}
    </div></section>
  );
}

export async function StatsSection({ cfg }: Ctx) {
  const items: { value: number | string; suffix?: string; label: string }[] = cfg.items ?? [];
  if (!items.length) return null;
  return (
    <section className="border-y border-ink/10 bg-white py-14"><div className="container-x grid grid-cols-2 gap-8 text-center md:grid-cols-4">
      {items.map((it, i) => (
        <div key={i}><p className="font-display text-5xl font-semibold text-accent-ink"><CountUp to={Number(it.value) || 0} suffix={it.suffix} /></p><p className="mt-2 text-xs font-semibold uppercase tracking-wide2 text-charcoal-700">{it.label}</p></div>
      ))}
    </div></section>
  );
}

export async function StepsSection({ cfg }: Ctx) {
  const items: { title: string; text: string }[] = cfg.items ?? [];
  return (
    <section className="on-dark bg-ink py-20 text-white"><div className="container-x">
      <Title eyebrow="Simple process" title={cfg.title} subtitle={cfg.subtitle} />
      <Slider dark>
        {items.map((it, i) => (
          <div key={i} className="h-full border border-white/10 bg-white/[0.03] p-8"><span className="font-display text-6xl font-semibold text-accent/80">{String(i + 1).padStart(2, "0")}</span><h3 className="mt-4 text-xl font-semibold">{it.title}</h3><p className="mt-2 text-sm leading-6 text-white/65">{it.text}</p></div>
        ))}
      </Slider>
    </div></section>
  );
}

export const SECTION_RENDERERS: Record<string, (c: Ctx) => Promise<React.ReactNode>> = {
  hero: HeroSection, search: SearchSection, featured: FeaturedSection, latest: LatestSection, brands: BrandsSection,
  categories: CategoriesSection, why: WhySection, about: AboutSection, testimonials: TestimonialsSection, blog: BlogSection,
  stats: StatsSection, steps: StepsSection, newsletter: NewsletterSection, richtext: RichTextSection, cta: CtaSection,
};
