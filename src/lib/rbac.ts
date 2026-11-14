// Role → permission matrix. Permissions are checked server-side on every admin API
// call and page. SUPER_ADMIN holds "*".
export type Role = "SUPER_ADMIN" | "ADMIN" | "INVENTORY_MANAGER" | "SALES_MANAGER" | "CONTENT_MANAGER";

export const PERMISSIONS = [
  "dashboard",
  "vehicles",
  "brands",
  "categories",
  "leads",
  "testdrives",
  "cms",
  "media",
  "settings",
  "users",
  "logs",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  INVENTORY_MANAGER: "Inventory Manager",
  SALES_MANAGER: "Sales Manager",
  CONTENT_MANAGER: "Content Manager",
};

const MATRIX: Record<Role, Permission[] | "*"> = {
  SUPER_ADMIN: "*",
  ADMIN: ["dashboard", "vehicles", "brands", "categories", "leads", "testdrives", "cms", "media", "settings", "logs"],
  INVENTORY_MANAGER: ["dashboard", "vehicles", "brands", "categories", "media"],
  SALES_MANAGER: ["dashboard", "leads", "testdrives", "vehicles"],
  CONTENT_MANAGER: ["dashboard", "cms", "media"],
};

export function can(role: Role, perm: Permission): boolean {
  const m = MATRIX[role];
  return m === "*" || m.includes(perm);
}

export function permissionsFor(role: Role): Permission[] {
  const m = MATRIX[role];
  return m === "*" ? [...PERMISSIONS] : m;
}
