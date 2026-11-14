import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import LeadForm from "@/components/site/LeadForm";

export const metadata: Metadata = { title: "Sell Your Car", description: "Get a fair, fast evaluation for your car." };

export default function SellPage() {
  return (
    <>
      <PageHero title="Sell Your Car" subtitle="Tell us about your vehicle and we'll arrange a no-obligation evaluation." crumbs={[{ label: "Sell Your Car" }]} />
      <div className="container-x max-w-3xl py-14">
        <div className="bg-white p-6 sm:p-8">
          <LeadForm type="SELL_CAR" submitLabel="Request evaluation" messageLabel="Car details (make, model, year, mileage, city, expected price)" />
        </div>
      </div>
    </>
  );
}
