const DEFAULT_SETTINGS = {
  whatsapp_number: "2348103173658",
  instagram_handle: "naffys_scents",
  snapchat_handle: "naffyscents",
  tiktok_handle: "naffyscents1",
  facebook_handle: "",
  contact_email: "hello@naffyscents.com",
  store_address: "Pahayi Road, beside Yewa Health Center, Ilaro, Ogun State, Nigeria",
  maps_url: "https://maps.app.goo.gl/fEqwmUSUUBf7bAPW8",
  business_hours: "",
  pickup_hours: "12:00 PM – 5:00 PM",
  logistics_provider: "Josh Logistics",
  delivery_fee_ilaro_min: 1000,
  delivery_fee_ilaro_max: 2000,
  delivery_fee_lagos: 2500,
  delivery_fee_nationwide: 4500,
  delivery_info_note: "Delivery within Ilaro: ₦1,000 – ₦2,000 via Josh Logistics",
  bank_name: "",
  account_name: "",
  account_number: "",
  payment_instructions: "",
  hero_headline: "SCENT THAT SPEAKS BEFORE YOU DO.",
  hero_subtext: "Discover fragrances crafted to leave a lasting impression.",
  promo_text: "YOUR SIGNATURE SCENT AWAITS.",
  newsletter_text: "Sign up for new fragrance drops, exclusive offers and curated scent stories.",
  brand_story_heading: "CAPTIVATING SCENTS, UNFORGETTABLE MOMENTS",
};

export async function onRequestGet({ env }) {
  if (!env.DB) {
    return new Response(JSON.stringify({ settings: DEFAULT_SETTINGS }), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  try {
    const row = await env.DB.prepare(
      "SELECT * FROM store_settings ORDER BY updated_at DESC LIMIT 1"
    ).first();

    return new Response(JSON.stringify({
      settings: { ...DEFAULT_SETTINGS, ...(row || {}) },
    }), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=60, s-maxage=60",
      },
    });
  } catch {
    return new Response(JSON.stringify({ settings: DEFAULT_SETTINGS }), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
}

import { requireAdmin, json } from "./_auth.js";
const EDITABLE_SETTINGS = ["whatsapp_number","contact_email","instagram_handle","snapchat_handle","tiktok_handle","facebook_handle","store_address","maps_url","business_hours","pickup_hours","logistics_provider","delivery_fee_ilaro_min","delivery_fee_ilaro_max","delivery_info_note","delivery_fee_lagos","delivery_fee_nationwide","bank_name","account_name","account_number","payment_instructions","hero_headline","hero_subtext","promo_text","newsletter_text","brand_story_heading"];
export async function onRequestPut({request,env}) {
 const gate=await requireAdmin(request,env.DB); if(gate.response)return gate.response;
 let body; try{body=await request.json()}catch{return json({error:"Invalid request"},400)}
 const updates=EDITABLE_SETTINGS.filter(k=>Object.hasOwn(body,k));
 if(!updates.length)return json({error:"No settings supplied"},400);
 const current=await env.DB.prepare("SELECT id FROM store_settings ORDER BY updated_at DESC LIMIT 1").first();
 const values=updates.map(k=>body[k]===null?"":body[k]);
 if(current) await env.DB.prepare(`UPDATE store_settings SET ${updates.map(k=>k+"=?").join(",")},updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(...values,current.id).run();
 else {
  const id=crypto.randomUUID(), cols=["id",...updates];
  await env.DB.prepare(`INSERT INTO store_settings(${cols.join(",")}) VALUES(${cols.map(()=>"?").join(",")})`).bind(id,...values).run();
 }
 const row=await env.DB.prepare("SELECT * FROM store_settings ORDER BY updated_at DESC LIMIT 1").first();
 return json({settings:{...DEFAULT_SETTINGS,...row}});
}
