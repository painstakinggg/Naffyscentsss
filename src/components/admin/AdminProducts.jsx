import React, { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { formatNaira } from "@/lib/images";
import { Plus, Pencil, Trash2, X, Upload, Star } from "lucide-react";

const EMPTY = {
  name: "", slug: "", short_description: "", description: "", price: 0, compare_at_price: 0,
  category: "For Her", gender: "Women", fragrance_family: "Floral",
  top_notes: "", heart_notes: "", base_notes: "", size_ml: 100,
  images: [], stock: 0, featured: false, bestseller: false, rating: 5, review_count: 0,
  occasions: [], intensity: "Moderate", moods: [], available: true,
  is_bundle: false, bundle_items: [],
};

const CATS = ["For Her", "For Him", "Unisex", "Signature"];
const FAMS = ["Fresh", "Sweet", "Woody", "Floral", "Oud", "Spicy", "Citrus", "Musky"];
const GENDERS = ["Women", "Men", "Unisex"];
const OCCASIONS = ["Romantic", "Bold", "Everyday", "Evening"];
const MOODS = ["Fresh", "Sweet", "Woody", "Floral", "Oud", "Spicy", "Citrus", "Musky", "Romantic", "Bold", "Everyday", "Evening"];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet("/admin/products");
      setProducts(data.products || []);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setEditing("new"); };
  const openEdit = (p) => { setForm({ ...EMPTY, ...p }); setEditing(p.id); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, price: Number(form.price), compare_at_price: Number(form.compare_at_price) || 0, stock: Number(form.stock) || 0, size_ml: Number(form.size_ml) || 100 };
      if (editing === "new") {
        await apiPost("/admin/products", data);
      } else {
        await apiPatch(`/admin/products/${editing}`, data);
      }
      setEditing(null);
      load();
    } catch (err) {
      alert("Could not save product: " + (err.message || "error"));
    }
    setSaving(false);
  };

  const remove = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await apiDelete(`/admin/products/${p.id}`);
    load();
  };

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", credentials: "include", body: form });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Upload failed");
      const { file_url } = result;
      setForm((f) => ({ ...f, images: [...f.images, file_url] }));
    } catch (e) {
      alert("Upload failed");
    }
    setUploading(false);
  };

  const toggleArr = (key, val) => {
    setForm((f) => {
      const arr = f[key] || [];
      return { ...f, [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] };
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-3xl text-cream">Products ({products.length})</h2>
        <button onClick={openNew} className="btn-gold px-5 py-3 flex items-center gap-2"><Plus size={16} /> Add Product</button>
      </div>

      {loading ? (
        <div className="text-cream/50 text-center py-12">Loading...</div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gold/15">
              <tr className="text-left text-[10px] tracking-luxe-sm text-gold uppercase">
                <th className="p-4">Product</th>
                <th className="p-4 hidden sm:table-cell">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4 hidden md:table-cell">Stock</th>
                <th className="p-4 hidden md:table-cell">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gold/5 hover:bg-gold/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-obsidian-soft overflow-hidden shrink-0">
                        {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="text-cream">{p.name}</p>
                        <div className="flex gap-1 mt-0.5">
                          {p.bestseller && <span className="text-[9px] text-gold">★ Bestseller</span>}
                          {p.featured && <span className="text-[9px] text-gold">◆ Featured</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-cream/60 hidden sm:table-cell">{p.category}</td>
                  <td className="p-4 text-cream">{formatNaira(p.price)}</td>
                  <td className="p-4 text-cream/60 hidden md:table-cell">{p.stock}</td>
                  <td className="p-4 hidden md:table-cell">
                    <span className={p.available ? "text-sage text-xs" : "text-garnet text-xs"}>{p.available ? "In Stock" : "Sold Out"}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="text-cream/60 hover:text-gold p-1"><Pencil size={15} /></button>
                      <button onClick={() => remove(p)} className="text-cream/60 hover:text-garnet p-1"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <form onSubmit={save} className="relative bg-obsidian-soft border border-gold/20 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-2xl text-cream">{editing === "new" ? "Add Product" : "Edit Product"}</h3>
              <button type="button" onClick={() => setEditing(null)} className="text-cream/60 hover:text-gold"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required className="sm:col-span-2" />
              <Input label="Short Description" value={form.short_description} onChange={(v) => setForm({ ...form, short_description: v })} className="sm:col-span-2" />
              <TextArea label="Full Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} className="sm:col-span-2" />
              <Input label="Price (₦)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} required />
              <Input label="Compare At Price (₦)" type="number" value={form.compare_at_price} onChange={(v) => setForm({ ...form, compare_at_price: v })} />
              <Select label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={CATS} />
              <Select label="Gender" value={form.gender} onChange={(v) => setForm({ ...form, gender: v })} options={GENDERS} />
              <Select label="Fragrance Family" value={form.fragrance_family} onChange={(v) => setForm({ ...form, fragrance_family: v })} options={FAMS} />
              <Select label="Intensity" value={form.intensity} onChange={(v) => setForm({ ...form, intensity: v })} options={["Light", "Moderate", "Intense"]} />
              <Input label="Top Notes" value={form.top_notes} onChange={(v) => setForm({ ...form, top_notes: v })} />
              <Input label="Heart Notes" value={form.heart_notes} onChange={(v) => setForm({ ...form, heart_notes: v })} />
              <Input label="Base Notes" value={form.base_notes} onChange={(v) => setForm({ ...form, base_notes: v })} className="sm:col-span-2" />
              <Input label="Size (ml)" type="number" value={form.size_ml} onChange={(v) => setForm({ ...form, size_ml: v })} />
              <Input label="Stock" type="number" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} />
              <Input label="Rating" type="number" value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
              <Input label="Review Count" type="number" value={form.review_count} onChange={(v) => setForm({ ...form, review_count: v })} />
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-4 mt-4">
              {[["featured", "Featured"], ["bestseller", "Bestseller"], ["available", "Available"]].map(([k, l]) => (
                <label key={k} className="flex items-center gap-2 text-sm text-cream/70 cursor-pointer">
                  <input type="checkbox" checked={!!form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} className="accent-[#A84A4A] w-4 h-4" />
                  {l}
                </label>
              ))}
            </div>

            {/* Bundle builder */}
            <div className="mt-4 p-4 border border-gold/20 rounded-lg">
              <label className="flex items-center gap-2 text-sm text-cream/70 cursor-pointer mb-3">
                <input type="checkbox" checked={!!form.is_bundle} onChange={(e) => setForm({ ...form, is_bundle: e.target.checked, bundle_items: e.target.checked ? (form.bundle_items || []) : [] })} className="accent-[#A84A4A] w-4 h-4" />
                This is a bundle / combo product
              </label>
              {form.is_bundle && (
                <div>
                  <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-2">Bundle Contents</p>
                  {(form.bundle_items || []).length > 0 && (
                    <div className="space-y-2 mb-3">
                      {(form.bundle_items || []).map((bi) => (
                        <div key={bi.product_id} className="flex items-center gap-3 bg-obsidian p-2 rounded">
                          <div className="w-10 h-12 bg-obsidian-soft overflow-hidden shrink-0">
                            {bi.image && <img src={bi.image} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <span className="flex-1 text-cream text-sm">{bi.name}</span>
                          <input type="number" min="1" value={bi.quantity} onChange={(e) => setForm({ ...form, bundle_items: form.bundle_items.map((x) => x.product_id === bi.product_id ? { ...x, quantity: Number(e.target.value) || 1 } : x) })} className="w-16 bg-transparent border border-gold/25 px-2 py-1 text-cream text-sm outline-none focus:border-gold" />
                          <button type="button" onClick={() => setForm({ ...form, bundle_items: form.bundle_items.filter((x) => x.product_id !== bi.product_id) })} className="text-cream/50 hover:text-garnet"><X size={15} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-cream/40 mb-2">Add products to the bundle:</p>
                  <div className="max-h-40 overflow-y-auto space-y-1 border border-gold/10 rounded p-2">
                    {products.filter((p) => p.id !== editing && !p.is_bundle && !(form.bundle_items || []).some((bi) => bi.product_id === p.id)).map((p) => (
                      <button type="button" key={p.id} onClick={() => setForm({ ...form, bundle_items: [...(form.bundle_items || []), { product_id: p.id, name: p.name, quantity: 1, image: p.images?.[0] || "", price: p.price }] })}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gold/10 rounded text-left">
                        <div className="w-8 h-10 bg-obsidian-soft overflow-hidden shrink-0">
                          {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <span className="flex-1 text-cream/70 text-sm">{p.name}</span>
                        <span className="text-gold text-xs">{formatNaira(p.price)}</span>
                        <Plus size={14} className="text-gold" />
                      </button>
                    ))}
                    {products.length === 0 && <p className="text-cream/40 text-xs p-2">No products available.</p>}
                  </div>
                  {(form.bundle_items || []).length > 0 && (
                    <p className="text-xs text-cream/50 mt-3">Component value: <span className="text-gold">{formatNaira((form.bundle_items || []).reduce((s, bi) => s + (bi.price || 0) * bi.quantity, 0))}</span> — set your bundle price above.</p>
                  )}
                </div>
              )}
            </div>

            {/* Occasions & Moods */}
            <div className="mt-4">
              <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-2">Occasions</p>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((o) => (
                  <button type="button" key={o} onClick={() => toggleArr("occasions", o)}
                    className={`px-3 py-1.5 text-xs border ${(form.occasions || []).includes(o) ? "border-gold text-gold bg-gold/10" : "border-gold/20 text-cream/50"}`}>{o}</button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-2">Moods</p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((o) => (
                  <button type="button" key={o} onClick={() => toggleArr("moods", o)}
                    className={`px-3 py-1.5 text-xs border ${(form.moods || []).includes(o) ? "border-gold text-gold bg-gold/10" : "border-gold/20 text-cream/50"}`}>{o}</button>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="mt-5">
              <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-2">Product Images</p>
              <div className="flex flex-wrap gap-3">
                {(form.images || []).map((img, i) => (
                  <div key={i} className="relative w-20 h-24 group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })}
                      className="absolute top-1 right-1 w-6 h-6 bg-obsidian/80 rounded-full text-garnet flex items-center justify-center opacity-0 group-hover:opacity-100"><X size={12} /></button>
                  </div>
                ))}
                <label className="w-20 h-24 border border-dashed border-gold/30 flex items-center justify-center cursor-pointer hover:border-gold text-cream/40 hover:text-gold">
                  {uploading ? <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /> : <Upload size={18} />}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadImage(e.target.files[0])} />
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button type="submit" disabled={saving} className="btn-gold flex-1 py-3 disabled:opacity-50">{saving ? "Saving..." : "Save Product"}</button>
              <button type="button" onClick={() => setEditing(null)} className="btn-outline-gold px-6 py-3">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required, className = "" }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-[10px] tracking-luxe-sm text-gold uppercase">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full bg-transparent border border-gold/25 px-3 py-2.5 text-cream text-sm outline-none focus:border-gold" />
    </div>
  );
}
function TextArea({ label, value, onChange, className = "" }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-[10px] tracking-luxe-sm text-gold uppercase">{label}</label>
      <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border border-gold/25 px-3 py-2.5 text-cream text-sm outline-none focus:border-gold resize-none" />
    </div>
  );
}
function Select({ label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] tracking-luxe-sm text-gold uppercase">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-obsidian border border-gold/25 px-3 py-2.5 text-cream text-sm outline-none focus:border-gold cursor-pointer">
        {options.map((o) => <option key={o} value={o} className="bg-obsidian">{o}</option>)}
      </select>
    </div>
  );
}