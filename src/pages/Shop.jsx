import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/product/ProductCard";
import { SlidersHorizontal, X, Search } from "lucide-react";

const CATEGORIES = ["For Her", "For Him", "Unisex", "Signature"];
const FAMILIES = ["Fresh", "Sweet", "Woody", "Floral", "Oud", "Spicy", "Citrus", "Musky"];
const GENDERS = ["Women", "Men", "Unisex"];

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const search = params.get("q") || "";
  const category = params.get("category") || "";
  const family = params.get("family") || "";
  const gender = params.get("gender") || "";
  const availability = params.get("availability") || "";
  const sort = params.get("sort") || "newest";
  const maxPrice = params.get("maxPrice") || "";
  const type = params.get("type") || "";

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Unable to load products from the store database");
        }
        const data = await response.json();
        setAllProducts(Array.isArray(data.products) ? data.products : []);
      } catch (e) {
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let r = [...allProducts];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.fragrance_family?.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q)
      );
    }
    if (category) r = r.filter((p) => p.category === category);
    if (family) r = r.filter((p) => p.fragrance_family === family);
    if (gender) r = r.filter((p) => p.gender === gender || p.gender === "Unisex");
    if (availability === "in") r = r.filter((p) => p.available);
    if (type === "bundle") r = r.filter((p) => p.is_bundle);
    else if (type === "single") r = r.filter((p) => !p.is_bundle);
    if (maxPrice) r = r.filter((p) => p.price <= Number(maxPrice));

    if (sort === "price-low") r.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") r.sort((a, b) => b.price - a.price);
    else if (sort === "popular") r.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
    return r;
  }, [allProducts, search, category, family, gender, availability, maxPrice, type, sort]);

  const update = (key, val) => {
    const next = new URLSearchParams(params);
    if (val) next.set(key, val); else next.delete(key);
    setParams(next);
  };

  const clearAll = () => setParams(new URLSearchParams());

  const activeFilters = [category, family, gender, availability, maxPrice, search, type].filter(Boolean).length;

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-luxe text-gold uppercase mb-3">The Collection</p>
          <h1 className="font-heading text-4xl sm:text-6xl text-cream">Shop All Fragrances</h1>
          <p className="text-sm text-cream/50 mt-4">{filtered.length} {filtered.length === 1 ? "fragrance" : "fragrances"} available</p>
        </div>

        {/* Search + sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1 flex items-center gap-2 border border-gold/20 px-4 py-3">
            <Search size={16} className="text-gold" />
            <input
              value={search}
              onChange={(e) => update("q", e.target.value)}
              placeholder="Search fragrances..."
              className="flex-1 bg-transparent text-cream placeholder:text-cream/40 text-sm outline-none"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => update("sort", e.target.value)}
            className="border border-gold/20 bg-obsidian-soft text-cream px-4 py-3 text-sm outline-none cursor-pointer"
          >
            {SORTS.map((s) => <option key={s.value} value={s.value} className="bg-obsidian">{s.label}</option>)}
          </select>
          <button
            onClick={() => setShowFilters(true)}
            className="lg:hidden border border-gold/20 px-4 py-3 text-sm text-cream flex items-center gap-2 justify-center"
          >
            <SlidersHorizontal size={15} /> Filters {activeFilters > 0 && `(${activeFilters})`}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Desktop filters */}
          <aside className="hidden lg:block w-60 shrink-0">
            <FilterPanel
              category={category} family={family} gender={gender} availability={availability}
              type={type} maxPrice={maxPrice} update={update} clearAll={clearAll} activeFilters={activeFilters}
            />
          </aside>

          {/* Products */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="aspect-[3/4] bg-obsidian-soft animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <p className="font-heading text-2xl text-cream/60 mb-3">No fragrances found</p>
                <p className="text-sm text-cream/40 mb-6">Try adjusting your filters</p>
                <button onClick={clearAll} className="btn-outline-gold px-8 py-3">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filtered.map((p) => <ProductCard key={p.id} product={p} badge={p.bestseller ? "Best Seller" : null} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-obsidian-soft border-l border-gold/20 overflow-y-auto p-6 animate-slide-in-right">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-2xl text-cream">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-cream/60"><X size={20} /></button>
            </div>
            <FilterPanel
              category={category} family={family} gender={gender} availability={availability}
              type={type} maxPrice={maxPrice} update={update} clearAll={clearAll} activeFilters={activeFilters}
            />
            <button onClick={() => setShowFilters(false)} className="btn-gold w-full py-4 mt-6">Show Results</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel({ category, family, gender, availability, type, maxPrice, update, clearAll, activeFilters }) {
  return (
    <div className="space-y-7">
      {activeFilters > 0 && (
        <button onClick={clearAll} className="text-[11px] tracking-luxe-sm text-gold uppercase hover:text-gold-light flex items-center gap-1">
          <X size={12} /> Clear All
        </button>
      )}
      <div>
        <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-3">Type</p>
        <div className="space-y-2">
          <button onClick={() => update("type", "")} className={`block text-sm transition-colors ${!type ? "text-gold" : "text-cream/55 hover:text-cream"}`}>All Products</button>
          <button onClick={() => update("type", "single")} className={`block text-sm transition-colors ${type === "single" ? "text-gold" : "text-cream/55 hover:text-cream"}`}>Fragrances</button>
          <button onClick={() => update("type", "bundle")} className={`block text-sm transition-colors ${type === "bundle" ? "text-gold" : "text-cream/55 hover:text-cream"}`}>Bundles</button>
        </div>
      </div>
      <div>
        <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-3">Category</p>
        <div className="space-y-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => update("category", category === c ? "" : c)}
              className={`block text-sm transition-colors ${category === c ? "text-gold" : "text-cream/55 hover:text-cream"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-3">Fragrance Family</p>
        <div className="space-y-2">
          {FAMILIES.map((f) => (
            <button key={f} onClick={() => update("family", family === f ? "" : f)}
              className={`block text-sm transition-colors ${family === f ? "text-gold" : "text-cream/55 hover:text-cream"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-3">Gender</p>
        <div className="space-y-2">
          {GENDERS.map((g) => (
            <button key={g} onClick={() => update("gender", gender === g ? "" : g)}
              className={`block text-sm transition-colors ${gender === g ? "text-gold" : "text-cream/55 hover:text-cream"}`}>
              {g}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-3">Availability</p>
        <div className="space-y-2">
          <button onClick={() => update("availability", availability === "in" ? "" : "in")}
            className={`block text-sm transition-colors ${availability === "in" ? "text-gold" : "text-cream/55 hover:text-cream"}`}>
            In Stock Only
          </button>
        </div>
      </div>
      <div>
        <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-3">Max Price</p>
        <input type="range" min="10000" max="150000" step="5000" value={maxPrice || 150000}
          onChange={(e) => update("maxPrice", e.target.value)} className="w-full accent-[#C5A059]" />
        <p className="text-xs text-cream/50 mt-1">₦{Number(maxPrice || 150000).toLocaleString()}</p>
      </div>
    </div>
  );
}