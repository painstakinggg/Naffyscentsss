import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/lib/cart-context";
import { useStore } from "@/lib/store-context";
import { apiPost } from "@/lib/api";
import { formatNaira } from "@/lib/images";
import { Check, Lock, Truck, MessageCircle } from "lucide-react";
import { Image } from "@/components/ui/image";

const LOGO_URL = "https://base44.app/api/apps/6aa9c58b774c337069ac009e/files/mp/public/6aa9c58b774c337069ac009e/1b75b90f3_logo-maroon-beige.png";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
];

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customer_name: "", customer_email: "", phone: "", address: "", city: "", state: "Lagos" });
  const [fulfilment, setFulfilment] = useState("delivery");
  const isPickup = fulfilment === "pickup";
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);
  const [paidStatus, setPaidStatus] = useState("idle");

  const ilaroMin = settings?.delivery_fee_ilaro_min ?? 1000;
  const ilaroMax = settings?.delivery_fee_ilaro_max ?? 2000;
  const logisticsProvider = settings?.logistics_provider || "Josh Logistics";
  const pickupHours = settings?.pickup_hours || "12:00 PM – 5:00 PM";
  const deliveryFee = 0; // pickup: free; logistics: final charge confirmed after order
  const total = subtotal - discount + (items.length > 0 ? deliveryFee : 0);

  useEffect(() => {
    if (items.length === 0 && !order) navigate("/cart");
  }, [items, order, navigate]);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      const result = await apiPost("/promotions/validate", { code: coupon.trim(), subtotal });
      setDiscount(Number(result.discount) || 0);
      setCouponMsg("Coupon applied");
    } catch (e) {
      setCouponMsg("Could not verify coupon");
    }
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const result = await apiPost("/orders", {
        ...form,
        customer_email: isPickup ? "" : form.customer_email,
        address: isPickup ? "" : form.address,
        city: isPickup ? "" : form.city,
        state: isPickup ? "" : form.state,
        items: items.map((i) => ({ id: i.id, size_ml: i.size_ml, quantity: i.quantity })),
        fulfilment_method: isPickup ? "Pickup" : "Logistics Delivery",
        coupon_code: discount > 0 ? coupon.trim() : "",
      });
      setOrder(result.order);
      clearCart();
      window.scrollTo(0, 0);
    } catch (err) {
      alert("Could not place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (paidStatus === "submitting" || paidStatus === "submitted") return;
    setPaidStatus("submitting");
    try {
      await apiPost(`/orders/${encodeURIComponent(order.id)}/payment-confirmation`, {});
      setPaidStatus("submitted");
    } catch (e) {
      setPaidStatus("error");
    }
  };

  if (order) {
    const orderRef = order.id.slice(-8).toUpperCase();
    const waNumber = settings?.whatsapp_number || "2348012345678";
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello Naffy Scents, here is my payment proof for order #${orderRef} (amount: ${formatNaira(order.total)}).`)}`;
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center px-5">
        <div className="text-center max-w-md">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image src={LOGO_URL} alt="Naffy Scents" fittingType="fit" className="h-14 w-auto object-contain" />
            <span className="font-heading font-semibold tracking-luxe-sm text-cream text-2xl leading-none whitespace-nowrap">NAFFY SCENTS</span>
          </div>
          <div className="w-20 h-20 rounded-full border border-gold flex items-center justify-center mx-auto mb-8 animate-scale-in">
            <Check size={32} className="text-gold" strokeWidth={1.5} />
          </div>
          <p className="text-[11px] tracking-luxe text-gold uppercase mb-3">Order Confirmed</p>
          <h1 className="font-heading text-4xl text-cream mb-4">Thank you, {order.customer_name.split(" ")[0]}.</h1>
          <p className="text-sm text-cream/55 mb-2">Your order has been received.</p>
          <p className="text-sm text-cream/40 mb-8">Order reference: <span className="text-gold">{orderRef}</span></p>
          <div className="glass rounded-xl p-6 text-left mb-8">
            <div className="flex justify-between mb-2"><span className="text-cream/60 text-sm">Fulfilment</span><span className="text-cream/70 text-sm">{order.fulfilment_method === "Pickup" ? "Store Pickup" : "Logistics Delivery"}</span></div>
            <div className="flex justify-between mb-2"><span className="text-cream/60 text-sm">Total</span><span className="text-gold">{formatNaira(order.total)}</span></div>
            {order.fulfilment_method === "Pickup" ? (
              <div className="flex justify-between"><span className="text-cream/60 text-sm">Collection</span><span className="text-cream/70 text-sm">Ilaro Store · {settings?.pickup_hours || pickupHours}</span></div>
            ) : (
              <div className="flex justify-between"><span className="text-cream/60 text-sm">Delivery (Ilaro)</span><span className="text-cream/70 text-sm">{formatNaira(order.delivery_fee_min || ilaroMin)} – {formatNaira(order.delivery_fee_max || ilaroMax)} — final charge confirmed</span></div>
            )}
          </div>
          {paidStatus === "submitted" ? (
            <div className="glass rounded-xl p-6 text-left mb-6 border border-sage/30">
              <p className="text-sage text-sm font-medium mb-1">Payment confirmation received</p>
              <p className="text-xs text-cream/60">Thank you. We've received your payment confirmation. Your order will be processed after payment is verified.</p>
            </div>
          ) : (
            <div className="glass rounded-xl p-6 text-left mb-6">
              <p className="text-[10px] tracking-luxe-sm text-gold uppercase mb-2">Payment</p>
              <p className="text-sm text-cream/80 mb-1">Order #: <span className="text-gold">{orderRef}</span></p>
              <p className="text-sm text-cream/80 mb-3">Amount to pay: <span className="text-gold">{formatNaira(order.total)}</span></p>
              <p className="text-sm text-cream/70 mb-3">Please transfer the exact amount to the Naffy Scents account below:</p>
              {settings?.bank_name ? (
                <div className="p-3 border border-gold/20 rounded-lg space-y-1.5 mb-3 text-sm">
                  <div className="flex justify-between"><span className="text-cream/60">Bank</span><span className="text-cream">{settings.bank_name}</span></div>
                  {settings?.account_name && <div className="flex justify-between"><span className="text-cream/60">Account Name</span><span className="text-cream">{settings.account_name}</span></div>}
                  {settings?.account_number && <div className="flex justify-between"><span className="text-cream/60">Account Number</span><span className="text-cream tracking-wide">{settings.account_number}</span></div>}
                </div>
              ) : (
                <p className="text-xs text-cream/50 mb-3">Account details will be shared with you shortly. Use the details provided by our team to complete the transfer.</p>
              )}
              {settings?.payment_instructions && <p className="text-xs text-cream/50 mb-3">{settings.payment_instructions}</p>}
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-outline-gold w-full py-3 flex items-center justify-center gap-2 mb-3">
                <MessageCircle size={15} /> Send Payment Proof on WhatsApp
              </a>
              <button onClick={handleConfirmPayment} disabled={paidStatus === "submitting"} className="btn-gold w-full py-3 disabled:opacity-50">
                {paidStatus === "submitting" ? "Submitting..." : "I've Paid"}
              </button>
              {paidStatus === "error" && <p className="text-xs text-garnet mt-2">Could not submit confirmation. Please try again or contact us.</p>}
              <p className="text-xs text-cream/50 mt-3">After making the transfer, please send your payment receipt to Naffy Scents through WhatsApp so your payment can be confirmed.</p>
            </div>
          )}

          <p className="text-xs text-cream/40 mb-6">We'll contact you on <span className="text-cream/60">{order.phone}</span>{order.fulfilment_method === "Pickup" ? " when your order is ready for pickup." : " to confirm delivery and payment."}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={`/leave-review?order=${order.id.slice(-8).toUpperCase()}`} className="btn-outline-gold inline-block px-10 py-4">Leave a Review</Link>
            <Link to="/shop" className="btn-gold inline-block px-10 py-4">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-luxe text-gold uppercase mb-3">Checkout</p>
          <h1 className="font-heading text-4xl text-cream">Complete Your Order</h1>
        </div>

        <form onSubmit={placeOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass rounded-xl p-6">
              <h2 className="font-heading text-2xl text-cream mb-5">Fulfilment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" onClick={() => setFulfilment("delivery")} className={`text-left p-4 border rounded-lg transition-all ${fulfilment === "delivery" ? "border-gold bg-gold/10" : "border-gold/20 hover:border-gold/40"}`}>
                  <p className="text-cream text-sm font-medium mb-1">Logistics Delivery</p>
                  <p className="text-cream/50 text-xs">Delivery within Ilaro via {logisticsProvider} · {formatNaira(ilaroMin)}–{formatNaira(ilaroMax)}</p>
                </button>
                <button type="button" onClick={() => setFulfilment("pickup")} className={`text-left p-4 border rounded-lg transition-all ${fulfilment === "pickup" ? "border-gold bg-gold/10" : "border-gold/20 hover:border-gold/40"}`}>
                  <p className="text-cream text-sm font-medium mb-1">Pickup</p>
                  <p className="text-cream/50 text-xs">Collect in person from our Ilaro store · {pickupHours}</p>
                </button>
              </div>
              {isPickup ? (
                <p className="text-xs text-cream/50 mt-4">Order online and collect from: <span className="text-cream/70">{settings?.store_address || "Ilaro, Ogun State"}</span> · Pickup hours: <span className="text-cream/70">{pickupHours}</span></p>
              ) : (
                <p className="text-xs text-cream/50 mt-4">Delivery within Ilaro: <span className="text-cream/70">{formatNaira(ilaroMin)} – {formatNaira(ilaroMax)}</span> via {logisticsProvider}. The final delivery charge is confirmed with you after your order is placed.</p>
              )}
            </div>

            <div className="glass rounded-xl p-6">
              <h2 className="font-heading text-2xl text-cream mb-5">{isPickup ? "Contact Information" : "Delivery Information"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" value={form.customer_name} onChange={(v) => setForm({ ...form, customer_name: v })} required />
                <Field label="Phone Number" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
                {isPickup ? null : (
                  <>
                    <Field label="Email (optional)" type="email" value={form.customer_email} onChange={(v) => setForm({ ...form, customer_email: v })} className="sm:col-span-2" />
                    <Field label="Delivery Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} required className="sm:col-span-2" />
                    <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
                    <div className="space-y-2">
                      <label className="text-[10px] tracking-luxe-sm text-gold uppercase">State</label>
                      <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                        className="w-full bg-transparent border border-gold/25 px-4 py-3 text-cream text-sm outline-none focus:border-gold cursor-pointer">
                        {NIGERIAN_STATES.map((s) => <option key={s} value={s} className="bg-obsidian">{s}</option>)}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="glass rounded-xl p-6">
              <h2 className="font-heading text-2xl text-cream mb-2">Payment</h2>
              <p className="text-sm text-cream/50 mb-5">Payment is via bank transfer. The Naffy Scents account details and the exact amount to pay will be shown on the order confirmation screen once your order has been placed.</p>
              <div className="flex items-center gap-3 p-4 border border-gold/20 rounded-lg">
                <Lock size={18} className="text-gold" />
                <span className="text-sm text-cream/60">Your information is secure and encrypted</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="glass rounded-xl p-6 sticky top-28">
              <h2 className="font-heading text-2xl text-cream mb-5">Order Summary</h2>
              <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size_ml}`} className="flex gap-3">
                    <div className="w-12 h-16 shrink-0 overflow-hidden bg-obsidian-soft">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="text-cream/80 text-xs">{item.name}</p>
                      <p className="text-cream/40 text-xs">{item.is_bundle ? "Bundle" : `${item.size_ml}ml`} × {item.quantity}</p>
                    </div>
                    <span className="text-cream/70 text-sm">{formatNaira(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-4">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code"
                  className="flex-1 bg-transparent border border-gold/25 px-3 py-2.5 text-cream placeholder:text-cream/40 text-sm outline-none focus:border-gold" />
                <button type="button" onClick={applyCoupon} className="btn-outline-gold px-4 py-2.5 text-xs">Apply</button>
              </div>
              {couponMsg && <p className={`text-xs mb-3 ${discount > 0 ? "text-sage" : "text-garnet"}`}>{couponMsg}</p>}

              <div className="luxury-line my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-cream/60"><span>Fulfilment</span><span>{isPickup ? "Store Pickup" : `Logistics Delivery (${logisticsProvider})`}</span></div>
                <div className="flex justify-between text-cream/60"><span>Subtotal</span><span>{formatNaira(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-sage"><span>Discount</span><span>-{formatNaira(discount)}</span></div>}
                <div className="flex justify-between text-cream/60"><span>{isPickup ? "Collection" : "Delivery (Ilaro)"}</span><span>{isPickup ? formatNaira(0) : `${formatNaira(ilaroMin)} – ${formatNaira(ilaroMax)}`}</span></div>
              </div>
              {isPickup ? (
                <p className="text-xs text-cream/50 mt-3">You will collect your order from: <span className="text-cream/70">{settings?.store_address || "Ilaro, Ogun State"}</span> · Pickup hours: <span className="text-cream/70">{pickupHours}</span></p>
              ) : (
                <p className="text-xs text-cream/50 mt-3">Final delivery charge confirmed on confirmation. Total shown excludes delivery.</p>
              )}
              <div className="luxury-line my-4" />
              <div className="flex justify-between mb-6">
                <span className="text-cream">Total</span>
                <span className="text-gold text-xl font-medium">{formatNaira(total)}</span>
              </div>
              <button type="submit" disabled={placing} className="btn-gold w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                {placing ? "Placing Order..." : <>Place Order</>}
              </button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-cream/40 mt-4">
                <Truck size={13} /> {isPickup ? `Pickup from Ilaro store · ${pickupHours}` : `Delivery via ${logisticsProvider} · Ilaro ${formatNaira(ilaroMin)}–${formatNaira(ilaroMax)}`}
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-[10px] tracking-luxe-sm text-gold uppercase">{label}{required && " *"}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full bg-transparent border border-gold/25 px-4 py-3 text-cream text-sm outline-none focus:border-gold transition-colors" />
    </div>
  );
}