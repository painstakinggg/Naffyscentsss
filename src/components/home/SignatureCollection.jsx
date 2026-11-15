import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import Reveal from "@/components/ui/Reveal";
import { HOMEPAGE_COLLECTIONS } from "@/data/homepageCollections";

export default function SignatureCollection() {
  const { products, loading } = useProducts();
  const ids = HOMEPAGE_COLLECTIONS.signature;
  const byId = new Map(products.map((product) => [product.id, product]));
  const display = ids.map((id) => byId.get(id)).filter(Boolean);

  return (
    <section className="py-20 sm:py-28 px-5 sm:px-8 max-w-[1400px] mx-auto">
      <Reveal className="text-center mb-14">
        <p className="text-[11px] tracking-luxe text-gold uppercase mb-4">The Signature Collection</p>
        <h2 className="font-heading text-3xl sm:text-5xl text-cream mb-4">Fragrances designed to become part of your identity.</h2>
        <div className="luxury-line w-24 mx-auto mt-6" />
      </Reveal>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="aspect-[3/4] bg-obsidian-soft animate-pulse" />)}
        </div>
      ) : display.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-6">
            {display.map((product, index) => (
              <Reveal key={product.id} delay={index * 0.08}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/shop?collection=signature" className="btn-outline-gold inline-flex items-center justify-center gap-3 px-8 py-4 text-[11px] tracking-luxe-sm uppercase">
              View Signature Collection <ArrowRight size={14} />
            </Link>
          </div>
        </>
      ) : (
        <p className="text-center text-sm text-cream/55">Our signature fragrances are being prepared. Please check back shortly.</p>
      )}
    </section>
  );
}
