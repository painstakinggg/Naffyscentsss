import React from "react";
import { Link } from "react-router-dom";
import { IMAGES } from "@/lib/images";
import { useStore } from "@/lib/store-context";
import Reveal from "@/components/ui/Reveal";

export default function PromoBanner() {
  const { settings } = useStore();
  const text = settings?.promo_text || "YOUR SIGNATURE SCENT AWAITS.";

  return (
    <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <img src={IMAGES.promoBanner} alt="Naffy Scents signature collection" loading="lazy" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-obsidian/60" />
      </div>
      <Reveal className="relative z-10 h-full flex flex-col items-center justify-center text-center px-5">
        <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl text-cream mb-8 text-balance">{text}</h2>
        <Link to="/shop" className="btn-gold px-12 py-4">Shop Now</Link>
      </Reveal>
    </section>
  );
}