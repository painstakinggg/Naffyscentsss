import React, { useState } from "react";
import { useStore } from "@/lib/store-context";
import Reveal from "@/components/ui/Reveal";
import { ArrowRight, Check } from "lucide-react";

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
    <section className="py-24 sm:py-32 px-5 sm:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian-soft to-obsidian" />
      <Reveal className="relative z-10 max-w-2xl mx-auto text-center">
        <p className="text-[11px] tracking-luxe text-gold uppercase mb-5">Newsletter</p>
        <h2 className="font-heading text-3xl sm:text-5xl text-cream mb-5">Enter the World of Naffy</h2>
        <p className="text-sm text-cream/55 mb-10 max-w-md mx-auto leading-relaxed">{text}</p>

        {done ? (
          <div className="glass rounded-xl px-8 py-6 inline-flex items-center gap-3 text-sage animate-scale-in">
            <Check size={20} />
            <span className="text-sm">Welcome to the inner circle. Check your inbox.</span>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 bg-transparent border border-gold/25 px-5 py-4 text-cream placeholder:text-cream/40 text-sm outline-none focus:border-gold transition-colors"
            />
            <button type="submit" className="btn-gold px-8 py-4 inline-flex items-center justify-center gap-2 whitespace-nowrap">
              Join the List <ArrowRight size={15} />
            </button>
          </form>
        )}
      </Reveal>
    </section>
  );
}