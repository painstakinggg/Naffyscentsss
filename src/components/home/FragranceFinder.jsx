import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/product/ProductCard";
import Reveal from "@/components/ui/Reveal";
import { Sparkles, RotateCcw, Check } from "lucide-react";

const GENDER_OPTS = ["Women", "Men", "Unisex"];
const FAMILY_OPTS = ["Fresh", "Sweet", "Woody", "Floral", "Oud", "Spicy", "Citrus", "Musky"];
const OCCASION_OPTS = ["Romantic", "Bold", "Everyday", "Evening"];
const INTENSITY_OPTS = ["Light", "Moderate", "Intense"];
const MOOD_OPTS = ["Fresh", "Sweet", "Woody", "Floral", "Oud", "Spicy", "Citrus", "Musky", "Romantic", "Bold", "Everyday", "Evening"];

function Chip({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 text-sm border transition-all duration-300 ${
        selected
          ? "border-gold bg-gold/15 text-gold"
          : "border-gold/20 text-cream/60 hover:border-gold/50 hover:text-cream"
      }`}
    >
      {label}
    </button>
  );
}

export default function FragranceFinder() {
  const { products } = useProducts();
  const [selections, setSelections] = useState({ gender: [], family: [], occasion: [], intensity: [], mood: [] });
  const [results, setResults] = useState(null);

  const toggle = (key, val) => {
    setSelections((s) => {
      const arr = s[key];
      return { ...s, [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] };
    });
  };

  const findMatches = () => {
    let matches = products.filter((p) => p.available);
    if (selections.gender.length) matches = matches.filter((p) => selections.gender.includes(p.gender));
    if (selections.family.length) matches = matches.filter((p) => selections.family.includes(p.fragrance_family));
    if (selections.occasion.length) matches = matches.filter((p) => p.occasions?.some((o) => selections.occasion.includes(o)));
    if (selections.intensity.length) matches = matches.filter((p) => selections.intensity.includes(p.intensity));
    if (selections.mood.length) matches = matches.filter((p) => p.moods?.some((m) => selections.mood.includes(m)));
    // fallback: if no matches but selections made, score by partial
    if (matches.length === 0 && products.length > 0) {
      matches = products.filter((p) => p.available).slice(0, 3);
    }
    setResults(matches.slice(0, 3));
  };

  const reset = () => {
    setSelections({ gender: [], family: [], occasion: [], intensity: [], mood: [] });
    setResults(null);
  };

  const anySelected = Object.values(selections).some((a) => a.length > 0);

  return (
    <section className="py-20 sm:py-28 bg-obsidian-soft">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8">
        <Reveal className="text-center mb-12">
          <p className="text-[11px] tracking-luxe text-gold uppercase mb-4">Fragrance Finder</p>
          <h2 className="font-heading text-3xl sm:text-5xl text-cream mb-3">Find Your Signature Scent</h2>
          <p className="text-sm text-cream/50 max-w-lg mx-auto">Tell us your preferences and we'll curate fragrances made for you.</p>
        </Reveal>

        {!results ? (
          <Reveal delay={0.1}>
            <div className="glass rounded-2xl p-6 sm:p-10 space-y-8">
              <div>
                <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-3">Gender Preference</p>
                <div className="flex flex-wrap gap-2.5">
                  {GENDER_OPTS.map((o) => <Chip key={o} label={o} selected={selections.gender.includes(o)} onClick={() => toggle("gender", o)} />)}
                </div>
              </div>
              <div>
                <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-3">Fragrance Family</p>
                <div className="flex flex-wrap gap-2.5">
                  {FAMILY_OPTS.map((o) => <Chip key={o} label={o} selected={selections.family.includes(o)} onClick={() => toggle("family", o)} />)}
                </div>
              </div>
              <div>
                <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-3">Occasion</p>
                <div className="flex flex-wrap gap-2.5">
                  {OCCASION_OPTS.map((o) => <Chip key={o} label={o} selected={selections.occasion.includes(o)} onClick={() => toggle("occasion", o)} />)}
                </div>
              </div>
              <div>
                <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-3">Desired Intensity</p>
                <div className="flex flex-wrap gap-2.5">
                  {INTENSITY_OPTS.map((o) => <Chip key={o} label={o} selected={selections.intensity.includes(o)} onClick={() => toggle("intensity", o)} />)}
                </div>
              </div>
              <div>
                <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-3">Mood</p>
                <div className="flex flex-wrap gap-2.5">
                  {MOOD_OPTS.map((o) => <Chip key={o} label={o} selected={selections.mood.includes(o)} onClick={() => toggle("mood", o)} />)}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button onClick={findMatches} className="btn-gold px-8 py-4 inline-flex items-center justify-center gap-2 flex-1">
                  <Sparkles size={15} /> Discover My Scent
                </button>
                {anySelected && (
                  <button onClick={reset} className="btn-outline-gold px-6 py-4 inline-flex items-center justify-center gap-2">
                    <RotateCcw size={14} /> Reset
                  </button>
                )}
              </div>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <div className="text-center mb-10">
              <p className="text-[11px] tracking-luxe text-gold uppercase mb-3">Your Curated Matches</p>
              <h3 className="font-heading text-3xl text-cream">Fragrances Made For You</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {results.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
              <Link to="/shop" className="btn-gold px-8 py-4 inline-flex items-center justify-center gap-2">
                <Check size={15} /> Shop All Fragrances
              </Link>
              <button onClick={reset} className="btn-outline-gold px-8 py-4 inline-flex items-center justify-center gap-2">
                <RotateCcw size={14} /> Start Over
              </button>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}