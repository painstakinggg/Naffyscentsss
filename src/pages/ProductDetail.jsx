import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCart } from "@/lib/cart-context";
import { useQuickView } from "@/lib/quickview-context";
import { formatNaira } from "@/lib/images";
import StarRating from "@/components/product/StarRating";
import ProductCard from "@/components/product/ProductCard";
import { Minus, Plus, ShoppingBag, Heart, Truck, Shield, RefreshCw, ChevronRight } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState(100);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("notes");
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const p = await base44.entities.Product.get(id);
        setProduct(p);
        setSize(p?.is_bundle ? 0 : (p?.size_ml || 100));
        setActiveImg(0);
        // related
        const all = await base44.entities.Product.list("-created_date", 100);
        setRelated((all || []).filter((x) => x.id !== id && x.category === p?.category).slice(0, 4));
        // reviews
        const revs = await base44.entities.Review.filter({ product_id: id, status: "Approved" });
        setReviews(revs || []);
      } catch (e) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    })();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return <div className="pt-32 min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>;
  }

  if (!product) {
    return (
      <div className="pt-32 min-h-screen text-center px-5">
        <h1 className="font-heading text-3xl text-cream mb-4">Fragrance not found</h1>
        <Link to="/shop" className="btn-outline-gold inline-block px-8 py-3">Back to Shop</Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [""];
  const wished = isWishlisted(product.id);
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

  const handleBuyNow = () => {
    addToCart(product, qty, size);
    navigate("/checkout");
  };

  return (
    <div className="pt-24 pb-20">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-4 flex items-center gap-2 text-xs text-cream/40">
        <Link to="/" className="hover:text-gold">Home</Link>
        <ChevronRight size={12} />
        <Link to="/shop" className="hover:text-gold">Shop</Link>
        <ChevronRight size={12} />
        <span className="text-cream/70">{product.name}</span>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Gallery */}
        <div className="flex flex-col-reverse lg:flex-row gap-4">
          <div className="flex lg:flex-col gap-3 overflow-x-auto no-scrollbar">
            {images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`shrink-0 w-16 h-20 lg:w-20 lg:h-24 overflow-hidden border-2 transition-colors ${activeImg === i ? "border-gold" : "border-transparent opacity-60"}`}>
                <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex-1 aspect-[3/4] overflow-hidden bg-obsidian-soft relative">
            <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
            {product.bestseller && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-gold text-obsidian text-[10px] tracking-luxe-sm uppercase">Best Seller</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="lg:py-4">
          <p className="text-[11px] tracking-luxe-sm text-gold uppercase mb-3">{product.fragrance_family} · {product.category}</p>
          <h1 className="font-heading text-4xl sm:text-5xl text-cream mb-4">{product.name}</h1>
          {product.rating > 0 && reviews.length > 0 && (
            <div className="flex items-center gap-3 mb-5">
              <StarRating rating={product.rating} size={16} />
              <span className="text-sm text-cream/50">{product.rating} · {reviews.length} reviews</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl text-cream font-medium">{formatNaira(product.price)}</span>
            {hasDiscount && <span className="text-cream/35 text-lg line-through">{formatNaira(product.compare_at_price)}</span>}
          </div>

          <p className="text-cream/60 leading-relaxed mb-8">{product.short_description}</p>

          {product.is_bundle && (product.bundle_items || []).length > 0 && (
            <div className="mb-8 p-5 border border-gold/20 rounded-lg">
              <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-4">What's Inside The Bundle</p>
              <div className="space-y-3">
                {(product.bundle_items || []).map((bi) => (
                  <div key={bi.product_id} className="flex items-center gap-4">
                    <div className="w-12 h-16 bg-obsidian-soft overflow-hidden shrink-0">
                      {bi.image && <img src={bi.image} alt={bi.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-cream text-sm">{bi.name}</p>
                      <p className="text-cream/40 text-xs">Qty {bi.quantity}</p>
                    </div>
                    <Link to={`/product/${bi.product_id}`} className="text-gold text-xs tracking-luxe-sm uppercase hover:text-gold-light">View</Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!product.is_bundle && (
            <div className="mb-5">
              <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-3">Size</p>
              <div className="flex gap-3">
                {[50, 100].map((s) => (
                  <button key={s} onClick={() => setSize(s)}
                    className={`px-6 py-3 text-sm border transition-all ${size === s ? "border-gold text-gold bg-gold/10" : "border-gold/20 text-cream/60"}`}>
                    {s}ml
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-3">Quantity</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gold/20">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-11 h-11 text-cream/70 hover:text-gold flex items-center justify-center"><Minus size={15} /></button>
                <span className="w-12 text-center text-cream">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="w-11 h-11 text-cream/70 hover:text-gold flex items-center justify-center"><Plus size={15} /></button>
              </div>
              <span className={`text-sm ${product.available ? "text-sage" : "text-garnet"}`}>
                {product.available ? "In Stock" : "Sold Out"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button onClick={() => addToCart(product, qty, size)} disabled={!product.available}
              className="flex-1 btn-gold py-4 flex items-center justify-center gap-2 disabled:opacity-40">
              <ShoppingBag size={16} /> Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={!product.available}
              className="flex-1 btn-outline-gold py-4 disabled:opacity-40">
              Buy Now
            </button>
            <button onClick={() => toggleWishlist(product.id)}
              className="w-14 border border-gold/30 text-cream hover:text-gold hover:border-gold flex items-center justify-center transition-all">
              <Heart size={18} className={wished ? "fill-gold text-gold" : ""} strokeWidth={1.5} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 py-6 border-y border-gold/10">
            {[
              { icon: Truck, label: "Nationwide Delivery" },
              { icon: Shield, label: "Authentic Guarantee" },
              { icon: RefreshCw, label: "Easy Returns" },
            ].map((t) => (
              <div key={t.label} className="flex flex-col items-center text-center gap-2">
                <t.icon size={18} className="text-gold" strokeWidth={1.3} />
                <span className="text-[10px] text-cream/50 tracking-wide">{t.label}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mt-8">
            <div className="flex gap-6 border-b border-gold/10">
              {[
                { key: "notes", label: "Fragrance Notes" },
                { key: "desc", label: "Description" },
                { key: "reviews", label: `Reviews (${reviews.length})` },
              ].map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`pb-3 text-[11px] tracking-luxe-sm uppercase transition-colors ${tab === t.key ? "text-gold border-b border-gold" : "text-cream/40"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="pt-6">
              {tab === "notes" && (
                <div className="space-y-4">
                  {[
                    { label: "Top Notes", val: product.top_notes },
                    { label: "Heart Notes", val: product.heart_notes },
                    { label: "Base Notes", val: product.base_notes },
                  ].map((n) => n.val && (
                    <div key={n.label} className="flex gap-4">
                      <span className="text-[10px] tracking-luxe-sm text-gold uppercase w-20 shrink-0 pt-1">{n.label}</span>
                      <span className="text-sm text-cream/65 flex-1">{n.val}</span>
                    </div>
                  ))}
                  {!product.top_notes && !product.heart_notes && !product.base_notes && (
                    <p className="text-sm text-cream/40">Notes information coming soon.</p>
                  )}
                </div>
              )}
              {tab === "desc" && <p className="text-sm text-cream/60 leading-relaxed">{product.description || product.short_description}</p>}
              {tab === "reviews" && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-cream/50">{reviews.length === 0 ? "No reviews yet" : `${reviews.length} review${reviews.length === 1 ? "" : "s"}`}</p>
                    <Link to={`/leave-review?product=${product.id}&name=${encodeURIComponent(product.name)}`} className="btn-outline-gold px-5 py-2.5">Leave a Review</Link>
                  </div>
                  {reviews.length === 0 ? (
                    <p className="text-sm text-cream/40">Be the first to share your experience.</p>
                  ) : reviews.map((r, i) => (
                    <div key={i} className="pb-4 border-b border-gold/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-cream">{r.customer_name}</span>
                        <StarRating rating={r.rating} size={12} />
                      </div>
                      <p className="text-sm text-cream/55">{r.review}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 mt-24">
          <h2 className="font-heading text-3xl text-cream text-center mb-10">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}