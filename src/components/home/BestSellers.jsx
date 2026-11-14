import React from "react";
import ProductCard from "@/components/product/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import Reveal from "@/components/ui/Reveal";

export default function BestSellers() {
  const { products, loading } = useProducts({ bestseller: true });
  const display = products.length > 0 ? products.slice(0, 6) : [];

  return (
    <section className="py-20 sm:py-28 px-5 sm:px-8 max-w-[1400px] mx-auto">
      <Reveal className="text-center mb-14">
        <p className="text-[11px] tracking-luxe text-gold uppercase mb-4">Most Wanted</p>
        <h2 className="font-heading text-3xl sm:text-5xl text-cream">The Fragrances Everyone Wants</h2>
        <div className="luxury-line w-24 mx-auto mt-6" />
      </Reveal>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[3/4] bg-obsidian-soft animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Desktop grid */}
          <div className="hidden lg:grid grid-cols-3 gap-6">
            {display.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <ProductCard product={p} badge="Best Seller" />
              </Reveal>
            ))}
          </div>
          {/* Mobile swipeable */}
          <div className="lg:hidden flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-5 px-5 pb-4">
            {display.map((p) => (
              <div key={p.id} className="snap-start shrink-0 w-[70%] sm:w-[42%]">
                <ProductCard product={p} badge="Best Seller" />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}