import React, { useState } from "react";
import { useStore } from "@/lib/store-context";
import Reveal from "@/components/ui/Reveal";
import { ArrowRight, Check, Sparkles } from "lucide-react";

export default function Newsletter() {
  const { settings } = useStore();
  const text = settings?.newsletter_text || "Sign up for new fragrance drops, exclusive offers and curated scent stories.";
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setEmail("");
  };

  return (
    <section className="newsletter-section px-5 sm:px-8 py-20 sm:py-24 relative overflow-hidden">
      <div className="newsletter-panel newsletter-inner-circle relative max-w-5xl mx-auto overflow-hidden rounded-2xl">
        <Reveal className="newsletter-header relative z-10 px-6 py-10 sm:px-14 sm:py-14">
          <div className="flex items-center justify-between gap-4 newsletter-brandline">
            <span className="text-[10px] sm:text-[11px] tracking-luxe uppercase">Naffy Scents</span>
            <span className="text-[9px] sm:text-[10px] tracking-luxe uppercase">The Naffy Letter</span>
          </div>
          <div className="newsletter-heading-block mt-10 sm:mt-12 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] tracking-luxe uppercase mb-4 newsletter-kicker">
              <Sparkles size={13} /> The Naffy Letter
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl mb-4">A Little More Luxury, in Your Inbox</h2>
            <p className="text-sm sm:text-base max-w-xl leading-relaxed">{text}</p>
          </div>
        </Reveal>
        <div className="newsletter-signup relative z-10 px-6 py-8 sm:px-14 sm:py-10">
          {done ? (
            <div className="newsletter-success rounded-xl px-6 py-5 inline-flex items-center gap-3 animate-scale-in">
              <Check size={20} />
              <span className="text-sm">Welcome to the inner circle. Check your inbox.</span>
            </div>
          ) : (
            <form onSubmit={submit} className="newsletter-form flex flex-col sm:flex-row gap-3 max-w-2xl">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                aria-label="Email address"
                className="flex-1 min-w-0 rounded-md px-5 py-4 text-sm outline-none transition-colors"
              />
              <button type="submit" className="newsletter-submit px-7 py-4 rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap">
                Join the List <ArrowRight size={15} />
              </button>
            </form>
          )}
          <p className="relative z-10 mt-5 text-[10px] tracking-wide newsletter-note">Thoughtful updates only. Unsubscribe whenever you like.</p>
        </div>
      </div>
    </section>
  );
}