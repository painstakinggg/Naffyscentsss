import React from "react";
import { IMAGES } from "@/lib/images";
import { useStore } from "@/lib/store-context";
import Reveal from "@/components/ui/Reveal";
import { Instagram } from "lucide-react";

const GRID = [
  IMAGES.productAmber,
  IMAGES.brandStory,
  IMAGES.productEmerald,
  IMAGES.productFrosted,
  IMAGES.categoryHer,
  IMAGES.productOnyx,
];

export default function SocialGrid() {
  const { settings } = useStore();
  const handle = settings?.instagram_handle || "naffyscents";

  return (
    <section className="py-20 sm:py-28 bg-obsidian-soft">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
        <Reveal className="text-center mb-12">
          <p className="text-[11px] tracking-luxe text-gold uppercase mb-4">Follow The Scent</p>
          <h2 className="font-heading text-3xl sm:text-5xl text-cream mb-3">Discover the world of Naffy Scents.</h2>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-10">
          {GRID.map((img, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="relative block aspect-square overflow-hidden">
                <img src={img} alt="Naffy Scents lifestyle" loading="lazy" className="w-full h-full object-cover" />
              </div>
            </Reveal>
          ))}
        </div>

        <div className="text-center">
          <a
            href={`https://instagram.com/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-gold inline-flex items-center gap-2 px-10 py-4"
          >
            <Instagram size={16} strokeWidth={1.5} />
            Follow @{handle}
          </a>
        </div>
      </div>
    </section>
  );
}