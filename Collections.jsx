import React from "react";
import { Link } from "react-router-dom";
import { IMAGES } from "@/lib/images";
import Reveal from "@/components/ui/Reveal";
import { ArrowRight } from "lucide-react";

const COLLECTIONS = [
  { name: "For Her", desc: "Elegant and captivating fragrances designed for the woman who enters a room and is remembered.", image: IMAGES.categoryHer, path: "/shop?category=For+Her" },
  { name: "For Him", desc: "Bold, refined and confident scents for the man whose presence speaks before he does.", image: IMAGES.categoryHim, path: "/shop?category=For+Him" },
  { name: "Unisex", desc: "Modern fragrances designed for everyone — boundary-defying compositions for the individual.", image: IMAGES.productMidnight, path: "/shop?gender=Unisex" },
  { name: "Signature", desc: "Our most distinctive and memorable fragrances. The scents that define the Naffy identity.", image: IMAGES.productOnyx, path: "/shop?category=Signature" },
  { name: "Bundles", desc: "Curated combo sets that pair complementary fragrances into one signature gift — at a special price.", image: IMAGES.productAmber, path: "/shop?type=bundle" },
];

export default function Collections() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 text-center mb-16">
        <Reveal>
          <p className="text-[11px] tracking-luxe text-gold uppercase mb-4">The Collections</p>
          <h1 className="font-heading text-4xl sm:text-6xl text-cream mb-5">Curated By Expression</h1>
          <p className="text-sm text-cream/50 max-w-xl mx-auto">Each collection is a world of its own — explore the fragrance that matches your identity.</p>
        </Reveal>
      </div>

      <div className="space-y-0">
        {COLLECTIONS.map((c, i) => (
          <Reveal key={c.name}>
            <div className={`grid grid-cols-1 lg:grid-cols-2 items-center ${i % 2 === 1 ? "lg:[direction:rtl]" : ""}`}>
              <div className="aspect-[4/3] lg:aspect-[5/6] overflow-hidden [direction:ltr]">
                <img src={c.image} alt={c.name} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-8 sm:p-16 [direction:ltr]">
                <p className="text-[11px] tracking-luxe text-gold uppercase mb-4">Collection {String(i + 1).padStart(2, "0")}</p>
                <h2 className="font-heading text-4xl sm:text-5xl text-cream mb-5">{c.name}</h2>
                <p className="text-cream/55 leading-relaxed mb-8 max-w-md">{c.desc}</p>
                <Link to={c.path} className="btn-outline-gold inline-flex items-center gap-2 px-10 py-4">
                  Explore <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}