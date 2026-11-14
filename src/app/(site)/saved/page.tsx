import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import PageHero from "@/components/site/PageHero";
import { SavedList } from "@/components/site/Saved";

export const metadata: Metadata = { title: "Saved Cars", robots: { index: false } };

export default async function SavedPage() {
  const s = await getSettings();
  return (
    <>
      <PageHero title="Saved Cars" subtitle="Your shortlist, stored on this device." crumbs={[{ label: "Saved" }]} />
      <div className="container-x py-14"><SavedList symbol={s.currencySymbol} /></div>
    </>
  );
}
