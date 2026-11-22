import React from "react";
import { Link } from "react-router-dom";
import { IMAGES } from "@/lib/images";
import Reveal from "@/components/ui/Reveal";
import { useStore } from "@/lib/store-context";

export default function BrandStory() {
  const { settings } = useStore();
  const heading = settings?.brand_story_heading || "MORE THAN A FRAGRANCE. IT'S AN IDENTITY.";

  return (
    <section className="py-20 sm:py-32 bg-obsidian-soft overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden">
            <img src={IMAGES.brandStory} alt="The Naffy Scents identity" loading="lazy" className="w-full h-full object-cover" />
            <div className="absolute inset-0 border border-gold/20 m-3 pointer-events-none" />
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div>
            <p className="text-[11px] tracking-luxe text-gold uppercase mb-5">The Naffy Philosophy</p>
            <h2 className="font-heading text-3xl sm:text-5xl text-cream leading-tight mb-8 text-balance">
              {heading}
            </h2>
            <div className="space-y-5 text-cream/60 text-base leading-relaxed">
              <p>
                Naffy Scents was born from a simple belief: a fragrance is never just a scent — it is a
                signature, a memory, and a presence that lingers long after you have left the room.
              </p>
              <p>
                We curate fragrances for individuals who understand that confidence is not spoken, it is felt.
                Every fragrance we offer is selected to complement your personality, mood, and presence — the
                invisible accessory that can say so much before a single word is spoken.
              </p>
              <p>
                From Ilaro to beyond, Naffy Scents is a celebration of individuality, presence, and the art of
                finding a fragrance that feels uniquely yours.
              </p>
            </div>
            <Link to="/about" className="btn-outline-gold inline-block mt-10 px-10 py-4">
              Our Story
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}