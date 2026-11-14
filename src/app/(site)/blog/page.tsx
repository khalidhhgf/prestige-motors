import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import PageHero from "@/components/site/PageHero";

export const metadata: Metadata = { title: "Blog", description: "Automotive news, buying guides and insights." };
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await db.blogPost.findMany({ where: { published: true, deletedAt: null }, orderBy: { publishedAt: "desc" } });
  return (
    <>
      <PageHero title="News & Insights" crumbs={[{ label: "Blog" }]} />
      <div className="container-x grid gap-8 py-14 md:grid-cols-2 lg:grid-cols-3">
        {posts.length === 0 && <p className="text-charcoal-500">No articles yet.</p>}
        {posts.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="group block bg-white">
            <div className="aspect-[16/10] overflow-hidden bg-charcoal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.coverUrl && <img src={p.coverUrl} alt={p.title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />}
            </div>
            <div className="p-6">
              <p className="text-xs uppercase tracking-wider text-charcoal-500">{p.publishedAt && formatDate(p.publishedAt)}</p>
              <h2 className="mt-1 text-2xl font-semibold group-hover:text-accent">{p.title}</h2>
              <p className="mt-2 text-sm text-charcoal-500">{p.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
