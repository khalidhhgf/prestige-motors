import { adminRoute } from "@/lib/api";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/auth";
import { storeImage } from "@/lib/upload";
import { logActivity } from "@/lib/activity";
import { rateLimit } from "@/lib/ratelimit";

// Media can be uploaded by anyone who can edit vehicles or content; permission "media".
export const GET = adminRoute("media", async (req) => {
  const u = new URL(req.url);
  const q = u.searchParams.get("q") ?? "";
  const folder = u.searchParams.get("folder");
  const page = Math.max(1, Number(u.searchParams.get("page") ?? 1));
  const where = {
    ...(q ? { filename: { contains: q, mode: "insensitive" as const } } : {}),
    ...(folder ? { folder } : {}),
  };
  const [items, total, folders] = await Promise.all([
    db.media.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * 48, take: 48 }),
    db.media.count({ where }),
    db.media.groupBy({ by: ["folder"], _count: true }),
  ]);
  return { items, total, folders: folders.map((f) => ({ name: f.folder, count: f._count })) };
});

export const POST = adminRoute("media", async (req, user) => {
  if (!rateLimit(`upload:${user.id}`, 60, 60_000).ok) throw new HttpError(429, "Upload rate limit reached");
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) throw new HttpError(400, "No files provided");
  if (files.length > 20) throw new HttpError(400, "Max 20 files per upload");
  const folder = String(form.get("folder") || "general");
  const out = [];
  for (const file of files) {
    const s = await storeImage(file, folder);
    const m = await db.media.create({
      data: {
        url: s.url, thumbUrl: s.thumbUrl, publicId: s.publicId, filename: file.name.slice(0, 160), folder: folder.replace(/[^a-z0-9-_]/gi, "").slice(0, 40) || "general",
        mimeType: s.mimeType, size: s.size, width: s.width, height: s.height,
      },
    });
    out.push(m);
  }
  await logActivity(user, "media.upload", "media", null, `${out.length} file(s)`);
  return { items: out };
});
