import { Phone, MessageCircle, Clock } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/format";

export default function TopBar({ s }: { s: SiteSettings }) {
  const hours = s.openingHours.split("\n")[0];
  return (
    <div className="hidden border-b border-white/10 bg-black text-[12px] text-white/70 md:block">
      <div className="container-x flex h-9 items-center justify-between">
        <span className="flex items-center gap-2"><Clock size={13} className="text-accent" />{hours}</span>
        <div className="flex items-center gap-6">
          <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-white"><Phone size={13} className="text-accent" />{s.phone}</a>
          <a href={whatsappLink(s.whatsapp, "Hello, I have a question.")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white"><MessageCircle size={13} className="text-accent" />WhatsApp us</a>
        </div>
      </div>
    </div>
  );
}
