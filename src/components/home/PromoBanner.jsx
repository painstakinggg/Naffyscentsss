import React from "react";
import { Link } from "react-router-dom";
import { IMAGES } from "@/lib/images";
import { useStore } from "@/lib/store-context";
import Reveal from "@/components/ui/Reveal";

export default function PromoBanner() {
  const { settings } = useStore();
  const text = settings?.promo_text || "YOUR SIGNATURE SCENT AWAITS.";

  return (
    <section className="promo-banner relative min-h-[460px] sm:min-h-[520px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <img src={IMAGES.promoBanner} alt="Naffy Scents signature collection" loading="lazy" className="w-full h-full object-cover" />
        <div className="promo-overlay absolute inset-0" />
      </div>
      <Reveal className="relative z-10 min-h-[460px] sm:min-h-[520px] flex flex-col items-center justify-center text-center px-5 py-16">
        <p className="promo-eyebrow text-[10px] sm:text-xs tracking-luxe uppercase mb-5">Discover Your Next Favourite</p>
        <h2 className="font-heading text-4xl sm:text-5xl lg:text-7xl text-cream mb-8 max-w-4xl text-balance">{text}</h2>
        <Link to="/shop" className="promo-cta btn-gold px-12 py-4 rounded-sm">Shop Now</Link>
      </Reveal>
    </section>
  );
}