import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/images";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, subtotal, itemCount } = useCart();

  if (items.length === 0) {
    return (
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
    );
  }

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-luxe text-gold uppercase mb-3">Shopping Bag</p>
          <h1 className="font-heading text-4xl text-cream">Your Selection ({itemCount})</h1>
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
    </div>
  );
}