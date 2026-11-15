import React, { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { formatNaira } from "@/lib/images";
import { TrendingUp, ShoppingBag, Users, Package } from "lucide-react";

export default function AdminAnalytics() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [o, p] = await Promise.all([apiGet("/admin/orders"), apiGet("/admin/products")]);
        setOrders(o.orders || []);
        setProducts(p.products || []);
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-cream/50 text-center py-12">Loading analytics...</div>;

  const paidOrders = orders.filter((o) => o.payment_status === "Paid");
  const totalRevenue = paidOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const totalOrders = orders.length;
  const customers = new Set(orders.map((o) => o.phone)).size;
  const avgOrder = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  // Count completed sales only after payment has been verified.
  const sales = {};
  paidOrders.forEach((o) => {
    (o.items || []).forEach((it) => {
      sales[it.name] = (sales[it.name] || 0) + (it.quantity || 0);
    });
  });
  const bestSellers = Object.entries(sales).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const stats = [
    { icon: TrendingUp, label: "Verified Revenue", value: formatNaira(totalRevenue) },
    { icon: ShoppingBag, label: "Total Orders", value: totalOrders },
    { icon: Users, label: "Customers", value: customers },
    { icon: Package, label: "Avg Paid Order", value: formatNaira(avgOrder) },
  ];

  return (
    <div>
      <h2 className="font-heading text-3xl text-cream mb-6">Analytics</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-xl p-6">
            <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center mb-4">
              <s.icon size={18} className="text-gold" strokeWidth={1.5} />
            </div>
            <p className="text-2xl text-cream font-heading">{s.value}</p>
            <p className="text-[10px] tracking-luxe-sm text-cream/40 uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="font-heading text-xl text-cream mb-5">Best Selling Products</h3>
          {bestSellers.length === 0 ? (
            <p className="text-cream/40 text-sm">No sales data yet.</p>
          ) : (
            <div className="space-y-3">
              {bestSellers.map(([name, qty], i) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-cream/70 text-sm"><span className="text-gold mr-2">{i + 1}.</span>{name}</span>
                  <span className="text-cream/50 text-sm">{qty} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="font-heading text-xl text-cream mb-5">Recent Orders</h3>
          {orders.length === 0 ? (
            <p className="text-cream/40 text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-cream/70 text-sm">{o.customer_name}</p>
                    <p className="text-cream/40 text-xs">{o.id.slice(-8).toUpperCase()} · {o.status}</p>
                  </div>
                  <span className="text-gold text-sm">{formatNaira(o.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-xl p-6 mt-6">
        <h3 className="font-heading text-xl text-cream mb-5">Inventory Overview</h3>
        <div className="space-y-2">
          {products.slice(0, 8).map((p) => (
            <div key={p.id} className="flex items-center justify-between text-sm">
              <span className="text-cream/70">{p.name}</span>
              <span className={p.stock > 5 ? "text-sage" : "text-garnet"}>{p.stock} in stock</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}