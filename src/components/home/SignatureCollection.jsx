import React, { useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import Reveal from "@/components/ui/Reveal";

export default function SignatureCollection() {
  const { products, loading } = useProducts({ featured: true });
  const display = products.length > 0 ? products.slice(0, 4) : [];

  return (
    <section className="py-20 sm:py-28 px-5 sm:px-8 max-w-[1400px] mx-auto">
      <Reveal className="text-center mb-14">
        <p className="text-[11px] tracking-luxe text-gold uppercase mb-4">The Signature Collection</p>
        <h2 className="font-heading text-3xl sm:text-5xl text-cream mb-4">Fragrances designed to become part of your identity.</h2>
        <div className="luxury-line w-24 mx-auto mt-6" />
      </Reveal>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] bg-obsidian-soft animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {display.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.1}>
              <ProductCard product={p} badge={p.bestseller ? "Best Seller" : null} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}