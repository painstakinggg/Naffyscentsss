import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductCarousel from "@/components/product/ProductCarousel";
import { useProducts } from "@/hooks/useProducts";
import Reveal from "@/components/ui/Reveal";
import { HOMEPAGE_COLLECTIONS } from "@/data/homepageCollections";

export default function NewArrivals() {
  const { products, loading } = useProducts();
  const ids = HOMEPAGE_COLLECTIONS["new-arrivals"];
  const byId = new Map(products.map((product) => [product.id, product]));
  const display = ids.map((id) => byId.get(id)).filter(Boolean);

  return (
    <section className="py-20 sm:py-28 px-5 sm:px-8 max-w-[1400px] mx-auto">
      <Reveal className="text-center mb-14">
        <p className="text-[11px] tracking-luxe text-gold uppercase mb-4">Just Arrived</p>
        <h2 className="font-heading text-3xl sm:text-5xl text-cream mb-4">New Arrivals</h2>
        <p className="text-sm text-cream/55 max-w-2xl mx-auto">
          Discover a handpicked edit of fragrances from the Naffy Scents collection.
        </p>
        <div className="luxury-line w-24 mx-auto mt-6" />
      </Reveal>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="aspect-[3/4] bg-obsidian-soft animate-pulse" />)}
        </div>
      ) : display.length > 0 ? (
        <>
          <ProductCarousel products={display} badge="New Arrival" />
          <div className="text-center mt-12">
            <Link to="/shop?collection=new-arrivals" className="btn-outline-gold inline-flex items-center justify-center gap-3 px-8 py-4 text-[11px] tracking-luxe-sm uppercase">
              View All New Arrivals <ArrowRight size={14} />
            </Link>
          </div>
        </>
      ) : (
        <p className="text-center text-sm text-cream/55">New fragrances are coming soon. Please check back shortly.</p>
      )}
    </section>
  );
}
