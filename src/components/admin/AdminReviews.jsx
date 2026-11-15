import React, { useEffect, useState } from "react";
import { apiGet, apiPatch, apiDelete } from "@/lib/api";
import { Check, X, Star, Trash2 } from "lucide-react";
import moment from "moment";

const TABS = [
  ["pending", "Pending"],
  ["approved", "Approved"],
  ["rejected", "Rejected"],
  ["all", "All"],
];

const statusOf = (r) => r.status || (r.approved ? "Approved" : "Pending");

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet("/admin/reviews");
      setReviews(data.reviews || []);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const approve = async (r) => {
    await apiPatch(`/admin/reviews/${r.id}`, { status: "Approved" });
    load();
  };

  const reject = async (r) => {
    await apiPatch(`/admin/reviews/${r.id}`, { status: "Rejected" });
    load();
  };

  const toggleFeatured = async (r) => {
    await apiPatch(`/admin/reviews/${r.id}`, { featured: !r.featured });
    load();
  };

  const remove = async (r) => {
    if (!confirm("Delete this review?")) return;
    await apiDelete(`/admin/reviews/${r.id}`);
    load();
  };

  const counts = {
    pending: reviews.filter((r) => statusOf(r) === "Pending").length,
    approved: reviews.filter((r) => statusOf(r) === "Approved").length,
    rejected: reviews.filter((r) => statusOf(r) === "Rejected").length,
    all: reviews.length,
  };

  const filtered = tab === "all" ? reviews : reviews.filter((r) => statusOf(r) === TABS.find(([k]) => k === tab)[1]);

  return (
    <div>
      <h2 className="font-heading text-3xl text-cream mb-6">Reviews</h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-2 text-sm border transition-colors ${tab === k ? "border-gold text-gold bg-gold/10" : "border-gold/20 text-cream/50"}`}>
            {l} ({counts[k]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-cream/50 text-center py-12">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16"><p className="text-cream/40">No reviews in this category.</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const status = statusOf(r);
            return (
              <div key={r.id} className="glass rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-cream font-medium">{r.customer_name}</span>
                      <span className={`text-[9px] tracking-luxe-sm uppercase px-2 py-0.5 border rounded-full ${
                        status === "Approved" ? "text-sage border-sage/40" : status === "Rejected" ? "text-garnet border-garnet/40" : "text-gold border-gold/40"
                      }`}>{status}</span>
                      {r.verified && <span className="text-[9px] text-sage tracking-luxe-sm uppercase">Verified</span>}
                      {r.featured && <span className="text-[9px] text-gold tracking-luxe-sm uppercase">Featured</span>}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={12} className={i <= r.rating ? "fill-gold text-gold" : "text-cream/20"} />)}
                      </div>
                      <span className="text-xs text-cream/40">{moment(r.created_at).format("DD MMM YYYY")}</span>
                    </div>
                    <p className="text-sm text-cream/60">{r.review}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-cream/40">
                      {r.order_number && <span>Order: <span className="text-cream/60">{r.order_number}</span></span>}
                      {r.email && <span>{r.email}</span>}
                      {r.product_name && <span>Product: <span className="text-cream/60">{r.product_name}</span></span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {status !== "Approved" && (
                      <button onClick={() => approve(r)} className="text-sage hover:bg-sage/10 px-2 py-1.5 rounded flex items-center gap-1 text-xs"><Check size={14} /> Approve</button>
                    )}
                    {status !== "Rejected" && (
                      <button onClick={() => reject(r)} className="text-cream/60 hover:text-garnet hover:bg-garnet/10 px-2 py-1.5 rounded flex items-center gap-1 text-xs"><X size={14} /> Reject</button>
                    )}
                    {status === "Approved" && (
                      <button onClick={() => toggleFeatured(r)} className={`px-2 py-1.5 rounded text-xs text-left ${r.featured ? "text-gold" : "text-cream/50 hover:text-gold"}`}>
                        {r.featured ? "★ Unfeature" : "☆ Feature"}
                      </button>
                    )}
                    <button onClick={() => remove(r)} className="text-cream/40 hover:text-garnet px-2 py-1.5 rounded flex items-center gap-1 text-xs"><Trash2 size={14} /> Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}