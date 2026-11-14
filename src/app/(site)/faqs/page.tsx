import type { Metadata } from "next";
import { db } from "@/lib/db";
import PageHero from "@/components/site/PageHero";
import { JsonLd } from "@/components/site/JsonLd";

export const metadata: Metadata = { title: "FAQs", description: "Answers to common questions about buying, financing and selling." };
export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const faqs = await db.faq.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } });
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }} />
      <PageHero title="Frequently Asked Questions" crumbs={[{ label: "FAQs" }]} />
      <div className="container-x max-w-3xl py-14">
        {faqs.length === 0 && <p className="text-charcoal-500">No questions published yet.</p>}
        <div className="divide-y divide-ink/10 bg-white">
          {faqs.map((f) => (
            <details key={f.id} className="group p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold">{f.question}<span className="text-accent transition group-open:rotate-45">+</span></summary>
              <p className="mt-3 whitespace-pre-line leading-7 text-charcoal-500">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
