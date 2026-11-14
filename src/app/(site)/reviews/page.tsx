import type { Metadata } from "next";
import { Star } from "lucide-react";
import { db } from "@/lib/db";
import PageHero from "@/components/site/PageHero";

export const metadata: Metadata = { title: "Customer Reviews", description: "What our customers say about us." };
export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const items = await db.testimonial.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } });
  return (
    <>
      <PageHero title="Customer Reviews" crumbs={[{ label: "Reviews" }]} />
      <div className="container-x grid gap-6 py-14 md:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 && <p className="text-charcoal-500">No reviews yet.</p>}
        {items.map((t) => (
          <figure key={t.id} className="bg-white p-7">
            <div className="flex gap-1 text-accent">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}</div>
            <blockquote className="mt-4 leading-7">&ldquo;{t.quote}&rdquo;</blockquote>
            <figcaption className="mt-5 text-sm"><span className="font-semibold">{t.name}</span>{t.title && <span className="text-charcoal-500"> · {t.title}</span>}</figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
