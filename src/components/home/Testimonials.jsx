import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import StarRating from "@/components/product/StarRating";
import Reveal from "@/components/ui/Reveal";
import { BadgeCheck } from "lucide-react";

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.Review.filter({ featured: true, status: "Approved" });
        setReviews(list || []);
      } catch (e) {
        setReviews([]);
      }
    })();
  }, []);

  return (
    <section className="py-20 sm:py-28 px-5 sm:px-8 max-w-[1400px] mx-auto">
      <Reveal className="text-center mb-14">
        <p className="text-[11px] tracking-luxe text-gold uppercase mb-4">The Naffy Experience</p>
        <h2 className="font-heading text-3xl sm:text-5xl text-cream">Words From Our Community</h2>
        <div className="luxury-line w-24 mx-auto mt-6" />
      </Reveal>

      {reviews.length === 0 && (
        <p className="text-center text-sm text-cream/40">No reviews yet. Be the first to share your experience.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.slice(0, 3).map((r, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div className="glass rounded-2xl p-8 h-full flex flex-col">
              <StarRating rating={r.rating} size={16} />
              <p className="text-cream/70 text-sm leading-relaxed my-5 flex-1 italic font-heading text-lg">
                "{r.review}"
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gold/10">
                <div>
                  <p className="text-cream font-medium text-sm">{r.customer_name}</p>
                  <p className="text-cream/40 text-xs">{r.location || "Nigeria"}</p>
                </div>
                {r.verified && (
                  <span className="flex items-center gap-1 text-[10px] tracking-luxe-sm text-sage uppercase">
                    <BadgeCheck size={13} /> Verified
                  </span>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}