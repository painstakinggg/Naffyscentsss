import React, { createContext, useContext, useEffect, useState, useCallback } from "react";


const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/store-settings", { headers: { accept: "application/json" } });
      if (!response.ok) throw new Error("Unable to load store settings");
      const data = await response.json();
      setSettings(data.settings || {});
    } catch (e) {
      // fallback defaults
      setSettings({
        whatsapp_number: "2348012345678",
        instagram_handle: "naffyscents",
        tiktok_handle: "naffyscents",
        facebook_handle: "naffyscents",
        delivery_fee_lagos: 2500,
        delivery_fee_nationwide: 4500,
        pickup_hours: "12:00 PM – 5:00 PM",
        logistics_provider: "Josh Logistics",
        delivery_fee_ilaro_min: 1000,
        delivery_fee_ilaro_max: 2000,
        delivery_info_note: "Delivery within Ilaro: ₦1,000 – ₦2,000 via Josh Logistics",
        contact_email: "hello@naffyscents.com",
        business_hours: "",
        bank_name: "",
        account_name: "",
        account_number: "",
        payment_instructions: "",
        hero_headline: "SCENT THAT SPEAKS BEFORE YOU DO.",
        hero_subtext: "Discover fragrances crafted to leave a lasting impression.",
        promo_text: "YOUR SIGNATURE SCENT AWAITS.",
        newsletter_text: "Sign up for new fragrance drops, exclusive offers and curated scent stories.",
        brand_story_heading: "MORE THAN A FRAGRANCE. IT'S AN IDENTITY.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <StoreContext.Provider value={{ settings, loading, reload: loadSettings }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) return { settings: null, loading: true, reload: () => {} };
  return ctx;
}