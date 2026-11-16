import React from "react";
import { Link } from "react-router-dom";
import { IMAGES } from "@/lib/images";
import Reveal from "@/components/ui/Reveal";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  { name: "For Her", desc: "Elegant and captivating fragrances.", image: IMAGES.categoryHer, path: "/shop?category=For+Her" },
  { name: "For Him", desc: "Bold, refined and confident scents.", image: IMAGES.categoryHim, path: "/shop?category=For+Him" },
  { name: "Unisex", desc: "Modern fragrances designed for everyone.", image: IMAGES.productMidnight, path: "/shop?gender=Unisex" },
  { name: "Signature", desc: "Our most distinctive and memorable fragrances.", image: IMAGES.productOnyx, path: "/shop?category=Signature" },
];

export default function Categories() {
  return (
    <section className="py-20 sm:py-28 bg-obsidian-soft">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
        <Reveal className="text-center mb-14">
          <p className="text-[11px] tracking-luxe text-gold uppercase mb-4">Explore By Category</p>
          <h2 className="font-heading text-3xl sm:text-5xl text-cream">Find Your Expression</h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat, i) => (
            <Reveal key={cat.name} delay={i * 0.1}>
              <Link to={cat.path} className="group relative block overflow-hidden aspect-[4/5]">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="naffy-category-title font-heading text-2xl mb-1">{cat.name}</h3>
                  <p className="naffy-category-description text-xs mb-4 leading-relaxed">{cat.desc}</p>
                  <span className="inline-flex items-center gap-2 text-[11px] tracking-luxe-sm text-gold uppercase group-hover:gap-3 transition-all">
                    Explore <ArrowRight size={13} />
                  </span>
                </div>
                <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/30 transition-all duration-500" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}