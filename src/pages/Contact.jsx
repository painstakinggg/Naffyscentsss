import React, { useState } from "react";
import { useStore } from "@/lib/store-context";
import Reveal from "@/components/ui/Reveal";
import { Mail, MapPin, MessageCircle, Clock, Check, Instagram, Navigation } from "lucide-react";

function TikTokIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 3.37-4.48v-3.5a6.36 6.36 0 0 0-1 .07A6.34 6.34 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

function SnapchatIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.519 1.165.393 2.687.279 4.105l-.003.022c-.017.221-.033.428-.046.631.062.038.162.079.326.079.236-.018.521-.094.807-.226.236-.108.49-.135.659-.135.146 0 .243.018.291.027.369.103.548.345.548.581 0 .236-.155.531-1.008.786-.085.027-.196.053-.326.082-.521.118-1.469.334-1.729 1.249-.043.151-.061.355.038.575.182.439.674 1.094 2.641 1.985.236.107.435.198.619.281 1.219.552 1.658.984 1.729 1.689.038.378-.063.693-.276.928-.519.57-1.559.776-2.604.859-.107.033-.182.143-.182.326 0 .075.017.146.038.214.108.339.214.789-.063 1.034-.184.165-.473.211-.728.211-.291 0-.659-.064-1.059-.211-.378-.137-.789-.211-1.249-.211-.291 0-.581.027-.859.075-.659.108-1.249.519-1.985 1.034-1.008.674-2.155 1.448-4.083 1.448-1.929 0-3.076-.776-4.083-1.448-.736-.515-1.326-.926-1.985-1.034-.278-.046-.569-.075-.859-.075-.46 0-.872.075-1.249.211-.4.146-.769.211-1.059.211-.255 0-.544-.046-.728-.211-.276-.246-.171-.696-.063-1.034.021-.068.038-.139.038-.214 0-.183-.075-.293-.182-.326-1.045-.083-2.085-.289-2.604-.859-.213-.236-.314-.55-.276-.928.071-.705.51-1.137 1.729-1.689.184-.083.383-.174.619-.281 1.967-.891 2.459-1.546 2.641-1.985.099-.221.081-.424.038-.575-.26-.916-1.208-1.131-1.729-1.249-.13-.029-.241-.055-.326-.082-.853-.255-1.008-.55-1.008-.786 0-.236.179-.478.548-.581.048-.009.145-.027.291-.027.169 0 .423.027.659.135.286.132.571.208.807.226.164 0 .264-.041.326-.079-.013-.203-.029-.41-.046-.631l-.003-.022c-.114-1.418-.24-2.94.279-4.105C7.859 1.069 11.216.793 12.206.793"/>
    </svg>
  );
}

export default function Contact() {
  const { settings } = useStore();
  const wa = settings?.whatsapp_number || "2348012345678";
  const waDisplay = wa ? `+${wa.slice(0, 3)} ${wa.slice(3, 6)} ${wa.slice(6, 9)} ${wa.slice(9)}`.trim() : "";
  const email = settings?.contact_email || "";
  const businessHours = settings?.business_hours || "";
  const ig = settings?.instagram_handle || "naffyscents";
  const tt = settings?.tiktok_handle || "naffyscents";
  const sc = settings?.snapchat_handle || "naffyscents";
  const address = settings?.store_address || "Ilaro, Ogun State";
  const mapsUrl = settings?.maps_url || "";
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
        <Reveal className="text-center mb-16">
          <p className="text-[11px] tracking-luxe text-gold uppercase mb-4">Get in Touch</p>
          <h1 className="font-heading text-4xl sm:text-6xl text-cream mb-4">Contact Naffy Scents</h1>
          <p className="text-sm text-cream/50 max-w-lg mx-auto">Questions about a fragrance, an order, or a recommendation? Our concierge is here for you.</p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Info */}
          <Reveal>
            <div className="space-y-6">
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 glass rounded-xl hover:border-gold/40 transition-colors group">
                <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                  <MessageCircle size={20} className="text-gold" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] tracking-luxe-sm text-gold uppercase">WhatsApp Concierge</p>
                  <p className="text-cream text-sm">{waDisplay}</p>
                </div>
              </a>

              <div className="p-5 glass rounded-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center shrink-0">
                    <MapPin size={20} className="text-gold" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-luxe-sm text-gold uppercase">Visit Our Store</p>
                    <p className="text-cream text-sm">{address}</p>
                  </div>
                </div>
                {mapsUrl && (
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-outline-gold w-full py-3 flex items-center justify-center gap-2">
                    <Navigation size={14} /> Find Us on Google Maps
                  </a>
                )}
              </div>

              <div className="p-5 glass rounded-xl">
                <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-4">Follow Naffy Scents</p>
                <div className="flex items-center gap-3">
                  <a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full border border-gold/25 flex items-center justify-center text-cream/70 hover:text-gold hover:border-gold transition-all duration-300" aria-label="Instagram">
                    <Instagram size={17} strokeWidth={1.5} />
                  </a>
                  <a href={`https://tiktok.com/@${tt}`} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full border border-gold/25 flex items-center justify-center text-cream/70 hover:text-gold hover:border-gold transition-all duration-300" aria-label="TikTok">
                    <TikTokIcon size={16} />
                  </a>
                  <a href={`https://snapchat.com/add/${sc}`} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full border border-gold/25 flex items-center justify-center text-cream/70 hover:text-gold hover:border-gold transition-all duration-300" aria-label="Snapchat">
                    <SnapchatIcon size={16} />
                  </a>
                </div>
              </div>

              {email && (
                <div className="flex items-center gap-4 p-5 glass rounded-xl">
                  <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center">
                    <Mail size={20} className="text-gold" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-luxe-sm text-gold uppercase">Email</p>
                    <p className="text-cream text-sm">{email}</p>
                  </div>
                </div>
              )}
              {businessHours && (
                <div className="flex items-center gap-4 p-5 glass rounded-xl">
                  <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center">
                    <Clock size={20} className="text-gold" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-luxe-sm text-gold uppercase">Business Hours</p>
                    <p className="text-cream text-sm">{businessHours}</p>
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={0.2}>
            <form onSubmit={submit} className="glass rounded-xl p-6 sm:p-8 space-y-5">
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full border border-gold flex items-center justify-center mx-auto mb-5 animate-scale-in">
                    <Check size={28} className="text-gold" />
                  </div>
                  <h3 className="font-heading text-2xl text-cream mb-2">Message Sent</h3>
                  <p className="text-sm text-cream/50">We'll respond within 24 hours.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-luxe-sm text-gold uppercase">Name *</label>
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-transparent border border-gold/25 px-4 py-3 text-cream text-sm outline-none focus:border-gold transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-luxe-sm text-gold uppercase">Email *</label>
                    <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-transparent border border-gold/25 px-4 py-3 text-cream text-sm outline-none focus:border-gold transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-luxe-sm text-gold uppercase">Message *</label>
                    <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full bg-transparent border border-gold/25 px-4 py-3 text-cream text-sm outline-none focus:border-gold transition-colors resize-none" />
                  </div>
                  <button type="submit" className="btn-gold w-full py-4">Send Message</button>
                </>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </div>
  );
}