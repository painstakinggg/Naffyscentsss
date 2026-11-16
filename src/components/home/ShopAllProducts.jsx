import React from "react";
import ProductCard from "@/components/product/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import Reveal from "@/components/ui/Reveal";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function ShopAllProducts() {
  const { products, loading } = useProducts();

  return (
    <section id="shop-all-fragrances" className="py-20 sm:py-28 px-5 sm:px-8 max-w-[1400px] mx-auto scroll-mt-24">
      <Reveal className="text-center mb-14">
        <p className="text-[11px] tracking-luxe text-gold uppercase mb-4">The Naffy Scents Edit</p>
        <h2 className="font-heading text-3xl sm:text-5xl text-cream mb-4">Shop All Fragrances</h2>
        <p className="text-sm text-cream/55 max-w-2xl mx-auto">
          Explore the complete collection and find the scent that feels like you.
        </p>
        <div className="luxury-line w-24 mx-auto mt-6" />
      </Reveal>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="aspect-[3/4] bg-obsidian-soft animate-pulse" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14">
            {products.map((product, index) => (
              <Reveal key={product.id} delay={(index % 4) * 0.05}>
                <ProductCard
                  product={product}
                  badge={product.bestseller ? "Best Seller" : product.featured ? "Featured" : null}
                />
              </Reveal>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-3 border border-gold/50 px-8 py-4 text-[11px] tracking-luxe-sm text-gold uppercase hover:bg-gold hover:text-obsidian transition-colors duration-300"
            >
              Explore the full shop <ArrowRight size={14} />
            </Link>
          </div>
        </>
      ) : (
        <p className="text-center text-sm text-cream/55">Our fragrances are being prepared. Please check back shortly.</p>
      )}
    </section>
  );
}
