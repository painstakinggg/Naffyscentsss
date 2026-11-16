import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/lib/cart-context";
import { useStore } from "@/lib/store-context";
import { formatNaira } from "@/lib/images";
import { ArrowLeft, Check, Lock, Truck, MessageCircle, ShoppingBag, MapPin, CreditCard, ChevronDown } from "lucide-react";
import { Image } from "@/components/ui/image";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
];

const inputClass = "w-full rounded-md border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-[#762d38] focus:ring-2 focus:ring-[#762d38]/10 placeholder:text-stone-400";
const labelClass = "mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-600";

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: "", last_name: "", customer_email: "", phone: "", address: "", apartment: "", postal_code: "", customer_instructions: "", city: "", state: "Ogun" });
  const [deliveryZone, setDeliveryZone] = useState("ilaro");
  const [fulfilment, setFulfilment] = useState("delivery");
  const isPickup = fulfilment === "pickup";
  const [coupon, setCoupon] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [finalSummaryOpen, setFinalSummaryOpen] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);
  const [paidStatus, setPaidStatus] = useState("idle");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const ilaroMin = settings?.delivery_fee_ilaro_min ?? 1000;
  const ilaroMax = settings?.delivery_fee_ilaro_max ?? 2000;
  const logisticsProvider = settings?.logistics_provider || "Josh Logistics";
  const pickupHours = settings?.pickup_hours || "12:00 PM – 5:00 PM";
  const deliveryFee = isPickup ? 0 : deliveryZone === "lagos"
    ? Number(settings?.delivery_fee_lagos ?? 2500)
    : deliveryZone === "nationwide"
      ? Number(settings?.delivery_fee_nationwide ?? 4500)
      : Number(ilaroMin);
  const deliveryFeeMin = isPickup ? 0 : deliveryZone === "lagos"
    ? deliveryFee
    : deliveryZone === "nationwide"
      ? deliveryFee
      : Number(ilaroMin);
  const deliveryFeeMax = isPickup ? 0 : deliveryZone === "ilaro"
    ? Number(ilaroMax)
    : deliveryFee;
  const total = Math.max(0, subtotal - discount + (items.length > 0 ? deliveryFee : 0));

  useEffect(() => {
    if (items.length === 0 && !order) navigate("/cart");
  }, [items, order, navigate]);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      const response = await fetch("/api/promotions/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: coupon.trim(), subtotal }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invalid coupon");
      setDiscount(Number(data.discount) || 0);
      setCoupon(data.code || coupon.trim());
      setCouponMsg("Coupon applied successfully");
    } catch {
      setCouponMsg("We could not verify that coupon");
    }
  };

  const startPaystack = async (orderId) => {
    setPaymentLoading(true);
    setPaymentError("");
    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      const data = await response.json();
      if (!response.ok || !data.authorization_url) throw new Error(data.error || "Could not open Paystack checkout.");
      window.location.assign(data.authorization_url);
    } catch (error) {
      setPaymentError(error.message || "Could not start payment. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (order) {
      await startPaystack(order.id);
      return;
    }
    setPlacing(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          customer_name: [form.first_name, form.last_name].filter(Boolean).join(" "),
          customer_email: form.customer_email,
          address: isPickup ? "" : [form.address, form.apartment].filter(Boolean).join(", "),
          apartment: isPickup ? "" : form.apartment,
          postal_code: isPickup ? "" : form.postal_code,
          customer_instructions: form.customer_instructions,
          delivery_zone: deliveryZone,
          city: isPickup ? "" : form.city,
          state: isPickup ? "" : form.state,
          items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, size_ml: i.size_ml, quantity: i.quantity, image: i.image })),
          fulfilment_method: isPickup ? "Pickup" : "Logistics Delivery",
          subtotal,
          delivery_fee: deliveryFee,
          delivery_fee_min: deliveryFeeMin,
          delivery_fee_max: deliveryFeeMax,
          delivery_info_note: isPickup ? "" : `Delivery to ${deliveryZone === "lagos" ? "Lagos" : deliveryZone === "nationwide" ? "other states" : "Ilaro and nearby"}: ${formatNaira(deliveryFee)}${deliveryZone === "ilaro" ? ` (estimated range ${formatNaira(ilaroMin)} – ${formatNaira(ilaroMax)})` : ""} via ${logisticsProvider}. Final fee confirmed before dispatch.`,
          discount,
          total,
          status: "Awaiting Payment Confirmation",
          payment_status: "Unpaid",
          coupon_code: discount > 0 ? coupon : "",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not place order");
      setOrder(result.order);
      window.scrollTo(0, 0);
      await startPaystack(result.order.id);
    } catch {
      alert("Could not place your order. Please check your details and try again.");
    } finally {
      setPlacing(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (paidStatus === "submitting" || paidStatus === "submitted") return;
    if (!paymentReference.trim()) { setPaidStatus("error"); return; }
    setPaidStatus("submitting");
    try {
      let proofKey = "";
      if (paymentProof) {
        const body = new FormData(); body.append("file", paymentProof);
        const upload = await fetch(`/api/payment-proof/${order.id}`, { method: "POST", body });
        const uploaded = await upload.json();
        if (!upload.ok) throw new Error(uploaded.error || "Screenshot upload failed");
        proofKey = uploaded.key;
      }
      const response = await fetch(`/api/orders/${order.id}/payment-confirmation`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ transaction_reference: paymentReference.trim(), payment_proof_key: proofKey }) });
      if (!response.ok) throw new Error("Could not submit payment confirmation");
      setPaidStatus("submitted");
    } catch {
      setPaidStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 pb-20 pt-24 text-stone-800 sm:px-6 sm:pt-28">
      <div className="mx-auto max-w-xl">
        <form onSubmit={placeOrder} className="space-y-7">
          <section className="-mx-4 space-y-3 bg-[#f5f5f5] px-6 py-6 sm:-mx-6 sm:px-7">
            <div className="flex w-full items-center justify-between gap-4">
              <h4 className="flex min-w-0 items-center gap-2 text-[20px] font-normal leading-tight text-black">
                Order summary
                <button type="button" onClick={() => setSummaryOpen((value) => !value)} aria-expanded={summaryOpen} aria-label={summaryOpen ? "Collapse order summary" : "Expand order summary"} className="rounded p-0.5">
                  <ChevronDown size={20} className={"shrink-0 transition-transform " + (summaryOpen ? "rotate-180" : "")} />
                </button>
              </h4>
              {!summaryOpen && <strong className="shrink-0 text-[24px] font-bold leading-tight tracking-tight text-black">{formatNaira(total)}</strong>}
            </div>
            {summaryOpen ? (
              <div className="space-y-4 rounded-lg bg-[#faf9f6] p-4">
                {items.map((item) => (
                  <div key={item.id + "-" + item.size_ml} className="flex items-center gap-3 border-b border-stone-200 pb-3">
                    <img src={item.image} alt={item.name} className="h-14 w-14 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-stone-800">{item.name}</p>
                      <p className="text-xs text-stone-500">Qty: {item.quantity}{item.is_bundle ? " · Bundle" : item.size_ml ? " · " + item.size_ml + "ml" : ""}</p>
                    </div>
                    <strong className="whitespace-nowrap text-sm text-stone-900">{formatNaira(item.price * item.quantity)}</strong>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Discount code" aria-label="Discount code" className="min-w-0 flex-1 rounded-md border border-stone-300 bg-white px-3 py-2.5 text-xs text-stone-800 outline-none focus:border-[#762d38]" />
                  <button type="button" onClick={applyCoupon} className="rounded-md border border-[#762d38] px-3 py-2.5 text-xs font-semibold text-[#762d38] transition hover:bg-[#762d38]/5">Apply</button>
                </div>
                {couponMsg && <p className={"text-xs " + (discount > 0 ? "text-emerald-700" : "text-red-600")}>{couponMsg}</p>}
                <div className="space-y-2 border-t border-stone-200 pt-3 text-sm">
                  <SummaryRow label="Subtotal" value={formatNaira(subtotal)} />
                  {!isPickup && <SummaryRow label="Delivery fee" value={formatNaira(deliveryFee)} />}
                  {discount > 0 && <SummaryRow label="Discount" value={"−" + formatNaira(discount)} green />}
                  <div className="flex justify-between border-t border-stone-200 pt-3 font-bold text-stone-900">
                    <span>Total</span><span className="text-[#762d38]">{formatNaira(total)}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">Contact</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>First name <span className="font-normal normal-case tracking-normal text-stone-400">(optional)</span></label>
                <input className={inputClass} autoComplete="given-name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="First name" />
              </div>
              <div>
                <label className={labelClass}>Last name *</label>
                <input className={inputClass} autoComplete="family-name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Last name" required />
              </div>
              <div>
                <label className={labelClass}>Phone number *</label>
                <input className={inputClass} type="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 080…" required />
              </div>
              <div>
                <label className={labelClass}>Email address *</label>
                <input className={inputClass} type="email" autoComplete="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} placeholder="you@example.com" required />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">Delivery</h2>
            <div className="grid grid-cols-2 gap-1 rounded-[24px] bg-stone-100 p-1.5">
              <button type="button" onClick={() => setFulfilment("delivery")} aria-pressed={!isPickup} className={"flex min-h-[58px] items-center justify-center gap-2 rounded-[20px] px-3 py-3 text-base font-semibold transition " + (!isPickup ? "bg-white text-stone-950 shadow-sm ring-1 ring-stone-200" : "text-stone-800 hover:bg-white/60")}>
                <Truck size={21} className="shrink-0 text-stone-950" />Ship
              </button>
              <button type="button" onClick={() => setFulfilment("pickup")} aria-pressed={isPickup} className={"flex min-h-[58px] items-center justify-center gap-2 rounded-[20px] px-3 py-3 text-base font-semibold transition " + (isPickup ? "bg-white text-stone-950 shadow-sm ring-1 ring-stone-200" : "text-stone-800 hover:bg-white/60")}>
                <MapPin size={21} className="shrink-0 text-stone-950" />Pickup
              </button>
            </div>

            {isPickup ? (
              <div className="rounded-[24px] border border-stone-200 bg-white px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-stone-950">Naffy Scents Store</p>
                    <p className="mt-1 text-sm leading-relaxed text-stone-800">{settings?.store_address || "Ilaro, Ogun State"}</p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-stone-600"><span aria-hidden="true">◷</span>Usually ready in 1 hour</p>
                  </div>
                  <span className="shrink-0 text-base font-semibold text-stone-950">FREE</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 rounded-lg border border-stone-200 p-4 sm:p-5">
                <div>
                  <label className={labelClass}>Street address *</label>
                  <input className={inputClass} autoComplete="street-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House number, street and area" required />
                </div>
                <div>
                  <label className={labelClass}>Apartment, suite, etc. <span className="font-normal normal-case tracking-normal text-stone-400">(optional)</span></label>
                  <input className={inputClass} value={form.apartment} onChange={(e) => setForm({ ...form, apartment: e.target.value })} placeholder="Apartment, suite or unit" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>City *</label>
                    <input className={inputClass} autoComplete="address-level2" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Your city" required />
                  </div>
                  <div>
                    <label className={labelClass}>State *</label>
                    <select className={inputClass} autoComplete="address-level1" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required>
                      {NIGERIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Postal code <span className="font-normal normal-case tracking-normal text-stone-400">(optional)</span></label>
                    <input className={inputClass} value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} placeholder="Postal code" />
                  </div>
                  <div>
                    <label className={labelClass}>Delivery destination</label>
                    <select className={inputClass} value={deliveryZone} onChange={(e) => setDeliveryZone(e.target.value)}>
                      <option value="ilaro">Ilaro and nearby</option>
                      <option value="lagos">Lagos</option>
                      <option value="nationwide">Other states (nationwide)</option>
                    </select>
                  </div>
                </div>
                <div className="border-t border-stone-200 pt-4">
                  <p className="text-xs leading-5 text-stone-500">Delivery via {logisticsProvider}. Estimated fee: {deliveryZone === "lagos" ? formatNaira(settings?.delivery_fee_lagos ?? 2500) : deliveryZone === "nationwide" ? formatNaira(settings?.delivery_fee_nationwide ?? 4500) : formatNaira(ilaroMin) + " – " + formatNaira(ilaroMax)}. Final fee is confirmed before dispatch.</p>
                </div>
              </div>
            )}
          </section>

          <section className="border-t border-stone-200 pt-5">
            <button type="button" onClick={() => setInstructionsOpen((value) => !value)} aria-expanded={instructionsOpen} className="flex w-full items-center justify-between py-1">
              <span className="text-sm font-bold uppercase tracking-wider text-stone-900">Customer instructions <span className="font-normal normal-case tracking-normal text-stone-400">(optional)</span></span>
              <ChevronDown size={19} className={"text-stone-500 transition-transform " + (instructionsOpen ? "rotate-180" : "")} />
            </button>
            {instructionsOpen && (
              <div className="pt-3">
                <textarea className={inputClass + " min-h-24 resize-y"} value={form.customer_instructions} onChange={(e) => setForm({ ...form, customer_instructions: e.target.value })} placeholder="Add any instructions for your order (optional)" />
              </div>
            )}
          </section>

          <section className="space-y-4 border-t border-stone-200 pt-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">Payment Method</h2>
            <div className="space-y-3 rounded-lg border border-stone-200 p-4 sm:p-5">
              <div className="flex items-center gap-3 text-sm font-semibold text-stone-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#762d38]/[0.08] text-[#762d38]"><CreditCard size={17} /></span>
                Paystack
              </div>
              <p className="text-sm leading-relaxed text-stone-600">Pay securely by card, bank transfer, USSD or other payment methods available through Paystack. Payment is confirmed automatically after server-side verification.</p>
            </div>
            <p className="text-[11px] leading-5 text-stone-500">Your personal details are used only to process and fulfil your order.</p>
          </section>

          <section className="border-t border-stone-200 pt-5">
            <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
              <button
                type="button"
                onClick={() => setFinalSummaryOpen((value) => !value)}
                aria-expanded={finalSummaryOpen}
                aria-label={finalSummaryOpen ? "Collapse full order details" : "Expand full order details"}
                className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-stone-50 sm:p-5"
              >
                {items[0]?.image ? (
                  <img src={items[0].image} alt={items[0].name || "Product"} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-500">
                    <ShoppingBag size={21} />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-stone-900">Total</span>
                  <span className="mt-0.5 block text-xs text-stone-500">
                    {items.reduce((count, item) => count + Number(item.quantity || 0), 0)} items
                  </span>
                </span>
                <span className="flex shrink-0 items-baseline gap-1.5 whitespace-nowrap text-right">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500">NGN</span>
                  <span className="text-lg font-bold leading-tight tracking-tight text-stone-900">{formatNaira(total)}</span>
                </span>
                <ChevronDown size={20} className={"ml-1 shrink-0 text-stone-600 transition-transform " + (finalSummaryOpen ? "rotate-180" : "")} />
              </button>
              {finalSummaryOpen && (
                <div className="space-y-3 border-t border-stone-200 bg-[#faf9f6] p-4 sm:p-5">
                  {items.map((item) => (
                    <div key={"final-" + item.id + "-" + item.size_ml} className="flex items-center gap-3 border-b border-stone-200 pb-3 last:border-0 last:pb-0">
                      {item.image ? <img src={item.image} alt={item.name} className="h-12 w-12 shrink-0 rounded-md object-cover" /> : <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-stone-200 text-stone-500"><ShoppingBag size={18} /></span>}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-stone-800">{item.name}</p>
                        <p className="text-xs text-stone-500">Qty: {item.quantity}{item.is_bundle ? " · Bundle" : item.size_ml ? " · " + item.size_ml + "ml" : ""}</p>
                      </div>
                      <span className="shrink-0 text-sm font-medium text-stone-900">{formatNaira(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="space-y-2 border-t border-stone-200 pt-3 text-sm">
                    <SummaryRow label="Subtotal" value={formatNaira(subtotal)} />
                    <SummaryRow label={isPickup ? "Pickup" : "Delivery fee"} value={isPickup ? "FREE" : formatNaira(deliveryFee)} />
                    {discount > 0 && <SummaryRow label="Discount" value={"−" + formatNaira(discount)} green />}
                    <div className="flex justify-between border-t border-stone-200 pt-3 font-bold text-stone-900">
                      <span>Total</span><span className="text-[#762d38]">{formatNaira(total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <button type="submit" disabled={placing || items.length === 0} className="flex w-full items-center justify-center gap-2 rounded-md bg-[#762d38] px-5 py-4 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#60232d] disabled:cursor-not-allowed disabled:opacity-50">
            <Lock size={15} />{placing ? "Redirecting to Paystack…" : order ? "Retry Pay Now" : "Pay Now"}
          </button>
          <p className="flex items-center justify-center gap-2 text-[11px] text-stone-500"><Lock size={13} />You’ll be redirected to Paystack to complete your payment. Your order is confirmed only after payment verification.</p>
          <p className="text-center text-[11px] text-stone-400">Need help? <a className="font-medium text-[#762d38] underline underline-offset-2" href={"https://wa.me/" + (settings?.whatsapp_number || "2348103173658")} target="_blank" rel="noopener noreferrer">Contact us on WhatsApp</a></p>
        </form>
      </div>

      {placing && (
        <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-black/55 px-5 py-8 text-center backdrop-blur-[2px]" role="status" aria-live="polite">
          <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-white/10 bg-[#211719] px-7 py-9 text-white shadow-2xl">
            <div className="mb-8 text-xs font-semibold tracking-[0.35em] text-[#f0d8c9]">NAFFY SCENTS</div>
            <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#f0d8c9]/25">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#f0d8c9] border-t-transparent" />
            </div>
            <p className="text-sm font-medium tracking-[0.16em]">PROCESSING YOUR ORDER</p>
            <p className="mt-3 text-xs leading-relaxed text-white/65">Please wait while we securely submit your order.</p>
          </div>
        </div>
      )}
    </main>
  );
}


function SectionHeading({ icon, title, subtitle }) {
  return <div className="mb-5 flex items-start gap-3"><span className="rounded-md bg-[#762d38]/[0.07] p-2 text-[#762d38]">{icon}</span><div><h2 className="font-heading text-xl text-stone-900">{title}</h2><p className="mt-1 text-xs text-stone-500">{subtitle}</p></div></div>;
}

function SummaryRow({ label, value, strong = false, green = false }) {
  return <div className="mb-2 flex items-start justify-between gap-4 text-xs"><span className="text-stone-500">{label}</span><span className={`text-right ${strong ? "font-semibold text-stone-900" : green ? "font-medium text-emerald-700" : "text-stone-700"}`}>{value}</span></div>;
}
