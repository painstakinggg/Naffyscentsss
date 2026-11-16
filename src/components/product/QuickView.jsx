import React, { useState, useEffect } from "react";
import { X, ShoppingBag, Heart, Minus, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/images";
import StarRating from "./StarRating";

export default function QuickView({ product, onClose }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [size, setSize] = useState(product?.size_ml || 100);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setSize(product?.size_ml || 100);
    setQty(1);
  }, [product]);

  useEffect(() => {
    document.body.style.overflow = product ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [product]);

  if (!product) return null;
  const wished = isWishlisted(product.id);
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-obsidian-soft border-l border-gold/20 h-full overflow-y-auto animate-slide-in-right">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full glass flex items-center justify-center text-cream/70 hover:text-gold" aria-label="Close">
          <X size={18} />
        </button>

        <div className="aspect-[3/4] w-full overflow-hidden bg-obsidian">
          <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="p-6">
          <p className="text-[10px] tracking-luxe-sm text-gold/70 uppercase mb-2">{product.fragrance_family} · {product.category}</p>
          <h2 className="font-heading text-3xl text-cream mb-3">{product.name}</h2>
          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={product.rating || 5} size={14} />
            <span className="text-xs text-cream/40">({product.review_count || 0} reviews)</span>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl text-cream font-medium">{formatNaira(product.price)}</span>
            {hasDiscount && <span className="text-cream/35 line-through">{formatNaira(product.compare_at_price)}</span>}
          </div>

          <p className="text-sm text-cream/55 leading-relaxed mb-6">{product.short_description}</p>

          {/* Fragrance notes */}
          <div className="space-y-3 mb-6 py-5 border-y border-gold/10">
            {product.top_notes && (
              <div className="flex gap-3">
                <span className="text-[10px] tracking-luxe-sm text-gold uppercase w-16 shrink-0 pt-0.5">Top</span>
                <span className="text-sm text-cream/65">{product.top_notes}</span>
              </div>
            )}
            {product.heart_notes && (
              <div className="flex gap-3">
                <span className="text-[10px] tracking-luxe-sm text-gold uppercase w-16 shrink-0 pt-0.5">Heart</span>
                <span className="text-sm text-cream/65">{product.heart_notes}</span>
              </div>
            )}
            {product.base_notes && (
              <div className="flex gap-3">
                <span className="text-[10px] tracking-luxe-sm text-gold uppercase w-16 shrink-0 pt-0.5">Base</span>
                <span className="text-sm text-cream/65">{product.base_notes}</span>
              </div>
            )}
          </div>

          {/* Size selector */}
          <div className="mb-5">
            <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-2">Size</p>
            <div className="flex gap-2">
              {[50, 100].map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-4 py-2 text-sm border transition-all ${
                    size === s ? "border-gold text-gold bg-gold/10" : "border-gold/20 text-cream/60"
                  }`}
                >
                  {s}ml
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-2">Quantity</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gold/20">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 text-cream/70 hover:text-gold flex items-center justify-center"><Minus size={14} /></button>
                <span className="w-10 text-center text-cream">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="w-10 h-10 text-cream/70 hover:text-gold flex items-center justify-center"><Plus size={14} /></button>
              </div>
              <span className={`text-xs ${product.available ? "text-sage" : "text-garnet"}`}>
                {product.available ? "In Stock" : "Sold Out"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { addToCart(product, qty, size); onClose(); }}
              disabled={!product.available}
              className="flex-1 btn-gold py-4 flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <ShoppingBag size={15} strokeWidth={1.5} />
              Add to Cart
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className="w-14 border border-gold/30 text-cream hover:text-gold hover:border-gold flex items-center justify-center transition-all"
              aria-label="Wishlist"
            >
              <Heart size={17} className={wished ? "fill-gold text-gold" : ""} strokeWidth={1.5} />
            </button>
          </div>

          <Link to={`/product/${product.id}`} onClick={onClose} className="block text-center text-xs tracking-luxe-sm text-cream/50 hover:text-gold uppercase mt-5 transition-colors">
            View Full Details →
          </Link>
        </div>
      </div>
    </div>
  );
}