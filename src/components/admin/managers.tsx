"use client";
import ResourceManager, { Badge, type Field } from "./ResourceManager";
import { ROLE_LABELS } from "@/lib/rbac";
import { formatDate } from "@/lib/format";

const roleOpts = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));
const thumb = (u?: string | null) => (u ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={u} alt="" className="h-9 w-14 rounded object-cover" /> : <span className="text-slate-400">—</span>);

export const BrandsManager = () => (
  <ResourceManager endpoint="/api/admin/r/brands" title="Brands" desc="Manage the car brands shown in filters and on the homepage." newLabel="Add brand" orderable
    defaults={{ active: true, sortOrder: 0 }}
    columns={[{ key: "logoUrl", label: "Logo", render: (r) => thumb(r.logoUrl) }, { key: "name", label: "Name" }, { key: "active", label: "Status", render: (r) => <Badge on={r.active} /> }]}
    fields={[{ key: "name", label: "Brand name", type: "text", required: true }, { key: "logoUrl", label: "Logo", type: "image" }, { key: "description", label: "Description", type: "textarea" }, { key: "active", label: "Enabled (visible on website)", type: "checkbox" }]} />
);

export const CategoriesManager = () => (
  <ResourceManager endpoint="/api/admin/r/categories" title="Categories" desc="Body styles / vehicle categories. Create as many as you need." newLabel="Add category" orderable
    defaults={{ active: true, sortOrder: 0 }}
    columns={[{ key: "imageUrl", label: "Image", render: (r) => thumb(r.imageUrl) }, { key: "name", label: "Name" }, { key: "active", label: "Status", render: (r) => <Badge on={r.active} /> }]}
    fields={[{ key: "name", label: "Category name", type: "text", required: true }, { key: "description", label: "Description", type: "textarea", rows: 2 }, { key: "imageUrl", label: "Tile image", type: "image" }, { key: "active", label: "Enabled", type: "checkbox" }]} />
);

export const FeaturesManager = () => (
  <ResourceManager endpoint="/api/admin/r/features" title="Vehicle features" desc="Reusable features you can tick on each vehicle (e.g. Sunroof, ABS)." newLabel="Add feature"
    defaults={{ group: "General" }}
    columns={[{ key: "name", label: "Feature" }, { key: "group", label: "Group" }]}
    fields={[{ key: "name", label: "Feature name", type: "text", required: true }, { key: "group", label: "Group", type: "select", options: ["General", "Exterior", "Interior", "Technology", "Safety", "Comfort"].map((v) => ({ value: v, label: v })) }]} />
);

export const TestimonialsManager = () => (
  <ResourceManager endpoint="/api/admin/r/testimonials" title="Testimonials" desc="Customer reviews shown on the homepage and Reviews page." newLabel="Add testimonial" orderable
    defaults={{ rating: 5, published: true, sortOrder: 0 }}
    columns={[{ key: "name", label: "Customer" }, { key: "quote", label: "Quote", render: (r) => <span className="line-clamp-1 max-w-md">{r.quote}</span> }, { key: "rating", label: "★" }, { key: "published", label: "Status", render: (r) => <Badge on={r.published} yes="Published" no="Draft" /> }]}
    fields={[{ key: "name", label: "Customer name", type: "text", required: true }, { key: "title", label: "City / title", type: "text" }, { key: "quote", label: "Review", type: "textarea", required: true }, { key: "rating", label: "Rating (1–5)", type: "number" }, { key: "published", label: "Published", type: "checkbox" }]} />
);

export const FaqsManager = () => (
  <ResourceManager endpoint="/api/admin/r/faqs" title="FAQs" desc="Frequently asked questions shown on the FAQ page." newLabel="Add FAQ" orderable
    defaults={{ published: true, sortOrder: 0 }}
    columns={[{ key: "question", label: "Question" }, { key: "published", label: "Status", render: (r) => <Badge on={r.published} yes="Published" no="Draft" /> }]}
    fields={[{ key: "question", label: "Question", type: "text", required: true }, { key: "answer", label: "Answer", type: "textarea", required: true }, { key: "published", label: "Published", type: "checkbox" }]} />
);

