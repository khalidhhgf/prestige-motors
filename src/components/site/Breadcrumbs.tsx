import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { SITE_URL } from "@/lib/format";

export default function Breadcrumbs({ items, dark = false }: { items: { label: string; href?: string }[]; dark?: boolean }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className={`text-[13px] ${dark ? "text-white/75" : "text-charcoal-700"}`}>
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-2">
              {it.href ? <Link href={it.href} className="inline-block py-1.5 hover:underline">{it.label}</Link> : <span aria-current="page">{it.label}</span>}
              {i < items.length - 1 && <span>/</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org", "@type": "BreadcrumbList",
          itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.label, item: it.href ? SITE_URL + it.href : undefined })),
        }}
      />
    </>
  );
}
