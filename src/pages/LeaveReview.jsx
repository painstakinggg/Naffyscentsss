import React from "react";
import { useSearchParams } from "react-router-dom";
import ReviewForm from "@/components/reviews/ReviewForm";
import Reveal from "@/components/ui/Reveal";

export default function LeaveReview() {
  const [params] = useSearchParams();
  const productId = params.get("product") || "";
  const productName = params.get("name") || "";
  const orderNumber = params.get("order") || "";

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-[720px] mx-auto px-5 sm:px-8">
        <Reveal className="text-center mb-10">
          <p className="text-[11px] tracking-luxe text-gold uppercase mb-3">Share Your Experience</p>
          <h1 className="font-heading text-4xl text-cream mb-4">Leave a Review</h1>
          <div className="luxury-line w-24 mx-auto" />
          <p className="text-sm text-cream/50 mt-5">
            Tell us about your Naffy Scents experience. Your review will be published once approved.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <ReviewForm productId={productId} productName={productName} orderNumber={orderNumber} />
        </Reveal>
      </div>
    </div>
  );
}