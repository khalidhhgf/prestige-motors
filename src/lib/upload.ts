import "server-only";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import { HttpError } from "./auth";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

export type Stored = { url: string; thumbUrl: string; publicId: string; width: number; height: number; size: number; mimeType: string };

/** Validate by magic bytes (not just the client-declared MIME), re-encode to WebP, create thumbnail. */
export async function storeImage(file: File, folder = "general"): Promise<Stored> {
  if (file.size > MAX_BYTES) throw new HttpError(413, "Image exceeds 10MB limit");
  if (!ALLOWED[file.type]) throw new HttpError(415, "Only JPEG, PNG, WebP or AVIF images are allowed");
  const input = Buffer.from(await file.arrayBuffer());

  let meta;
  try {
    meta = await sharp(input).metadata();
  } catch {
    throw new HttpError(415, "File is not a valid image");
  }
  if (!meta.format || !["jpeg", "png", "webp", "avif", "heif"].includes(meta.format))
    throw new HttpError(415, "File is not a valid image");

  const main = await sharp(input).rotate().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  const thumb = await sharp(input).rotate().resize({ width: 480, height: 320, fit: "cover" }).webp({ quality: 75 }).toBuffer();
  const id = crypto.randomUUID();
  const safeFolder = folder.replace(/[^a-z0-9-_]/gi, "").slice(0, 40) || "general";

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    const res = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: `dealership/${safeFolder}`, public_id: id, resource_type: "image" }, (err, r) =>
          err || !r ? reject(err) : resolve(r as never),
        )
        .end(main.data);
    });
    const thumbUrl = res.secure_url.replace("/upload/", "/upload/c_fill,w_480,h_320,q_auto,f_auto/");
    return { url: res.secure_url, thumbUrl, publicId: res.public_id, width: main.info.width, height: main.info.height, size: main.info.size, mimeType: "image/webp" };
  }

  const dir = path.join(process.cwd(), "uploads", safeFolder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${id}.webp`), main.data);
  await fs.writeFile(path.join(dir, `${id}-thumb.webp`), thumb);
  return {
    url: `/uploads/${safeFolder}/${id}.webp`,
    thumbUrl: `/uploads/${safeFolder}/${id}-thumb.webp`,
    publicId: `${safeFolder}/${id}`,
    width: main.info.width,
    height: main.info.height,
    size: main.info.size,
    mimeType: "image/webp",
  };
}

export async function removeStored(publicId: string | null, url: string) {
  try {
    if (url.startsWith("/uploads/")) {
      const base = process.cwd();
      const rel = url.replace(/^\/uploads\//, "");
      const full = path.resolve(base, "uploads", rel);
      if (!full.startsWith(path.join(base, "uploads") + path.sep)) return; // never delete outside the uploads dir
      await fs.rm(full, { force: true });
      await fs.rm(full.replace(".webp", "-thumb.webp"), { force: true });
    } else if (publicId && process.env.CLOUDINARY_CLOUD_NAME) {
      const { v2: cloudinary } = await import("cloudinary");
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (e) {
    console.error("failed to remove stored file", e);
  }
}
