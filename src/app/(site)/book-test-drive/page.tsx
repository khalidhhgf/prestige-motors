import type { Metadata } from "next";
import { db } from "@/lib/db";
import PageHero from "@/components/site/PageHero";
import LeadForm from "@/components/site/LeadForm";

export const metadata: Metadata = { title: "Book a Test Drive", description: "Reserve a time to experience your next car." };
export const dynamic = "force-dynamic";

export default async function TestDrivePage({ searchParams }: { searchParams: Promise<{ vehicle?: string }> }) {
  const { vehicle: slug } = await searchParams;
  const v = slug ? await db.vehicle.findFirst({ where: { slug, published: true, deletedAt: null }, select: { id: true, title: true, year: true } }) : null;
  return (
    <>
      <PageHero title="Book a Test Drive" subtitle={v ? `${v.title} (${v.year})` : "Choose a vehicle and a time that suits you."} crumbs={[{ label: "Test Drive" }]} />
      <div className="container-x max-w-3xl py-14">
        <div className="bg-white p-6 sm:p-8">
          <LeadForm testDrive vehicleId={v?.id} submitLabel="Request test drive" messageLabel={v ? "Notes (optional)" : "Which vehicle are you interested in?"} />
        </div>
      </div>
    </>
  );
}
