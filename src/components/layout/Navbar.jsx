import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/AuthContext";
import { Image } from "@/components/ui/image";
import { isAppAdmin } from "@/lib/admin-access";

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
  const { itemCount } = useCart();
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
            ? "top-3 left-4 right-4 h-[62px] rounded-[40px] shadow-lg shadow-black/15 glass-strong py-0"
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
            <Link to="/cart" className="relative text-cream/80 hover:text-gold transition-colors" aria-label="Shopping bag">
              <ShoppingBag size={19} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-obsidian text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
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
            {isAdmin && (
              <Link to="/admin" className="font-heading text-2xl text-gold hover:text-gold-light transition-colors py-3 border-b border-gold/5">
                Admin
              </Link>
            )}
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