export const BlogManager = () => (
  <ResourceManager endpoint="/api/admin/r/blog" resource="blog" title="Blog posts" desc="News, guides and insights. Content supports basic HTML (h2, p, ul, a, img)." newLabel="New post" wide
    defaults={{ published: false }}
    columns={[{ key: "title", label: "Title" }, { key: "published", label: "Status", render: (r) => <Badge on={r.published} yes="Published" no="Draft" /> }, { key: "updatedAt", label: "Updated", render: (r) => formatDate(r.updatedAt) }]}
    fields={[{ key: "title", label: "Title", type: "text", required: true }, { key: "excerpt", label: "Short excerpt", type: "textarea", rows: 2 }, { key: "coverUrl", label: "Cover image", type: "image" }, { key: "content", label: "Content (HTML)", type: "html", required: true }, { key: "author", label: "Author", type: "text" }, { key: "seoTitle", label: "SEO title", type: "text" }, { key: "seoDescription", label: "SEO description", type: "textarea", rows: 2 }, { key: "published", label: "Published", type: "checkbox" }]} />
);

export const PagesManager = () => (
  <ResourceManager endpoint="/api/admin/r/pages" title="Pages" desc="About, Services, Financing, Privacy, Terms and any custom page. New pages are available at /your-slug." newLabel="Add page" wide
    defaults={{ published: true, showInFooter: false, html: "" }}
    canDelete={(r) => !r.system}
    toForm={(r) => ({ ...r, html: r.content?.html ?? "" })}
    columns={[{ key: "title", label: "Title" }, { key: "slug", label: "URL", render: (r) => <a className="underline" href={`/${r.slug}`} target="_blank">/{r.slug}</a> }, { key: "published", label: "Status", render: (r) => <Badge on={r.published} yes="Published" no="Draft" /> }]}
    fields={[{ key: "title", label: "Page title", type: "text", required: true }, { key: "html", label: "Content (HTML)", type: "html" }, { key: "showInFooter", label: "Show link in footer", type: "checkbox" }, { key: "published", label: "Published", type: "checkbox" }, { key: "seoTitle", label: "SEO title", type: "text" }, { key: "seoDescription", label: "SEO description", type: "textarea", rows: 2 }]} />
);

export const NavManager = () => (
  <ResourceManager endpoint="/api/admin/r/nav" resource="nav" title="Navigation menus" desc="Header and footer links. Use the arrows to reorder." newLabel="Add link" orderable
    defaults={{ menu: "header", enabled: true, sortOrder: 99 }}
    columns={[{ key: "menu", label: "Menu" }, { key: "label", label: "Label" }, { key: "href", label: "Link" }, { key: "enabled", label: "Status", render: (r) => <Badge on={r.enabled} yes="Visible" no="Hidden" /> }]}
    fields={[{ key: "menu", label: "Menu", type: "select", options: [{ value: "header", label: "Header" }, { value: "footer", label: "Footer" }] }, { key: "label", label: "Label", type: "text", required: true }, { key: "href", label: "Link (/path or https://…)", type: "text", required: true }, { key: "enabled", label: "Visible", type: "checkbox" }]} />
);

export const SubscribersManager = () => (
  <ResourceManager endpoint="/api/admin/r/subscribers" title="Newsletter subscribers" readOnly
    columns={[{ key: "email", label: "Email" }, { key: "createdAt", label: "Subscribed", render: (r) => formatDate(r.createdAt) }]} fields={[]} />
);

export const UsersManager = () => (
  <ResourceManager endpoint="/api/admin/users" resource="users" title="Users & roles" desc="Super Admin: everything · Admin: all but users · Inventory Manager: vehicles, brands, categories, media · Sales Manager: leads, test drives · Content Manager: CMS, media." newLabel="Add user"
    defaults={{ role: "CONTENT_MANAGER", active: true }}
    toForm={(r) => ({ ...r, password: "" })}
    columns={[{ key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "role", label: "Role", render: (r) => ROLE_LABELS[r.role as keyof typeof ROLE_LABELS] }, { key: "active", label: "Status", render: (r) => <Badge on={r.active} /> }, { key: "lastLoginAt", label: "Last login", render: (r) => (r.lastLoginAt ? formatDate(r.lastLoginAt, true) : "Never") }]}
    fields={[{ key: "name", label: "Full name", type: "text", required: true }, { key: "email", label: "Email", type: "text", required: true }, { key: "role", label: "Role", type: "select", options: roleOpts }, { key: "password", label: "Password", type: "password", help: "Min 10 characters. Leave blank when editing to keep the current password." }, { key: "active", label: "Account active", type: "checkbox" }]} />
);

