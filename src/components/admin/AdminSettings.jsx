import React, { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { useStore } from "@/lib/store-context";
import { Save, Plus, Trash2 } from "lucide-react";

export default function AdminSettings() {
  const { settings, reload } = useStore();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [newPromo, setNewPromo] = useState({ title: "", code: "", discount_type: "percentage", discount_value: 10, active: true });

  useEffect(() => {
    if (settings) setForm({ ...settings });
  }, [settings]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet("/admin/promotions");
        setPromotions(data.promotions || []);
      } catch (e) {}
    })();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/store-settings", { method: "PUT", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      if (!response.ok) throw new Error("Could not save settings");
      reload();
      alert("Settings saved");
    } catch (err) {
      alert("Could not save settings");
    }
    setSaving(false);
  };

  const addPromo = async (e) => {
    e.preventDefault();
    try {
      await apiPost("/admin/promotions", newPromo);
      setNewPromo({ title: "", code: "", discount_type: "percentage", discount_value: 10, active: true });
      const data = await apiGet("/admin/promotions");
      setPromotions(data.promotions || []);
    } catch (err) {
      alert("Could not create promotion");
    }
  };

  const togglePromo = async (p) => {
    await apiPatch(`/admin/promotions/${p.id}`, { active: !p.active });
    const data = await apiGet("/admin/promotions");
    setPromotions(data.promotions || []);
  };

  const removePromo = async (p) => {
    if (!confirm("Delete this promotion?")) return;
    await apiDelete(`/admin/promotions/${p.id}`);
    const data = await apiGet("/admin/promotions");
    setPromotions(data.promotions || []);
  };

  if (!form) return <div className="text-cream/50 text-center py-12">Loading settings...</div>;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-heading text-3xl text-cream mb-6">Store Settings</h2>
        <form onSubmit={save} className="glass rounded-xl p-6 space-y-5 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <p className="sm:col-span-2 text-[10px] tracking-luxe-sm text-gold uppercase pt-2">Contact & Social</p>
            <Field label="WhatsApp Number" value={form.whatsapp_number} onChange={(v) => setForm({ ...form, whatsapp_number: v })} />
            <Field label="Contact Email" value={form.contact_email} onChange={(v) => setForm({ ...form, contact_email: v })} />
            <Field label="Instagram Handle" value={form.instagram_handle} onChange={(v) => setForm({ ...form, instagram_handle: v })} />
            <Field label="TikTok Handle" value={form.tiktok_handle} onChange={(v) => setForm({ ...form, tiktok_handle: v })} />
            <Field label="Snapchat Handle" value={form.snapchat_handle} onChange={(v) => setForm({ ...form, snapchat_handle: v })} />
            <Field label="Facebook Handle" value={form.facebook_handle} onChange={(v) => setForm({ ...form, facebook_handle: v })} />

            <p className="sm:col-span-2 text-[10px] tracking-luxe-sm text-gold uppercase pt-4">Location & Hours</p>
            <Field label="Store Address" value={form.store_address} onChange={(v) => setForm({ ...form, store_address: v })} className="sm:col-span-2" />
            <Field label="Google Maps URL" value={form.maps_url} onChange={(v) => setForm({ ...form, maps_url: v })} className="sm:col-span-2" />
            <Field label="Business Hours (physical store)" value={form.business_hours} onChange={(v) => setForm({ ...form, business_hours: v })} className="sm:col-span-2" />
            <Field label="Pickup Hours (online orders)" value={form.pickup_hours} onChange={(v) => setForm({ ...form, pickup_hours: v })} className="sm:col-span-2" />

            <p className="sm:col-span-2 text-[10px] tracking-luxe-sm text-gold uppercase pt-4">Delivery (Ilaro)</p>
            <Field label="Logistics Provider" value={form.logistics_provider} onChange={(v) => setForm({ ...form, logistics_provider: v })} className="sm:col-span-2" />
            <Field label="Ilaro Delivery Fee Min (₦)" type="number" value={form.delivery_fee_ilaro_min} onChange={(v) => setForm({ ...form, delivery_fee_ilaro_min: Number(v) })} />
            <Field label="Ilaro Delivery Fee Max (₦)" type="number" value={form.delivery_fee_ilaro_max} onChange={(v) => setForm({ ...form, delivery_fee_ilaro_max: Number(v) })} />
            <Field label="Delivery Info Note" value={form.delivery_info_note} onChange={(v) => setForm({ ...form, delivery_info_note: v })} className="sm:col-span-2" />

            <p className="sm:col-span-2 text-[10px] tracking-luxe-sm text-gold uppercase pt-4">Payment (Bank Transfer)</p>
            <Field label="Bank Name" value={form.bank_name} onChange={(v) => setForm({ ...form, bank_name: v })} />
            <Field label="Account Name" value={form.account_name} onChange={(v) => setForm({ ...form, account_name: v })} />
            <Field label="Account Number" value={form.account_number} onChange={(v) => setForm({ ...form, account_number: v })} />
            <Field label="Payment Instructions" value={form.payment_instructions} onChange={(v) => setForm({ ...form, payment_instructions: v })} className="sm:col-span-2" />

            <p className="sm:col-span-2 text-[10px] tracking-luxe-sm text-gold uppercase pt-4">Homepage Content</p>
            <Field label="Hero Headline" value={form.hero_headline} onChange={(v) => setForm({ ...form, hero_headline: v })} className="sm:col-span-2" />
            <Field label="Hero Subtext" value={form.hero_subtext} onChange={(v) => setForm({ ...form, hero_subtext: v })} className="sm:col-span-2" />
            <Field label="Promo Banner Text" value={form.promo_text} onChange={(v) => setForm({ ...form, promo_text: v })} className="sm:col-span-2" />
            <Field label="Newsletter Text" value={form.newsletter_text} onChange={(v) => setForm({ ...form, newsletter_text: v })} className="sm:col-span-2" />
            <Field label="Brand Story Heading" value={form.brand_story_heading} onChange={(v) => setForm({ ...form, brand_story_heading: v })} className="sm:col-span-2" />
          </div>
          <button type="submit" disabled={saving} className="btn-gold px-8 py-3 flex items-center gap-2 disabled:opacity-50">
            <Save size={15} /> {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-heading text-3xl text-cream mb-6">Promotions & Coupons</h2>
        <form onSubmit={addPromo} className="glass rounded-xl p-6 mb-5 max-w-2xl">
          <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-3">New Coupon</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Title" value={newPromo.title} onChange={(v) => setNewPromo({ ...newPromo, title: v })} required />
            <Field label="Code" value={newPromo.code} onChange={(v) => setNewPromo({ ...newPromo, code: v })} required />
            <div className="space-y-1.5">
              <label className="text-[10px] tracking-luxe-sm text-gold uppercase">Discount Type</label>
              <select value={newPromo.discount_type} onChange={(e) => setNewPromo({ ...newPromo, discount_type: e.target.value })}
                className="w-full bg-obsidian border border-gold/25 px-3 py-2.5 text-cream text-sm outline-none cursor-pointer">
                <option value="percentage" className="bg-obsidian">Percentage</option>
                <option value="fixed" className="bg-obsidian">Fixed Amount</option>
              </select>
            </div>
            <Field label="Discount Value" type="number" value={newPromo.discount_value} onChange={(v) => setNewPromo({ ...newPromo, discount_value: Number(v) })} />
          </div>
          <button type="submit" className="btn-outline-gold px-6 py-2.5 mt-4 flex items-center gap-2"><Plus size={14} /> Create Coupon</button>
        </form>

        <div className="space-y-2 max-w-2xl">
          {promotions.map((p) => (
            <div key={p.id} className="glass rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-cream">{p.title} · <span className="text-gold">{p.code}</span></p>
                <p className="text-xs text-cream/50">{p.discount_type === "percentage" ? `${p.discount_value}% off` : `₦${p.discount_value} off`} · {p.active ? "Active" : "Inactive"}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => togglePromo(p)} className={`text-xs px-3 py-1.5 border ${p.active ? "border-sage text-sage" : "border-cream/30 text-cream/50"}`}>{p.active ? "Active" : "Inactive"}</button>
                <button onClick={() => removePromo(p)} className="text-cream/40 hover:text-garnet p-1.5"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
          {promotions.length === 0 && <p className="text-cream/40 text-sm">No promotions yet.</p>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false, className = "" }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-[10px] tracking-luxe-sm text-gold uppercase">{label}</label>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full bg-transparent border border-gold/25 px-3 py-2.5 text-cream text-sm outline-none focus:border-gold" />
    </div>
  );
}