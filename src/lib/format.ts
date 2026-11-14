export function formatPrice(value: number | string | { toString(): string }, symbol = "Rs.") {
  const n = Number(value.toString());
  if (!isFinite(n)) return "";
  // Pakistani convention: lakh / crore shorthand for large values
  if (n >= 10_000_000) return `${symbol} ${trim(n / 10_000_000)} Crore`;
  if (n >= 100_000) return `${symbol} ${trim(n / 100_000)} Lacs`;
  return `${symbol} ${n.toLocaleString("en-PK")}`;
}
const trim = (x: number) => String(Math.round(x * 100) / 100);

export const formatFullPrice = (v: number | string | { toString(): string }, symbol = "Rs.") =>
  `${symbol} ${Number(v.toString()).toLocaleString("en-PK")}`;

export const formatKm = (n: number) => `${n.toLocaleString("en-PK")} km`;

export const formatDate = (d: Date | string, withTime = false) =>
  new Date(d).toLocaleString("en-GB", {
    timeZone: "Asia/Karachi",
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export function whatsappLink(number: string, message: string) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function vehicleWhatsappMessage(v: { title: string; year: number; price: string | number; slug: string }, symbol = "Rs.") {
  return `Hello, I'm interested in the ${v.title} (${v.year}) listed at ${formatFullPrice(v.price, symbol)}.\n${SITE_URL}/inventory/${v.slug}\nIs it still available?`;
}
