import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [vehicles, posts, pages] = await Promise.all([
    db.vehicle.findMany({ where: { published: true, deletedAt: null }, select: { slug: true, updatedAt: true } }),
    db.blogPost.findMany({ where: { published: true, deletedAt: null }, select: { slug: true, updatedAt: true } }),
    db.page.findMany({ where: { published: true, deletedAt: null }, select: { slug: true, updatedAt: true } }),
  ]);
  const fixed = ["", "/inventory", "/contact", "/faqs", "/reviews", "/blog", "/sell-your-car", "/book-test-drive"].map((p) => ({ url: SITE_URL + p, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 }));
  return [
    ...fixed,
    ...pages.map((p) => ({ url: `${SITE_URL}/${p.slug}`, lastModified: p.updatedAt, priority: 0.5 })),
    ...vehicles.map((v) => ({ url: `${SITE_URL}/inventory/${v.slug}`, lastModified: v.updatedAt, changeFrequency: "daily" as const, priority: 0.9 })),
    ...posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.updatedAt, priority: 0.5 })),
  ];
}
