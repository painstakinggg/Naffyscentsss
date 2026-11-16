import React from "react";
import { Link } from "react-router-dom";
import { IMAGES } from "@/lib/images";
import { useStore } from "@/lib/store-context";

export default function Hero() {
  const { settings } = useStore();
  const headline = settings?.hero_headline || "SCENT THAT SPEAKS BEFORE YOU DO.";
  const subtext = settings?.hero_subtext || "Discover fragrances crafted to leave a lasting impression.";

  return (
    <section className="hero-section relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-obsidian">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={settings?.hero_image_url || IMAGES.hero}
          alt="Naffy Scents luxury fragrance"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/70 via-obsidian/40 to-obsidian" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-5 max-w-4xl mx-auto">
        <p className="text-[11px] sm:text-xs tracking-luxe text-gold uppercase mb-6 animate-fade-up">
          Luxury Fragrance House · Nigeria
        </p>
        <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl text-cream leading-[1.05] mb-6 text-balance animate-fade-up delay-200">
          {headline}
        </h1>
        <p className="text-sm sm:text-base text-cream/70 max-w-xl mb-10 leading-relaxed animate-fade-up delay-400">
          {subtext}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-up delay-500">
          <Link to="/shop" className="btn-gold px-10 py-4 inline-block text-center">
            Shop Collection
          </Link>
          <Link to="/about" className="btn-outline-gold px-10 py-4 inline-block text-center">
            Explore Naffy Scents
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-fade-in delay-700">
        <span className="text-[10px] tracking-luxe-sm text-cream/40 uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-gold to-transparent animate-pulse" />
      </div>
    </section>
  );
}