import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { SECTION_RENDERERS } from "@/components/site/sections";

export default async function HomePage() {
  const [s, sections] = await Promise.all([
    getSettings(),
    db.cmsSection.findMany({ where: { page: "home", enabled: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <>
      {await Promise.all(
        sections.map(async (sec) => {
          const R = SECTION_RENDERERS[sec.type];
          return R ? <div key={sec.id}>{await R({ cfg: (sec.config ?? {}) as Record<string, unknown>, s })}</div> : null;
        }),
      )}
    </>
  );
}
