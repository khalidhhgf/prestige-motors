import "server-only";
import { z } from "zod";
import { db } from "./db";
import type { Permission } from "./rbac";
import { optStr, emptyToNull } from "./validators";
import { toSlug, safeHtml } from "./text";

/**
 * Registry of simple CRUD resources driven by one generic API
 * (/api/admin/r/[resource]). Adding a new managed resource = one entry here.
 */
type Delegate = {
  findMany: (a?: unknown) => Promise<unknown[]>;
  findUnique: (a: unknown) => Promise<unknown>;
  create: (a: unknown) => Promise<unknown>;
  update: (a: unknown) => Promise<unknown>;
  delete: (a: unknown) => Promise<unknown>;
  count: (a?: unknown) => Promise<number>;
};
export type Resource = {
  model: Delegate;
  perm: Permission;
  schema: z.ZodType<Record<string, unknown>>;
  orderBy: unknown;
  softDelete?: boolean; // sets deletedAt instead of removing
  prepare?: (data: Record<string, unknown>, isCreate: boolean) => Promise<Record<string, unknown>> | Record<string, unknown>;
  include?: unknown;
  protectDelete?: (id: string) => Promise<string | null>; // return error message to block
};

const bool = z.boolean().default(true);
const int = z.coerce.number().int().default(0);
const url = z.preprocess(emptyToNull, z.string().max(1000).nullish());

async function uniqueSlug(modelName: "brand" | "category" | "blogPost" | "page", base: string, excludeId?: string) {
  const m = db[modelName] as unknown as Delegate;
  let s = toSlug(base);
  let n = 1;
  for (;;) {
    const hit = (await m.findUnique({ where: { slug: s } })) as { id: string } | null;
    if (!hit || hit.id === excludeId) return s;
    s = `${toSlug(base)}-${++n}`;
  }
}

export const RESOURCES: Record<string, Resource> = {
  brands: {
    model: db.brand as unknown as Delegate,
    perm: "brands",
    softDelete: true,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    schema: z.object({ name: z.string().trim().min(1).max(60), logoUrl: url, description: optStr(500), active: bool, sortOrder: int }),
    prepare: async (d, c) => (c ? { ...d, slug: await uniqueSlug("brand", String(d.name)) } : d),
    protectDelete: async (id) =>
      (await db.vehicle.count({ where: { brandId: id, deletedAt: null } })) > 0 ? "This brand still has vehicles. Reassign or delete them first, or disable the brand instead." : null,
  },
  categories: {
    model: db.category as unknown as Delegate,
    perm: "categories",
    softDelete: true,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    schema: z.object({ name: z.string().trim().min(1).max(60), description: optStr(300), imageUrl: url, icon: optStr(40), active: bool, sortOrder: int }),
    prepare: async (d, c) => (c ? { ...d, slug: await uniqueSlug("category", String(d.name)) } : d),
  },
  features: {
    model: db.feature as unknown as Delegate,
    perm: "vehicles",
    orderBy: [{ group: "asc" }, { name: "asc" }],
    schema: z.object({ name: z.string().trim().min(1).max(60), group: z.string().trim().min(1).max(40).default("General") }),
  },
  testimonials: {
    model: db.testimonial as unknown as Delegate,
    perm: "cms",
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    schema: z.object({ name: z.string().trim().min(1).max(80), title: optStr(80), quote: z.string().trim().min(5).max(1000), rating: z.coerce.number().int().min(1).max(5).default(5), avatarUrl: url, published: bool, sortOrder: int }),
  },
  faqs: {
    model: db.faq as unknown as Delegate,
    perm: "cms",
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    schema: z.object({ question: z.string().trim().min(3).max(300), answer: z.string().trim().min(2).max(3000), published: bool, sortOrder: int }),
  },
  blog: {
    model: db.blogPost as unknown as Delegate,
    perm: "cms",
    softDelete: true,
    orderBy: { createdAt: "desc" },
    schema: z.object({
      title: z.string().trim().min(3).max(160), excerpt: optStr(300), content: z.string().min(1).max(100000), coverUrl: url,
      author: optStr(80), published: bool.default(false), seoTitle: optStr(70), seoDescription: optStr(170),
    }),
    prepare: async (d, c) => {
      const out: Record<string, unknown> = { ...d, content: safeHtml(String(d.content)) };
      if (c) out.slug = await uniqueSlug("blogPost", String(d.title));
      if (d.published) out.publishedAt = new Date();
      return out;
    },
  },
  pages: {
    model: db.page as unknown as Delegate,
    perm: "cms",
    softDelete: true,
    orderBy: { title: "asc" },
    schema: z.object({
      title: z.string().trim().min(2).max(120), html: z.string().max(200000).default(""), published: bool, showInFooter: z.boolean().default(false),
      seoTitle: optStr(70), seoDescription: optStr(170), slug: z.string().trim().max(80).optional(),
    }),
    prepare: async (d, c) => {
      const { html, slug: wanted, ...rest } = d as { html: string; slug?: string };
      const out: Record<string, unknown> = { ...rest, content: { html: safeHtml(html) } };
      if (c) out.slug = await uniqueSlug("page", wanted || String(d.title));
      return out;
    },
    protectDelete: async (id) => {
      const p = (await db.page.findUnique({ where: { id } })) as { system: boolean } | null;
      return p?.system ? "Built-in pages can be unpublished and edited but not deleted." : null;
    },
  },
  sections: {
    model: db.cmsSection as unknown as Delegate,
    perm: "cms",
    orderBy: [{ sortOrder: "asc" }],
    schema: z.object({
      type: z.string().trim().min(1).max(30), title: optStr(120), enabled: bool, sortOrder: int,
      config: z.record(z.string(), z.unknown()).default({}), page: z.string().default("home"),
    }),
  },
  nav: {
    model: db.navItem as unknown as Delegate,
    perm: "cms",
    orderBy: [{ menu: "asc" }, { sortOrder: "asc" }],
    schema: z.object({
      menu: z.enum(["header", "footer"]).default("header"), label: z.string().trim().min(1).max(40),
      href: z.string().trim().min(1).max(300).regex(/^(\/|https?:\/\/|tel:|mailto:)/, "Use /path or a full URL"), enabled: bool, sortOrder: int,
    }),
  },
  subscribers: {
    model: db.subscriber as unknown as Delegate,
    perm: "leads",
    orderBy: { createdAt: "desc" },
    schema: z.object({ email: z.string().email() }),
  },
};

export const MAX_PAGE = 200;
