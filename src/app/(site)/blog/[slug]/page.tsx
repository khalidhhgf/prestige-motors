import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, SITE_URL } from "@/lib/format";
import { safeHtml } from "@/lib/text";
import PageHero from "@/components/site/PageHero";
import { JsonLd } from "@/components/site/JsonLd";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ slug: string }> };
const load = (slug: string) => db.blogPost.findFirst({ where: { slug, published: true, deletedAt: null } });

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = await load((await params).slug);
  if (!p) return {};
  return {
    title: p.seoTitle || p.title, description: p.seoDescription || p.excerpt || undefined,
    alternates: { canonical: `${SITE_URL}/blog/${p.slug}` },
    openGraph: { type: "article", title: p.title, images: p.coverUrl ? [p.coverUrl] : undefined },
  };
}

export default async function PostPage({ params }: P) {
  const p = await load((await params).slug);
  if (!p) notFound();
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, datePublished: p.publishedAt, dateModified: p.updatedAt, author: { "@type": "Person", name: p.author || "Editorial Team" }, image: p.coverUrl || undefined }} />
      <PageHero title={p.title} subtitle={`${p.publishedAt ? formatDate(p.publishedAt) : ""}${p.author ? ` · ${p.author}` : ""}`} crumbs={[{ label: "Blog", href: "/blog" }, { label: p.title }]} />
      <article className="container-x max-w-3xl py-14">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.coverUrl && <img src={p.coverUrl} alt={p.title} className="mb-10 w-full" />}
        <div className="prose-cms" dangerouslySetInnerHTML={{ __html: safeHtml(p.content) }} />
      </article>
    </>
  );
}
