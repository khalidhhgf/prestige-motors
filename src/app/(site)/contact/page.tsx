import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/format";
import PageHero from "@/components/site/PageHero";
import LeadForm from "@/components/site/LeadForm";

export const metadata: Metadata = { title: "Contact Us", description: "Visit our showroom, call, WhatsApp or send us a message." };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const s = await getSettings();
  return (
    <>
      <PageHero title="Contact Us" subtitle="We'd love to help you find the right vehicle." crumbs={[{ label: "Contact" }]} />
      <div className="container-x grid gap-12 py-14 lg:grid-cols-2">
        <div className="space-y-6">
          <ul className="space-y-5">
            <li className="flex gap-4"><MapPin className="mt-1 text-accent" /><div><p className="font-semibold">Showroom</p><p className="text-charcoal-500">{s.address}</p></div></li>
            <li className="flex gap-4"><Phone className="mt-1 text-accent" /><div><p className="font-semibold">Phone</p><a href={`tel:${s.phone.replace(/\s/g, "")}`} className="text-charcoal-500">{s.phone}</a></div></li>
            <li className="flex gap-4"><MessageCircle className="mt-1 text-accent" /><div><p className="font-semibold">WhatsApp</p><a href={whatsappLink(s.whatsapp, "Hello, I'd like some information.")} target="_blank" rel="noopener noreferrer" className="text-charcoal-500">Chat now</a></div></li>
            <li className="flex gap-4"><Mail className="mt-1 text-accent" /><div><p className="font-semibold">Email</p><a href={`mailto:${s.email}`} className="text-charcoal-500">{s.email}</a></div></li>
            <li className="flex gap-4"><Clock className="mt-1 text-accent" /><div><p className="font-semibold">Opening hours</p><p className="whitespace-pre-line text-charcoal-500">{s.openingHours}</p></div></li>
          </ul>
          {s.mapEmbedUrl && <iframe title="Showroom location" src={s.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-72 w-full border-0" />}
        </div>
        <div className="bg-white p-6 sm:p-8"><h2 className="mb-5 text-3xl font-semibold">Send us a message</h2><LeadForm type="CONTACT" submitLabel="Send message" /></div>
      </div>
    </>
  );
}
