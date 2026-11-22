import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "@/components/product/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import Reveal from "@/components/ui/Reveal";
import { ArrowRight } from "lucide-react";

export default function Bundles() {
  const { products, loading } = useProducts({ is_bundle: true });
  const display = products.slice(0, 4);

  if (!loading && display.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 px-5 sm:px-8 max-w-[1400px] mx-auto">
      <Reveal className="text-center mb-14">
        <p className="text-[11px] tracking-luxe text-gold uppercase mb-4">Curated Combos</p>
        <h2 className="font-heading text-3xl sm:text-5xl text-cream mb-4">Signature Bundles, Beautifully Paired</h2>
        <p className="text-sm text-cream/50 max-w-xl mx-auto">
          Thoughtfully combined fragrances at a special price — the perfect gift or a complete set for yourself.
        </p>
        <div className="luxury-line w-24 mx-auto mt-6" />
      </Reveal>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] bg-obsidian-soft animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-6">
            {display.map((product, index) => (
              <Reveal key={product.id} delay={index * 0.08}>
                <ProductCard product={product} badge="Bundle" />
              </Reveal>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/shop?type=bundle" className="btn-outline-gold inline-flex items-center justify-center gap-3 px-8 py-4 text-[11px] tracking-luxe-sm uppercase">
              View All Bundles <ArrowRight size={14} />
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
