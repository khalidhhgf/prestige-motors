// Tiny fetch helper for client components. Throws Error(message) with server-provided message.
export async function api<T = unknown>(url: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(url, {
    method: opts.method ?? (opts.body ? "POST" : "GET"),
    headers: opts.body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    body: opts.body === undefined ? undefined : opts.body instanceof FormData ? opts.body : JSON.stringify(opts.body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const first = Array.isArray(data.details) && data.details[0] ? ` (${data.details[0].path}: ${data.details[0].message})` : "";
    throw new Error((data.error ?? "Request failed") + first);
  }
  return data as T;
}
