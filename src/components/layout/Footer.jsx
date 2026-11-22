import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, MessageCircle } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { Image } from "@/components/ui/image";

const LOGO_URL = "/favicon.svg";

// Snapchat icon (not in lucide)
function SnapchatIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.519 1.165.393 2.687.279 4.105l-.003.022c-.017.221-.033.428-.046.631.062.038.162.079.326.079.236-.018.521-.094.807-.226.236-.108.49-.135.659-.135.146 0 .243.018.291.027.369.103.548.345.548.581 0 .236-.155.531-1.008.786-.085.027-.196.053-.326.082-.521.118-1.469.334-1.729 1.249-.043.151-.061.355.038.575.182.439.674 1.094 2.641 1.985.236.107.435.198.619.281 1.219.552 1.658.984 1.729 1.689.038.378-.063.693-.276.928-.519.57-1.559.776-2.604.859-.107.033-.182.143-.182.326 0 .075.017.146.038.214.108.339.214.789-.063 1.034-.184.165-.473.211-.728.211-.291 0-.659-.064-1.059-.211-.378-.137-.789-.211-1.249-.211-.291 0-.581.027-.859.075-.659.108-1.249.519-1.985 1.034-1.008.674-2.155 1.448-4.083 1.448-1.929 0-3.076-.776-4.083-1.448-.736-.515-1.326-.926-1.985-1.034-.278-.046-.569-.075-.859-.075-.46 0-.872.075-1.249.211-.4.146-.769.211-1.059.211-.255 0-.544-.046-.728-.211-.276-.246-.171-.696-.063-1.034.021-.068.038-.139.038-.214 0-.183-.075-.293-.182-.326-1.045-.083-2.085-.289-2.604-.859-.213-.236-.314-.55-.276-.928.071-.705.51-1.137 1.729-1.689.184-.083.383-.174.619-.281 1.967-.891 2.459-1.546 2.641-1.985.099-.221.081-.424.038-.575-.26-.916-1.208-1.131-1.729-1.249-.13-.029-.241-.055-.326-.082-.853-.255-1.008-.55-1.008-.786 0-.236.179-.478.548-.581.048-.009.145-.027.291-.027.169 0 .423.027.659.135.286.132.571.208.807.226.164 0 .264-.041.326-.079-.013-.203-.029-.41-.046-.631l-.003-.022c-.114-1.418-.24-2.94.279-4.105C7.859 1.069 11.216.793 12.206.793"/>
    </svg>
  );
}

// TikTok icon (not in lucide)
function TikTokIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 3.37-4.48v-3.5a6.36 6.36 0 0 0-1 .07A6.34 6.34 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

const FOOTER_LINKS = [
  { label: "Shop", path: "/shop" },
  { label: "Collections", path: "/collections" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "Leave a Review", path: "/leave-review" },
  { label: "FAQ", path: "/faq" },
  { label: "Shipping & Delivery", path: "/shipping" },
  { label: "Returns & Refunds", path: "/returns" },
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Terms & Conditions", path: "/terms" },
];

export default function Footer() {
  const { settings } = useStore();
  const ig = settings?.instagram_handle || "naffyscents";
  const tt = settings?.tiktok_handle || "naffyscents";
  const fb = settings?.facebook_handle || "";
  const sc = settings?.snapchat_handle || "naffyscents";
  const wa = settings?.whatsapp_number || "2348012345678";
  const address = settings?.store_address || "Ilaro, Ogun State";
  const mapsUrl = settings?.maps_url || "";

  return (
    <footer className="bg-obsidian border-t border-gold/15 pt-20 pb-10">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-gold/10">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <Image src={LOGO_URL} alt="Naffy Scents" fittingType="fit" className="h-12 w-auto object-contain" />
              <span className="font-heading font-semibold tracking-luxe-sm text-cream text-2xl leading-none whitespace-nowrap">NAFFY SCENTS</span>
            </div>
            <p className="text-cream/55 text-sm leading-relaxed max-w-sm">
              Luxury fragrances created for unforgettable impressions. Crafted to become part of your identity.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gold/25 flex items-center justify-center text-cream/70 hover:text-gold hover:border-gold transition-all duration-300" aria-label="Instagram">
                <Instagram size={17} strokeWidth={1.5} />
              </a>
              <a href={`https://tiktok.com/@${tt}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gold/25 flex items-center justify-center text-cream/70 hover:text-gold hover:border-gold transition-all duration-300" aria-label="TikTok">
                <TikTokIcon size={16} />
              </a>
              <a href={`https://snapchat.com/add/${sc}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gold/25 flex items-center justify-center text-cream/70 hover:text-gold hover:border-gold transition-all duration-300" aria-label="Snapchat">
                <SnapchatIcon size={16} />
              </a>
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gold/25 flex items-center justify-center text-cream/70 hover:text-gold hover:border-gold transition-all duration-300" aria-label="WhatsApp">
                <MessageCircle size={17} strokeWidth={1.5} />
              </a>
              {fb && (
                <a href={`https://facebook.com/${fb}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gold/25 flex items-center justify-center text-cream/70 hover:text-gold hover:border-gold transition-all duration-300" aria-label="Facebook">
                  <Facebook size={17} strokeWidth={1.5} />
                </a>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-4">
            <p className="text-[11px] tracking-luxe-sm text-gold uppercase mb-5">Explore</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className="text-sm text-cream/55 hover:text-gold transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <p className="text-[11px] tracking-luxe-sm text-gold uppercase mb-5">Concierge</p>
            <p className="text-sm text-cream/55 mb-2">{address}</p>
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-[10px] tracking-luxe-sm text-gold uppercase hover:text-gold-light transition-colors mb-3 border border-gold/30 px-4 py-2 rounded">
                Get Directions
              </a>
            )}
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="text-sm text-cream/55 hover:text-gold transition-colors block mb-1">
              WhatsApp Enquiries
            </a>
            <a href={`mailto:hello@naffyscents.com`} className="text-sm text-cream/55 hover:text-gold transition-colors">
              hello@naffyscents.com
            </a>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream/40 tracking-wide">© 2026 Naffy Scents. All rights reserved.</p>
          <p className="text-xs text-cream/40 tracking-wide">Crafted in Ilaro · Delivery within Ilaro & Pickup</p>
        </div>
      </div>
    </footer>
  );
}