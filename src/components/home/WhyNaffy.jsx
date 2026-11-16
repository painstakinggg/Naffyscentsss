import React from "react";
import { Clock, Gem, Sparkles, Layers } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const FEATURES = [
  { icon: Clock, title: "Long-Lasting", desc: "Fragrances designed to stay with you throughout the day." },
  { icon: Gem, title: "Signature Quality", desc: "Carefully selected fragrance profiles with a premium feel." },
  { icon: Sparkles, title: "Made for Presence", desc: "Scents created to make an impression." },
  { icon: Layers, title: "Elegantly Curated", desc: "A collection chosen for people who appreciate sophistication." },
];

export default function WhyNaffy() {
  return (
    <section className="py-20 sm:py-28 px-5 sm:px-8 max-w-[1400px] mx-auto">
      <Reveal className="text-center mb-14">
        <p className="text-[11px] tracking-luxe text-gold uppercase mb-4">Why Naffy Scents</p>
        <h2 className="font-heading text-3xl sm:text-5xl text-cream">The Difference Is In The Details</h2>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gold/10">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.1}>
            <div className="bg-obsidian p-8 sm:p-10 h-full flex flex-col items-center text-center group hover:bg-obsidian-soft transition-colors duration-500">
              <div className="w-14 h-14 rounded-full border border-gold/30 flex items-center justify-center mb-6 group-hover:border-gold group-hover:bg-gold/5 transition-all duration-500">
                <f.icon size={22} strokeWidth={1.2} className="text-gold" />
              </div>
              <h3 className="font-heading text-xl text-cream mb-3">{f.title}</h3>
              <p className="text-sm text-cream/50 leading-relaxed">{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}