import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Eye, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useQuickView } from "@/lib/quickview-context";
import { formatNaira } from "@/lib/images";
import StarRating from "./StarRating";

/** @param {{ product: any, badge?: string }} props */
export default function ProductCard({ product, badge }) {
  const { open: openQuickView } = useQuickView();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [imgLoaded, setImgLoaded] = useState(false);
  const wished = isWishlisted(product.id);
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col">
      <div className="relative overflow-hidden bg-obsidian-soft aspect-[3/4]">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
          {badge && (
            <span className="px-2.5 py-1 bg-gold text-cream text-[9px] tracking-luxe-sm uppercase font-medium">
              {badge}
            </span>
          )}
          {product.is_bundle && (
            <span className="px-2.5 py-1 bg-obsidian border border-gold/40 text-gold text-[9px] tracking-luxe-sm uppercase font-medium">
              Combo
            </span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-1 bg-garnet text-cream text-[9px] tracking-luxe-sm uppercase font-medium">
              -{discountPct}%
            </span>
          )}
          {!product.available && (
            <span className="px-2.5 py-1 bg-obsidian text-cream/70 text-[9px] tracking-luxe-sm uppercase border border-gold/30">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-gold/20 transition-all duration-300"
          aria-label="Add to wishlist"
        >
          <Heart
            size={15}
            strokeWidth={1.5}
            className={wished ? "fill-gold text-gold" : "text-cream/70"}
          />
        </button>

        {/* Image */}
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.images?.[0]}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            } group-hover:brightness-90`}
          />
          {!imgLoaded && <div className="absolute inset-0 bg-obsidian-soft animate-pulse" />}
        </Link>

        {/* Hover overlay actions */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-3 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <button
            onClick={() => addToCart(product)}
            disabled={!product.available}
            className="flex-1 btn-gold py-3 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={14} strokeWidth={1.5} />
            Add to Cart
          </button>
          <button
            onClick={() => openQuickView(product)}
            className="w-12 glass-strong text-cream hover:text-gold flex items-center justify-center transition-colors"
            aria-label="Quick view"
          >
            <Eye size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="pt-4 text-center">
        <p className="text-[10px] tracking-luxe-sm text-gold/70 uppercase mb-1.5">
          {product.is_bundle
           ? `Curated Combo · ${(product.bundle_items || []).reduce((s, i) => s + (i.quantity || 1), 0)} items`
            : `${product.fragrance_family} · ${product.category}`}
        </p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-heading text-lg text-cream hover:text-gold transition-colors duration-300 leading-tight">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-cream/45 mt-1.5 line-clamp-1 px-2">{product.short_description}</p>
        {product.rating > 0 && (
          <div className="flex items-center justify-center gap-2 mt-2.5">
            <StarRating rating={product.rating} size={12} />
            <span className="text-[10px] text-cream/40">({product.review_count || 0})</span>
          </div>
        )}
        <div className="flex items-center justify-center gap-2 mt-2.5">
          <span className="text-cream font-medium text-base">{formatNaira(product.price)}</span>
          {hasDiscount && (
            <span className="text-cream/35 text-sm line-through">{formatNaira(product.compare_at_price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}