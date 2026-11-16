import React, { useState } from "react";
import { MessageCircle, X, Sparkles, Package } from "lucide-react";
import { useStore } from "@/lib/store-context";

export default function WhatsAppButton() {
  const { settings } = useStore();
  const [open, setOpen] = useState(false);
  const wa = settings?.whatsapp_number || "2348012345678";

  const sendMessage = (message) => {
    const url = `https://wa.me/${wa}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="glass-strong rounded-2xl overflow-hidden w-64 animate-scale-in origin-bottom-right shadow-2xl">
          <div className="bg-gradient-to-r from-gold-dark to-gold px-4 py-3 flex items-center justify-between">
            <span className="font-display text-sm tracking-luxe-sm text-obsidian">NAFFY CONCIERGE</span>
            <button onClick={() => setOpen(false)} className="text-obsidian/70">
              <X size={16} />
            </button>
          </div>
          <div className="p-3 flex flex-col gap-2">
            <button
              onClick={() => sendMessage("Hello Naffy Scents, I'd like to speak to a scent expert for a recommendation.")}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gold/10 transition-colors text-left group"
            >
              <span className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center text-gold">
                <Sparkles size={16} />
              </span>
              <span>
                <span className="block text-sm text-cream">Talk to a Scent Expert</span>
                <span className="block text-xs text-cream/40">Personal recommendations</span>
              </span>
            </button>
            <button
              onClick={() => sendMessage("Hello Naffy Scents, I'd like to check my order status.")}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gold/10 transition-colors text-left group"
            >
              <span className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center text-gold">
                <Package size={16} />
              </span>
              <span>
                <span className="block text-sm text-cream">Check Order Status</span>
                <span className="block text-xs text-cream/40">Track your delivery</span>
              </span>
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-300 animate-pulse-gold"
        aria-label="WhatsApp concierge"
      >
        {open ? (
          <X size={24} className="text-obsidian" />
        ) : (
          <MessageCircle size={26} className="text-obsidian" strokeWidth={1.5} />
        )}
      </button>
    </div>
  );
}