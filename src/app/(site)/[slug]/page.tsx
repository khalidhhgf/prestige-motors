import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import PageHero from "@/components/site/PageHero";
import { safeHtml } from "@/lib/text";
import { SITE_URL } from "@/lib/format";
import LeadForm from "@/components/site/LeadForm";
import EmiCalculator from "@/components/site/EmiCalculator";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ slug: string }> };

const load = (slug: string) => db.page.findFirst({ where: { slug, published: true, deletedAt: null } });

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) return {};
  return { title: p.seoTitle || p.title, description: p.seoDescription || undefined, alternates: { canonical: `${SITE_URL}/${p.slug}` } };
}

// Catch-all for CMS-managed pages: About, Services, Financing, Privacy, Terms and any custom page the admin creates.
export default async function CmsPage({ params }: P) {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) notFound();
  const html = safeHtml(String((p.content as { html?: string })?.html ?? ""));
  return (
    <>
      <PageHero title={p.title} crumbs={[{ label: p.title }]} />
      <div className="container-x grid gap-12 py-14 lg:grid-cols-[1fr_380px]">
        <article className="prose-cms" dangerouslySetInnerHTML={{ __html: html }} />
        {slug === "financing" && (
          <aside className="h-fit space-y-6"><EmiCalculator /><div className="bg-white p-6"><h2 className="mb-4 text-2xl font-semibold">Request a finance quote</h2><LeadForm type="FINANCE" submitLabel="Request quote" messageLabel="Vehicle of interest & budget" /></div></aside>
        )}
      </div>
    </>
  );
}
