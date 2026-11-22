import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Zap, Eye } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/images";
import StarRating from "./StarRating";

/** @param {{ product: any, badge?: string }} props */
export default function ProductCard({ product, badge }) {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const wished = isWishlisted(product.id);
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const handleImageClick = (event) => {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) {
      event.preventDefault();
      setActionsOpen((open) => !open);
    }
  };

  const handleMouseEnter = () => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      setActionsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      setActionsOpen(false);
    }
  };

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!product.available) return;
    addToCart(product);
    setActionsOpen(false);
  };

  const handleBuyNow = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!product.available) return;
    addToCart(product);
    setActionsOpen(false);
    navigate("/checkout");
  };

  return (
    <div className="group relative flex h-full flex-col" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="relative aspect-[3/4] overflow-hidden bg-obsidian-soft">
        {/* Product badges */}
        <div className="absolute left-3 top-3 z-20 flex flex-col gap-1.5">
          {badge && (
            <span className="bg-gold px-2.5 py-1 text-[9px] font-medium uppercase tracking-luxe-sm text-cream">
              {badge}
            </span>
          )}
          {product.is_bundle && (
            <span className="border border-gold/40 bg-obsidian px-2.5 py-1 text-[9px] font-medium uppercase tracking-luxe-sm text-gold">
              Combo
            </span>
          )}
          {hasDiscount && (
            <span className="bg-garnet px-2.5 py-1 text-[9px] font-medium uppercase tracking-luxe-sm text-cream">
              -{discountPct}%
            </span>
          )}
          {!product.available && (
            <span className="border border-gold/30 bg-obsidian px-2.5 py-1 text-[9px] uppercase tracking-luxe-sm text-cream/70">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleWishlist(product.id); }}
          className="glass absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 hover:bg-gold/20"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={15} strokeWidth={1.5} className={wished ? "fill-gold text-gold" : "text-cream/70"} />
        </button>

        {/* Product image remains static; touch tap reveals the existing shopping actions */}
        <Link to={`/product/${product.id}`} onClick={handleImageClick} className="block h-full w-full">
          <img
            src={product.images?.[0]}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`h-full w-full object-cover transition-opacity duration-700 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          />
          {!imgLoaded && <div className="absolute inset-0 bg-obsidian-soft" />}
        </Link>

        {/* Compact icon actions: hover on desktop, tap-to-reveal on touch screens */}
        <div
          className={`absolute inset-0 z-10 flex items-center justify-center bg-obsidian/75 p-3 backdrop-blur-[2px] transition-opacity duration-300 ${actionsOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
          onClick={() => setActionsOpen(false)}
          aria-hidden={!actionsOpen}
        >
          <div className="grid w-full max-w-[180px] grid-cols-3 gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.available}
              aria-label="Add to cart"
              title="Add to cart"
              className="flex aspect-square items-center justify-center rounded-full border border-gold/70 bg-obsidian/40 text-cream transition-all duration-200 hover:border-gold hover:bg-gold hover:text-obsidian disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingBag size={19} strokeWidth={1.6} />
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!product.available}
              aria-label="Buy now"
              title="Buy now"
              className="flex aspect-square items-center justify-center rounded-full border border-gold bg-gold text-obsidian transition-all duration-200 hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Zap size={19} strokeWidth={1.7} />
            </button>
            <Link
              to={`/product/${product.id}`}
              onClick={(event) => event.stopPropagation()}
              aria-label="View details"
              title="View details"
              className="flex aspect-square items-center justify-center rounded-full border border-cream/50 bg-obsidian/40 text-cream transition-all duration-200 hover:border-gold hover:bg-gold hover:text-obsidian"
            >
              <Eye size={19} strokeWidth={1.6} />
            </Link>
          </div>
        </div>
      </div>

      {/* Existing product information remains unchanged */}
      <div className="flex-1 pt-4 text-center">
        <p className="mb-1.5 text-[10px] uppercase tracking-luxe-sm text-gold/70">
          {product.is_bundle
            ? `Curated Combo · ${(product.bundle_items || []).reduce((sum, item) => sum + (item.quantity || 1), 0)} items`
            : `${product.fragrance_family} · ${product.category}`}
        </p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-heading text-lg leading-tight text-cream transition-colors duration-300 hover:text-gold">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1.5 line-clamp-1 px-2 text-xs text-cream/45">{product.short_description}</p>
        {product.rating > 0 && (
          <div className="mt-2.5 flex items-center justify-center gap-2">
            <StarRating rating={product.rating} size={12} />
            <span className="text-[10px] text-cream/40">({product.review_count || 0})</span>
          </div>
        )}
        <div className="mt-2.5 flex items-center justify-center gap-2">
          <span className="text-base font-medium text-cream">{formatNaira(product.price)}</span>
          {hasDiscount && (
            <span className="text-sm text-cream/35 line-through">{formatNaira(product.compare_at_price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
