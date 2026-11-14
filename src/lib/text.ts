import slugify from "slugify";
import sanitizeHtml from "sanitize-html";

export const toSlug = (s: string) => slugify(s, { lower: true, strict: true, trim: true }) || "item";

/** Strip all HTML – used for plain text user input (names, messages). */
export const plain = (s: string) => sanitizeHtml(s, { allowedTags: [], allowedAttributes: {} }).trim();

/** Allow a safe subset of HTML for CMS rich content. */
export const safeHtml = (s: string) =>
  sanitizeHtml(s, {
    allowedTags: ["h2", "h3", "h4", "p", "br", "strong", "em", "b", "i", "u", "ul", "ol", "li", "a", "blockquote", "img", "hr"],
    allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
  });

export const normalizePkPhone = (p: string) => {
  const d = p.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) return d;
  if (d.startsWith("00")) return "+" + d.slice(2);
  if (d.startsWith("92")) return "+" + d;
  if (d.startsWith("0")) return "+92" + d.slice(1);
  return d;
};
