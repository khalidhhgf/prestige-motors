import { describe, it, expect } from "vitest";
import { can, permissionsFor } from "@/lib/rbac";
import { formatPrice, formatFullPrice, whatsappLink, vehicleWhatsappMessage } from "@/lib/format";
import { toSlug, plain, safeHtml, normalizePkPhone } from "@/lib/text";
import { rateLimit } from "@/lib/ratelimit";
import { parseFilters } from "@/lib/filters";
import { buildWhere, buildOrder } from "@/lib/vehicles";
import { vehicleSchema, leadPublicSchema, userSchema } from "@/lib/validators";

describe("RBAC", () => {
  it("super admin can do everything", () => {
    for (const p of permissionsFor("SUPER_ADMIN")) expect(can("SUPER_ADMIN", p)).toBe(true);
    expect(can("SUPER_ADMIN", "users")).toBe(true);
  });
  it("only super admin manages users", () => {
    expect(can("ADMIN", "users")).toBe(false);
    expect(can("INVENTORY_MANAGER", "users")).toBe(false);
  });
  it("roles are limited to their modules", () => {
    expect(can("INVENTORY_MANAGER", "vehicles")).toBe(true);
    expect(can("INVENTORY_MANAGER", "leads")).toBe(false);
    expect(can("SALES_MANAGER", "leads")).toBe(true);
    expect(can("SALES_MANAGER", "settings")).toBe(false);
    expect(can("CONTENT_MANAGER", "cms")).toBe(true);
    expect(can("CONTENT_MANAGER", "vehicles")).toBe(false);
  });
});

describe("formatting", () => {
  it("uses lacs / crore shorthand", () => {
    expect(formatPrice(3_150_000)).toBe("Rs. 31.5 Lacs");
    expect(formatPrice(89_500_000)).toBe("Rs. 8.95 Crore");
    expect(formatPrice(50_000)).toBe("Rs. 50,000");
  });
  it("formats full price", () => expect(formatFullPrice(7850000)).toBe("Rs. 7,850,000"));
  it("builds a WhatsApp link with vehicle name, year, price and URL", () => {
    const msg = vehicleWhatsappMessage({ title: "Honda Civic", year: 2023, price: 11250000, slug: "honda-civic-2023" });
    expect(msg).toContain("Honda Civic");
    expect(msg).toContain("2023");
    expect(msg).toContain("/inventory/honda-civic-2023");
    const link = whatsappLink("+92 300 1234567", msg);
    expect(link.startsWith("https://wa.me/923001234567?text=")).toBe(true);
  });
});

describe("text utils", () => {
  it("slugifies", () => expect(toSlug("Mercedes-Benz S-Class!")).toBe("mercedes-benz-s-class"));
  it("strips tags from plain input", () => expect(plain("<b>Hi</b><script>x()</script> there")).not.toContain("<"));
  it("sanitises CMS html", () => {
    const out = safeHtml('<p onclick="x()">ok</p><script>bad()</script><a href="javascript:alert(1)">l</a>');
    expect(out).not.toContain("script");
    expect(out).not.toContain("onclick");
    expect(out).not.toContain("javascript:");
  });
  it("normalises Pakistani phone numbers", () => {
    expect(normalizePkPhone("0300 1234567")).toBe("+923001234567");
    expect(normalizePkPhone("923001234567")).toBe("+923001234567");
    expect(normalizePkPhone("+92-300-1234567")).toBe("+923001234567");
  });
});

describe("rate limiter", () => {
  it("blocks after limit", () => {
    const k = "t:" + Math.random();
    for (let i = 0; i < 3; i++) expect(rateLimit(k, 3, 1000).ok).toBe(true);
    expect(rateLimit(k, 3, 1000).ok).toBe(false);
  });
});

describe("inventory filters", () => {
  it("parses numeric and string params safely", () => {
    const f = parseFilters({ minPrice: "1000", maxPrice: "abc", brand: "toyota", maxMileage: "" });
    expect(f.minPrice).toBe(1000);
    expect(f.maxPrice).toBeUndefined();
    expect(f.maxMileage).toBeUndefined();
    expect(f.brand).toBe("toyota");
  });
  it("always restricts to published, non-deleted vehicles", () => {
    const w = buildWhere({ brand: "toyota", minYear: 2020 }) as { AND: object[] };
    expect(JSON.stringify(w.AND[0])).toContain('"published":true');
    expect(JSON.stringify(w.AND[0])).toContain('"deletedAt":null');
    expect(w.AND.length).toBe(3);
  });
  it("ignores unknown enum values", () => {
    const w = buildWhere({ condition: "HACKED", availability: "DROP TABLE" }) as { AND: object[] };
    expect(w.AND.length).toBe(1);
  });
  it("sorts", () => {
    expect(buildOrder("price-asc")).toEqual([{ price: "asc" }]);
    expect(buildOrder("year-desc")[0]).toEqual({ year: "desc" });
  });
});

describe("validation", () => {
  const base = { title: "Toyota Corolla", brandId: "b1", price: 5000000, year: 2020 };
  it("accepts a minimal vehicle and applies defaults", () => {
    const v = vehicleSchema.parse(base);
    expect(v.status).toBe("AVAILABLE");
    expect(v.published).toBe(false);
    expect(v.images).toEqual([]);
  });
  it("rejects bad vehicles", () => {
    expect(vehicleSchema.safeParse({ ...base, price: -1 }).success).toBe(false);
    expect(vehicleSchema.safeParse({ ...base, year: 1800 }).success).toBe(false);
    expect(vehicleSchema.safeParse({ ...base, title: "x" }).success).toBe(false);
  });
  it("turns empty optional strings into null", () => {
    const v = vehicleSchema.parse({ ...base, engineCc: "", auctionGrade: "" });
    expect(v.engineCc).toBeNull();
    expect(v.auctionGrade).toBeNull();
  });
  it("validates leads", () => {
    expect(leadPublicSchema.safeParse({ name: "Ali Khan", phone: "0300 1234567" }).success).toBe(true);
    expect(leadPublicSchema.safeParse({ name: "Ali", phone: "abc" }).success).toBe(false);
  });
  it("enforces password length for users", () => {
    expect(userSchema.safeParse({ name: "Sam Lee", email: "a@b.co", role: "ADMIN", password: "short" }).success).toBe(false);
    expect(userSchema.safeParse({ name: "Sam Lee", email: "A@B.co", role: "ADMIN", password: "longenough123" }).success).toBe(true);
  });
});
