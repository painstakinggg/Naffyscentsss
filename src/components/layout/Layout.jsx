import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";

export default function Layout() {
  const { pathname } = useLocation();
  const isCheckout = pathname === "/checkout";

  return (
    <div className="min-h-screen bg-obsidian flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isCheckout && <Footer />}
      {!isCheckout && <WhatsAppButton />}
    </div>
  );
}