// ── Homepage sections: per-type field definitions drive the editor, so new content needs no code ──
const SECTION_TYPES: Record<string, { label: string; fields: Field[] }> = {
  hero: { label: "Hero banner", fields: [{ key: "config.eyebrow", label: "Eyebrow text", type: "text" }, { key: "config.headline", label: "Headline", type: "text", required: true }, { key: "config.subheadline", label: "Sub-headline", type: "textarea", rows: 2 }, { key: "config.image", label: "Background image", type: "image" }, { key: "config.ctaLabel", label: "Button label", type: "text" }, { key: "config.ctaHref", label: "Button link", type: "text" }, { key: "config.secondaryLabel", label: "Second button label", type: "text" }, { key: "config.secondaryHref", label: "Second button link", type: "text" }] },
  search: { label: "Vehicle search bar", fields: [{ key: "config.title", label: "Heading", type: "text" }] },
  featured: { label: "Featured vehicles", fields: [{ key: "config.title", label: "Heading", type: "text" }, { key: "config.subtitle", label: "Subtitle", type: "text" }, { key: "config.limit", label: "How many to show", type: "number" }] },
  latest: { label: "Latest arrivals", fields: [{ key: "config.title", label: "Heading", type: "text" }, { key: "config.subtitle", label: "Subtitle", type: "text" }, { key: "config.limit", label: "How many to show", type: "number" }] },
  stats: { label: "Trust numbers (animated)", fields: [{ key: "config.items", label: "Numbers", type: "list", itemFields: [{ key: "value", label: "Number", type: "text" }, { key: "suffix", label: "Suffix (e.g. +)", type: "text" }, { key: "label", label: "Label", type: "text" }] }] },
  steps: { label: "How it works (steps)", fields: [{ key: "config.title", label: "Heading", type: "text" }, { key: "config.subtitle", label: "Subtitle", type: "text" }, { key: "config.items", label: "Steps", type: "list", itemFields: [{ key: "title", label: "Title", type: "text" }, { key: "text", label: "Text", type: "textarea" }] }] },
  brands: { label: "Popular brands", fields: [{ key: "config.title", label: "Heading", type: "text" }] },
  categories: { label: "Browse by category", fields: [{ key: "config.title", label: "Heading", type: "text" }] },
  why: { label: "Why choose us", fields: [{ key: "config.title", label: "Heading", type: "text" }, { key: "config.items", label: "Points", type: "list", itemFields: [{ key: "title", label: "Title", type: "text" }, { key: "text", label: "Text", type: "textarea" }] }] },
  about: { label: "Dealership intro", fields: [{ key: "config.title", label: "Heading", type: "text" }, { key: "config.text", label: "Text", type: "textarea" }, { key: "config.image", label: "Image", type: "image" }, { key: "config.ctaLabel", label: "Button label", type: "text" }, { key: "config.ctaHref", label: "Button link", type: "text" }] },
  testimonials: { label: "Testimonials", fields: [{ key: "config.title", label: "Heading", type: "text" }] },
  blog: { label: "Latest news", fields: [{ key: "config.title", label: "Heading", type: "text" }, { key: "config.limit", label: "How many posts", type: "number" }] },
  newsletter: { label: "Newsletter signup", fields: [{ key: "config.title", label: "Heading", type: "text" }, { key: "config.text", label: "Text", type: "text" }] },
  richtext: { label: "Custom text block", fields: [{ key: "config.title", label: "Heading", type: "text" }, { key: "config.html", label: "Content (HTML)", type: "html" }] },
  cta: { label: "Call-to-action banner", fields: [{ key: "config.title", label: "Heading", type: "text", required: true }, { key: "config.text", label: "Text", type: "text" }, { key: "config.ctaLabel", label: "Button label", type: "text" }, { key: "config.ctaHref", label: "Button link", type: "text" }] },
};

export const SectionsManager = () => (
  <ResourceManager endpoint="/api/admin/r/sections" resource="sections" title="Homepage sections" desc="Add, remove, hide and reorder the sections of your homepage. The top-to-bottom order here is the order on the site." newLabel="Add section" orderable wide
    defaults={{ type: "richtext", enabled: true, sortOrder: 99, page: "home", config: {} }}
    columns={[{ key: "type", label: "Section", render: (r) => <b>{SECTION_TYPES[r.type]?.label ?? r.type}</b> }, { key: "title", label: "Heading", render: (r) => r.config?.title ?? r.config?.headline ?? "—" }, { key: "enabled", label: "Status", render: (r) => <Badge on={r.enabled} yes="Visible" no="Hidden" /> }]}
    fields={(v) => [
      { key: "type", label: "Section type", type: "select", options: Object.entries(SECTION_TYPES).map(([value, s]) => ({ value, label: s.label })) },
      { key: "enabled", label: "Visible on homepage", type: "checkbox" },
      ...(SECTION_TYPES[v.type]?.fields ?? []),
    ]} />
);
