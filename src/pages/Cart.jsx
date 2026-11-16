import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/images";
import ProductCard from "@/components/product/ProductCard";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, subtotal, itemCount } = useCart();

  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Unable to load recommendations");
        const data = await response.json();
        if (active) setAllProducts(Array.isArray(data.products) ? data.products : []);
      } catch {
        if (active) setAllProducts([]);
      }
    })();
    return () => { active = false; };
  }, []);

  const recommended = useMemo(() => {
    const inBag = new Set(items.map((item) => String(item.id)));
    return [...allProducts]
      .filter((product) => product.available && !inBag.has(String(product.id)))
      .sort((a, b) =>
        Number(b.bestseller) - Number(a.bestseller) ||
        Number(b.featured) - Number(a.featured) ||
        (b.review_count || 0) - (a.review_count || 0)
      )
      .slice(0, 4);
  }, [allProducts, items]);

  const cartFaqs = [
    { q: "How do I choose the right fragrance?", a: "Explore our fragrance families and product descriptions, or contact our team on WhatsApp for a personal recommendation." },
    { q: "How much does delivery cost?", a: "Delivery fees are calculated at checkout based on your delivery location. Store pickup is available at no delivery charge." },
    { q: "Can I change or remove an item from my bag?", a: "Yes. Adjust an item's quantity using the plus and minus controls, or select Remove before proceeding to checkout." },
    { q: "Can I order more than one fragrance?", a: "Yes. Add as many available fragrances as you like to your shopping bag and adjust quantities before checkout." },
  ];

  const discoverySections = (
    <>
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 mt-20 sm:mt-24">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-luxe text-gold uppercase mb-3">Discover More</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-cream">You may also like</h2>
          <p className="text-sm text-cream/45 mt-3">A few more scents worth discovering.</p>
        </div>
        {recommended.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {recommended.map((product) => <ProductCard key={product.id} product={product} badge={product.bestseller ? "Best Seller" : null} />)}
          </div>
        ) : (
          <p className="text-center text-sm text-cream/45">More fragrances are coming soon.</p>
        )}
      </section>

      <section className="max-w-3xl mx-auto px-5 sm:px-8 mt-20 sm:mt-24">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-luxe text-gold uppercase mb-3">A little help</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-cream">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {cartFaqs.map((item) => (
            <details key={item.q} className="glass rounded-xl group">
              <summary className="cursor-pointer p-5 flex items-center justify-between gap-4 list-none">
                <span className="font-heading text-base sm:text-lg text-cream">{item.q}</span>
                <span className="text-gold text-xl transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-cream/55 leading-relaxed">{item.a}</div>
            </details>
          ))}
        </div>
      </section>
    </>
  );

  if (items.length === 0) {
    return (
      <>
        <div className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center text-center px-5">
          <div className="w-20 h-20 rounded-full border border-gold/30 flex items-center justify-center mb-8">
            <ShoppingBag size={28} className="text-gold" strokeWidth={1.2} />
          </div>
          <h1 className="font-heading text-4xl text-cream mb-3">Your bag is empty</h1>
          <p className="text-sm text-cream/50 mb-8 max-w-sm">Discover fragrances crafted to become part of your identity.</p>
          <Link to="/shop" className="btn-gold px-10 py-4 inline-flex items-center gap-2">
            Shop Collection <ArrowRight size={15} />
          </Link>
        </div>
        {discoverySections}
      </>
    );
  }

  return (
    <div className="pt-[106px] pb-20 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="mb-6 text-left">
          <h1 className="text-[18px] font-medium leading-tight text-cream">Shopping bag ({itemCount})</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.id}-${item.size_ml}`} className="flex gap-4 p-4 glass rounded-xl">
                <Link to={`/product/${item.id}`} className="shrink-0 w-24 h-32 overflow-hidden bg-obsidian-soft">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link to={`/product/${item.id}`}>
                      <h3 className="font-heading text-xl text-cream hover:text-gold transition-colors">{item.name}</h3>
                    </Link>
                    <p className="text-xs text-cream/40 mt-1">{item.is_bundle ? "Curated Bundle" : `${item.size_ml}ml`}</p>
                    <p className="text-gold text-lg mt-2">{formatNaira(item.price)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gold/20">
                      <button onClick={() => updateQuantity(item.id, item.size_ml, item.quantity - 1)} className="w-9 h-9 text-cream/70 hover:text-gold flex items-center justify-center"><Minus size={13} /></button>
                      <span className="w-10 text-center text-cream text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.size_ml, item.quantity + 1)} className="w-9 h-9 text-cream/70 hover:text-gold flex items-center justify-center"><Plus size={13} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id, item.size_ml)} className="text-cream/40 hover:text-garnet transition-colors flex items-center gap-1.5 text-xs">
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="glass rounded-xl p-6 sticky top-28">
              <h2 className="font-heading text-2xl text-cream mb-6">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-cream/60">
                  <span>Subtotal</span>
                  <span className="text-cream">{formatNaira(subtotal)}</span>
                </div>
                <div className="flex justify-between text-cream/60">
                  <span>Delivery</span>
                  <span className="text-cream/50 text-right">Calculated at checkout</span>
                </div>
                <p className="text-xs text-cream/40 mt-2">Final delivery fees are confirmed at checkout based on your delivery location. Store pickup is available at no delivery charge.</p>
              </div>
              <div className="luxury-line my-5" />
              <div className="flex justify-between mb-6">
                <span className="text-cream">Total</span>
                <span className="text-gold text-xl font-medium">{formatNaira(subtotal)}</span>
              </div>
              <Link to="/checkout" className="btn-gold w-full py-4 block text-center">Proceed to Checkout</Link>
              <Link to="/shop" className="block text-center text-xs tracking-luxe-sm text-cream/50 hover:text-gold uppercase mt-4 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
      {discoverySections}
    </div>
  );
}