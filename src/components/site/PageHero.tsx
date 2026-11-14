import Breadcrumbs from "./Breadcrumbs";

export default function PageHero({ title, subtitle, crumbs }: { title: string; subtitle?: string; crumbs: { label: string; href?: string }[] }) {
  return (
    <section className="bg-ink py-14 text-white sm:py-20">
      <div className="container-x">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, ...crumbs]} dark />
        <h1 className="mt-5 text-4xl font-semibold sm:text-6xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-white/70">{subtitle}</p>}
      </div>
    </section>
  );
}
