import React from "react";
import { Link } from "react-router-dom";
import { IMAGES } from "@/lib/images";
import Reveal from "@/components/ui/Reveal";
import { Clock, Gem, Sparkles, Layers } from "lucide-react";

const VALUES = [
  { icon: Clock, title: "Long-Lasting", desc: "Fragrances designed to stay with you throughout the day." },
  { icon: Gem, title: "Signature Quality", desc: "Carefully selected fragrance profiles with a premium feel." },
  { icon: Sparkles, title: "Made for Presence", desc: "Scents created to make an impression." },
  { icon: Layers, title: "Elegantly Curated", desc: "A collection chosen for people who appreciate sophistication." },
];

export default function About() {
  return (
    <div className="pt-28 pb-20">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[360px] overflow-hidden mb-20">
        <img src={IMAGES.brandStory} alt="Naffy Scents" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-obsidian/60" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-5">
          <p className="text-[11px] tracking-luxe text-gold uppercase mb-4 animate-fade-up">Our Story</p>
          <h1 className="font-heading text-4xl sm:text-6xl text-cream animate-fade-up delay-200">The House of Naffy</h1>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 sm:px-8 mb-24">
        <Reveal>
          <p className="text-[11px] tracking-luxe text-gold uppercase mb-5 text-center">The Naffy Philosophy</p>
          <h2 className="font-heading text-3xl sm:text-5xl text-cream leading-tight mb-8 text-balance text-center">
            MORE THAN A FRAGRANCE. IT'S AN IDENTITY.
          </h2>
          <div className="space-y-6 text-cream/60 leading-relaxed text-base">
            <p>
              Naffy Scents was born from a simple belief: a fragrance is never just a scent — it is a
              signature, a memory, and a presence that lingers long after you have left the room.
            </p>
            <p>
              We curate fragrances for individuals who understand that confidence is not spoken, it is felt.
              Every fragrance we offer is selected to complement your personality, mood, and presence — the
              invisible accessory that can say so much before a single word is spoken.
            </p>
            <p>
              From Ilaro to beyond, Naffy Scents is a celebration of individuality, presence, and the art of
              finding a fragrance that feels uniquely yours.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Values */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 mb-20">
        <Reveal className="text-center mb-14">
          <p className="text-[11px] tracking-luxe text-gold uppercase mb-4">Why Naffy Scents</p>
          <h2 className="font-heading text-3xl sm:text-5xl text-cream">The Difference Is In The Details</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gold/10">
          {VALUES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.1}>
              <div className="bg-obsidian p-8 sm:p-10 h-full flex flex-col items-center text-center group">
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

      <section className="text-center px-5">
        <Reveal>
          <Link to="/shop" className="btn-gold inline-block px-12 py-4">Shop the Collection</Link>
        </Reveal>
      </section>
    </div>
  );
}