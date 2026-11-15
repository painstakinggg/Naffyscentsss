import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminReviews from "@/components/admin/AdminReviews";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import { Package, ShoppingBag, Star, Settings, BarChart3, LayoutDashboard, ArrowLeft, Menu, X } from "lucide-react";


const TABS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, component: AdminAnalytics },
  { key: "products", label: "Products", icon: Package, component: AdminProducts },
  { key: "orders", label: "Orders", icon: ShoppingBag, component: AdminOrders },
  { key: "reviews", label: "Reviews", icon: Star, component: AdminReviews },
  { key: "settings", label: "Settings", icon: Settings, component: AdminSettings },
];

export default function Admin() {
  const [tab, setTab] = useState("dashboard");
  const { user, isLoadingAuth } = useAuth();
  const authed = !isLoadingAuth && user?.role === "admin";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();



  if (isLoadingAuth) {
    return <div className="pt-32 min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;
  }

  if (authed === false) {
    return (
      <div className="pt-32 min-h-screen flex flex-col items-center justify-center text-center px-5">
        <h1 className="font-heading text-3xl text-cream mb-3">Admin Access Required</h1>
        <p className="text-sm text-cream/50 mb-6">You need administrator privileges to access this area.</p>
        <Link to="/" className="btn-outline-gold px-8 py-3">Back to Store</Link>
      </div>
    );
  }

  const Active = TABS.find((t) => t.key === tab)?.component || AdminAnalytics;

  return (
    <div className="pt-20 min-h-screen flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-20 left-0 bottom-0 z-40 w-64 bg-obsidian-soft border-r border-gold/15 h-[calc(100vh-5rem)] overflow-y-auto transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-5">
          <p className="font-display text-lg tracking-luxe-sm text-cream mb-1">NAFFY <span className="text-gold">ADMIN</span></p>
          <p className="text-[10px] tracking-luxe-sm text-cream/40 uppercase mb-6">Control Center</p>
          <nav className="space-y-1">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => { setTab(t.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${tab === t.key ? "bg-gold/10 text-gold border-l-2 border-gold" : "text-cream/60 hover:text-cream hover:bg-gold/5"}`}>
                <t.icon size={17} strokeWidth={1.5} /> {t.label}
              </button>
            ))}
          </nav>
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm text-cream/50 hover:text-gold mt-6 transition-colors">
            <ArrowLeft size={16} /> Back to Store
          </Link>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-obsidian/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Content */}
      <div className="flex-1 p-5 sm:p-8 min-w-0">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden mb-4 text-cream/70 flex items-center gap-2"><Menu size={20} /> Menu</button>
        <Active />
      </div>
    </div>
  );
}