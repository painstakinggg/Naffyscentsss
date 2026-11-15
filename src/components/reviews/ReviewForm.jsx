import React, { useState } from "react";

import { Check, Star } from "lucide-react";

export default function ReviewForm({ productId = "", productName = "", orderNumber = "", onSubmitted }) {
  const [form, setForm] = useState({ customer_name: "", email: "", review: "", order_number: orderNumber });
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const ref = form.order_number.trim();
      const response = await fetch("/api/reviews", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
        product_id: productId,
        product_name: productName,
        customer_name: form.customer_name.trim(),
        email: form.email.trim(),
        rating,
        review: form.review.trim(),
        order_number: ref,
        });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not submit review");
      setDone(true);
      onSubmitted?.();
    } catch (err) {
      setError("Could not submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <div className="w-14 h-14 rounded-full border border-gold flex items-center justify-center mx-auto mb-4">
          <Check size={24} className="text-gold" strokeWidth={1.5} />
        </div>
        <h3 className="font-heading text-2xl text-cream mb-2">Thank you for your review</h3>
        <p className="text-sm text-cream/55 max-w-md mx-auto">
          Your review has been received and is awaiting approval. It will appear on the website once approved by our team.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass rounded-xl p-6 sm:p-8 space-y-5">
      {productName && (
        <p className="text-[10px] tracking-luxe-sm text-gold uppercase">Reviewing: <span className="text-cream/70">{productName}</span></p>
      )}

      <div className="space-y-2">
        <label className="text-[10px] tracking-luxe-sm text-gold uppercase">Your Rating *</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              className="p-1"
              aria-label={`${i} star${i > 1 ? "s" : ""}`}
            >
              <Star
                size={26}
                strokeWidth={1.3}
                className={i <= (hover || rating) ? "fill-gold text-gold" : "text-cream/25"}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] tracking-luxe-sm text-gold uppercase">Name *</label>
        <input
          value={form.customer_name}
          onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
          required
          className="w-full bg-transparent border border-gold/25 px-4 py-3 text-cream text-sm outline-none focus:border-gold transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] tracking-luxe-sm text-gold uppercase">Your Review *</label>
        <textarea
          value={form.review}
          onChange={(e) => setForm({ ...form, review: e.target.value })}
          required
          rows={4}
          className="w-full bg-transparent border border-gold/25 px-4 py-3 text-cream text-sm outline-none focus:border-gold transition-colors resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] tracking-luxe-sm text-gold uppercase">Email (optional)</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-transparent border border-gold/25 px-4 py-3 text-cream text-sm outline-none focus:border-gold transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] tracking-luxe-sm text-gold uppercase">Order Number (optional)</label>
          <input
            value={form.order_number}
            onChange={(e) => setForm({ ...form, order_number: e.target.value })}
            placeholder="e.g. A1B2C3D4"
            className="w-full bg-transparent border border-gold/25 px-4 py-3 text-cream placeholder:text-cream/30 text-sm outline-none focus:border-gold transition-colors"
          />
        </div>
      </div>

      {error && <p className="text-xs text-garnet">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-gold w-full py-4 disabled:opacity-50">
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
      <p className="text-xs text-cream/40 text-center">Reviews are published after approval by our team.</p>
    </form>
  );
}