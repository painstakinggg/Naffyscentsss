import React, { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/api";
import { formatNaira } from "@/lib/images";
import { X, Eye } from "lucide-react";

const STATUSES = [
  "Awaiting Payment Confirmation",
  "Confirmed",
  "Picked Up",
  "Delivered",
  "Canceled",
];

function productSummary(items) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return "—";
  const first = list[0].name || "Item";
  if (list.length > 1) return `${first} + ${list.length - 1} more`;
  return first;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet("/admin/orders");
      setOrders(data.orders || []);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await apiPatch(`/admin/orders/${id}`, { status });
    setView((v) => (v && v.id === id ? { ...v, status } : v));
    load();
  };

  const updatePaymentStatus = async (id, payment_status) => {
    await apiPatch(`/admin/orders/${id}`, { payment_status });
    setView((v) => (v && v.id === id ? { ...v, payment_status } : v));
    load();
  };

  return (
    <div>
      <h2 className="font-heading text-3xl text-cream mb-6">Orders ({orders.length})</h2>

      {loading ? (
        <div className="text-cream/50 text-center py-12">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-heading text-2xl text-cream/50 mb-2">No orders yet</p>
          <p className="text-sm text-cream/40">Orders will appear here when customers check out.</p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="border-b border-gold/15">
                <tr className="text-left text-[10px] tracking-luxe-sm text-gold uppercase">
                  <th className="p-4">Order Number</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">View</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-gold/5 hover:bg-gold/5">
                    <td className="p-4 text-gold text-xs whitespace-nowrap">{o.id.slice(-8).toUpperCase()}</td>
                    <td className="p-4 text-cream whitespace-nowrap">{o.customer_name}</td>
                    <td className="p-4 text-cream/70">{productSummary(o.items)}</td>
                    <td className="p-4 text-cream whitespace-nowrap">{formatNaira(o.total)}</td>
                    <td className="p-4">
                      <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="bg-obsidian border border-gold/25 text-cream text-xs px-2 py-1.5 outline-none cursor-pointer max-w-[180px]">
                        {STATUSES.map((s) => <option key={s} value={s} className="bg-obsidian">{s}</option>)}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => setView(o)} className="text-cream/60 hover:text-gold p-1"><Eye size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm" onClick={() => setView(null)} />
          <div className="relative bg-obsidian-soft border border-gold/20 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-2xl text-cream">Order {view.id.slice(-8).toUpperCase()}</h3>
              <button onClick={() => setView(null)} className="text-cream/60 hover:text-gold"><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <Row label="Customer" value={view.customer_name} />
              <Row label="Phone" value={view.phone} />
              {view.customer_email && <Row label="Email" value={view.customer_email} />}
              <Row label="Fulfilment" value={view.fulfilment_method} />
              {view.fulfilment_method !== "Pickup" && (
                <Row label="Delivery Address" value={`${view.address || ""}${view.city ? ", " + view.city : ""}${view.state ? ", " + view.state : ""}`} />
              )}
              {view.fulfilment_method === "Pickup" && (
                <Row label="Collection" value="Store Pickup (₦0 delivery)" />
              )}
              <div className="luxury-line my-3" />
              <p className="text-[10px] tracking-luxe-sm text-gold uppercase">Items</p>
              {(view.items || []).map((it, i) => (
                <div key={i} className="flex justify-between text-cream/70">
                  <span>{it.name}{it.size_ml ? ` (${it.size_ml}ml)` : ""} × {it.quantity}</span>
                  <span>{formatNaira((it.price || 0) * (it.quantity || 1))}</span>
                </div>
              ))}
              <div className="luxury-line my-3" />
              <Row label="Subtotal" value={formatNaira(view.subtotal)} />
              <Row label="Delivery Fee" value={formatNaira(view.delivery_fee)} />
              {view.discount > 0 && <Row label="Discount" value={`-${formatNaira(view.discount)}`} />}
              <div className="flex justify-between pt-2">
                <span className="text-cream font-medium">Total</span>
                <span className="text-gold text-lg">{formatNaira(view.total)}</span>
              </div>
              <div className="luxury-line my-3" />
              <Row label="Payment Status" value={view.payment_status} />
              <Row label="Payment Confirmation" value={view.payment_confirmation_submitted ? `Submitted — ${view.payment_confirmation_date || ""}` : "Not submitted"} />
              <div className="space-y-2">
                <label className="text-[10px] tracking-luxe-sm text-gold uppercase">Record Payment Verification</label>
                <select value={view.payment_status} onChange={(e) => updatePaymentStatus(view.id, e.target.value)}
                  className="w-full bg-obsidian border border-gold/25 text-cream text-sm px-3 py-2.5 outline-none cursor-pointer">
                  {["Unpaid", "Pending", "Paid"].map((s) => <option key={s} value={s} className="bg-obsidian">{s}</option>)}
                </select>
              </div>
              {view.coupon_code && <Row label="Coupon" value={view.coupon_code} />}
              <div className="luxury-line my-3" />
              <div className="space-y-2">
                <label className="text-[10px] tracking-luxe-sm text-gold uppercase">Update Status</label>
                <select value={view.status} onChange={(e) => updateStatus(view.id, e.target.value)}
                  className="w-full bg-obsidian border border-gold/25 text-cream text-sm px-3 py-2.5 outline-none cursor-pointer">
                  {STATUSES.map((s) => <option key={s} value={s} className="bg-obsidian">{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-cream/50 whitespace-nowrap">{label}</span>
      <span className="text-cream/80 text-right break-words">{value || "—"}</span>
    </div>
  );
}