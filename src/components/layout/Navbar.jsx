import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/AuthContext";
import { Image } from "@/components/ui/image";
import { isAppAdmin } from "@/lib/admin-access";
import { formatNaira } from "@/lib/images";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
  { label: "Collections", path: "/collections" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const LOGO_URL = "/favicon.svg";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const { items, itemCount, subtotal, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const isAdmin = isAppAdmin(user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const syncScrollState = () => setScrolled(window.scrollY > 30);

    // Read the current position on mount and route changes, not only on
    // the next user-generated scroll event.
    syncScrollState();
    const frame = window.requestAnimationFrame(syncScrollState);
    window.addEventListener("scroll", syncScrollState, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", syncScrollState);
    };
  }, [location.pathname, location.hash]);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setCartOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Inner pages do not have the dark hero that sits behind the transparent
  // homepage header, so keep their navigation legible on the burgundy surface.
  const headerSolid = scrolled || location.pathname !== "/";

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header
        className={`site-header ${headerSolid ? "is-scrolled" : ""} fixed z-50 transition-all duration-500 ${
          headerSolid
            ? "top-3 left-4 right-4 h-20 rounded-[40px] shadow-lg shadow-black/15 glass-strong py-0"
            : "top-0 left-0 right-0 bg-transparent py-5"
        }`}
      >
        <div className={`max-w-[1400px] mx-auto px-5 sm:px-8 flex items-center justify-between ${headerSolid ? "h-full" : ""}`}>
          {/* Mobile menu button */}
          <button
            className="lg:hidden text-cream p-1 -ml-1"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          {/* Logo + brand lockup */}
          <Link to="/" className="flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-2 sm:gap-3">
            <Image src={LOGO_URL} alt="Naffy Scents" fittingType="fit" className="h-9 sm:h-10 w-auto object-contain" />
            <span className="font-heading font-semibold tracking-luxe-sm text-cream text-lg sm:text-xl leading-none whitespace-nowrap">NAFFY SCENTS</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-[11px] tracking-luxe-sm uppercase text-cream/80 hover:text-gold transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-[11px] tracking-luxe-sm uppercase text-gold hover:text-gold-light transition-colors duration-300 relative group"
              >
                Admin
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
              </Link>
            )}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-4 sm:gap-5">
            <button
              onClick={() => setSearchOpen((s) => !s)}
              className="text-cream/80 hover:text-gold transition-colors"
              aria-label="Search"
            >
              <Search size={19} strokeWidth={1.5} />
            </button>
            <Link to="/account" className="hidden sm:block text-cream/80 hover:text-gold transition-colors" aria-label="Account">
              <User size={19} strokeWidth={1.5} />
            </Link>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCartOpen((open) => !open)}
                className="relative text-cream/80 hover:text-gold transition-colors"
                aria-label="Shopping bag"
                aria-expanded={cartOpen}
                aria-controls="mini-cart"
              >
                <ShoppingBag size={19} strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gold text-obsidian text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>


            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 glass-strong border-t border-gold/20 animate-fade-in">
            <form onSubmit={handleSearch} className="max-w-[1400px] mx-auto px-5 sm:px-8 py-5 flex items-center gap-3">
              <Search size={18} className="text-gold" strokeWidth={1.5} />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fragrances, notes, collections..."
                className="flex-1 bg-transparent text-cream placeholder:text-cream/40 outline-none text-sm tracking-wide"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="text-cream/60 hover:text-gold">
                <X size={18} />
              </button>
            </form>
          </div>
        )}
      </header>


      {/* Shopping bag drawer: kept outside the header so header theme rules cannot override it */}
      {cartOpen && (
                      <div className="fixed inset-0 z-[70]">
                        <button
                          type="button"
                          className="absolute inset-0 naffy-cart-backdrop backdrop-blur-sm"
                          onClick={() => setCartOpen(false)}
                          aria-label="Close shopping bag"
                        />
                        <aside
                          id="mini-cart"
                          role="dialog"
                          aria-modal="true"
                          aria-label="Your shopping bag"
                          className="absolute top-0 right-0 bottom-0 flex flex-col w-[88%] max-w-md bg-obsidian-soft border-l border-gold/20 shadow-2xl shadow-black/40 transition-transform duration-500 animate-fade-in"
                        >
                          <div className="flex items-center justify-between px-6 py-5 border-b border-gold/10">
                            <div>
                              <h2 className="font-heading text-xl text-cream">Your Shopping Bag</h2>
                              <p className="text-sm text-cream/65 mt-1">{itemCount} {itemCount === 1 ? "item" : "items"} in your bag</p>
                            </div>
                            <button type="button" onClick={() => setCartOpen(false)} className="text-cream/70 hover:text-gold p-2" aria-label="Close shopping bag">
                              <X size={22} strokeWidth={1.5} />
                            </button>
                          </div>
      
                          {items.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                              <ShoppingBag size={30} className="text-gold mb-4" strokeWidth={1.3} />
                              <p className="font-heading text-lg text-cream">Your bag is empty</p>
                              <p className="text-sm text-cream/65 mt-2">Discover a fragrance and add it to your bag.</p>
                              <Link to="/shop" onClick={() => setCartOpen(false)} className="mt-6 inline-flex items-center justify-center border border-gold/50 text-gold hover:bg-gold/10 px-6 py-3 text-xs font-semibold uppercase tracking-luxe-sm">Explore fragrances</Link>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1 overflow-y-auto px-6 py-5">
                                <div className="space-y-5">
                                  {items.map((item) => (
                                    <div key={`${item.id}-${item.size_ml}`} className="flex gap-4 pb-5 border-b border-gold/10">
                                      <Link to={`/product/${item.id}`} onClick={() => setCartOpen(false)} className="w-20 h-24 shrink-0 bg-obsidian overflow-hidden rounded-md">
                                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={18} className="text-gold/60" /></div>}
                                      </Link>
                                      <div className="min-w-0 flex-1">
                                        <Link to={`/product/${item.id}`} onClick={() => setCartOpen(false)} className="block font-heading text-base leading-snug text-cream hover:text-gold">{item.name}</Link>
                                        <p className="text-sm text-cream/65 mt-1">{item.is_bundle ? "Curated Bundle" : `${item.size_ml}ml`}</p>
                                        <p className="text-base font-semibold text-gold mt-2">{formatNaira(item.price)}</p>
                                        <div className="flex items-center justify-between gap-2 mt-3">
                                          <div className="flex items-center border border-gold/25 rounded">
                                            <button type="button" onClick={() => updateQuantity(item.id, item.size_ml, item.quantity - 1)} disabled={item.quantity <= 1} className="w-8 h-8 flex items-center justify-center text-cream/80 hover:text-gold disabled:opacity-30" aria-label={`Decrease quantity of ${item.name}`}><Minus size={12} /></button>
                                            <span className="w-8 text-center text-sm font-medium text-cream">{item.quantity}</span>
                                            <button type="button" onClick={() => updateQuantity(item.id, item.size_ml, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-cream/80 hover:text-gold" aria-label={`Increase quantity of ${item.name}`}><Plus size={12} /></button>
                                          </div>
                                          <button type="button" onClick={() => removeFromCart(item.id, item.size_ml)} className="text-cream/65 hover:text-garnet flex items-center gap-1.5 text-xs"><Trash2 size={13} /> Remove</button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="shrink-0 border-t border-gold/15 bg-obsidian/40 px-6 py-5">
                                <h3 className="font-heading text-base text-cream mb-4">Order Summary</h3>
                                <div className="flex items-center justify-between gap-4 text-sm">
                                  <span className="text-cream/75">Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                                  <span className="text-gold text-base font-semibold tabular-nums">{formatNaira(subtotal)}</span>
                                </div>
                                <p className="text-xs leading-relaxed text-cream/60 mt-2 mb-5">Delivery fees, if applicable, are calculated at checkout.</p>
                                <Link to="/cart" onClick={() => setCartOpen(false)} className="block w-full text-center border border-gold/50 text-gold hover:bg-gold/10 py-3.5 text-sm font-semibold uppercase tracking-luxe-sm transition-colors">View Shopping Bag</Link>
                                <Link to="/checkout" onClick={() => setCartOpen(false)} className="btn-gold block w-full text-center py-3.5 mt-3 text-sm font-semibold uppercase tracking-luxe-sm">Proceed to Checkout</Link>
                              </div>
                            </>
                          )}
                        </aside>
                      </div>
                    )}

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-obsidian/95 backdrop-blur-xl" onClick={() => setMobileOpen(false)} />
        <div className={`absolute top-0 left-0 bottom-0 w-[80%] max-w-sm bg-obsidian-soft border-r border-gold/20 transition-transform duration-500 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gold/10">
            <div className="flex items-center gap-2">
              <Image src={LOGO_URL} alt="Naffy Scents" fittingType="fit" className="h-9 w-auto object-contain" />
              <span className="font-heading font-semibold tracking-luxe-sm text-cream text-lg leading-none whitespace-nowrap">NAFFY SCENTS</span>
            </div>
            <button onClick={() => setMobileOpen(false)} className="text-cream/70">
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>
          <nav className="flex flex-col px-6 py-8 gap-1">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.path}
                to={link.path}
                className="font-heading text-2xl text-cream/90 hover:text-gold transition-colors py-3 border-b border-gold/5"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/account" className="font-heading text-2xl text-cream/90 hover:text-gold transition-colors py-3 border-b border-gold/5">
              Account
            </Link>
            <Link to="/admin" className="font-heading text-2xl text-gold hover:text-gold-light transition-colors py-3 border-b border-gold/5">
              Admin
            </Link>
          </nav>
          <div className="px-6 mt-4">
            <p className="text-[11px] tracking-luxe-sm text-gold uppercase mb-2">Concierge</p>
            <p className="text-sm text-cream/60">Speak to a scent expert</p>
          </div>
        </div>
      </div>
    </>
  );
}