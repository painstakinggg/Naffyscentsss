import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/lib/cart-context";
import { useStore } from "@/lib/store-context";
import { formatNaira } from "@/lib/images";
import { Check, Lock, Truck, MessageCircle, ShoppingBag, MapPin, CreditCard, ChevronDown } from "lucide-react";
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
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);
  const [paidStatus, setPaidStatus] = useState("idle");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentProof, setPaymentProof] = useState(null);

  const ilaroMin = settings?.delivery_fee_ilaro_min ?? 1000;
  const ilaroMax = settings?.delivery_fee_ilaro_max ?? 2000;
  const logisticsProvider = settings?.logistics_provider || "Josh Logistics";
  const pickupHours = settings?.pickup_hours || "12:00 PM – 5:00 PM";
  const deliveryFee = 0;
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

  const placeOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          customer_name: [form.first_name, form.last_name].filter(Boolean).join(" "),
          customer_email: isPickup ? "" : form.customer_email,
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
          delivery_fee_min: isPickup ? 0 : ilaroMin,
          delivery_fee_max: isPickup ? 0 : ilaroMax,
          delivery_info_note: isPickup ? "" : `Delivery within Ilaro: ${formatNaira(ilaroMin)} – ${formatNaira(ilaroMax)} via ${logisticsProvider}`,
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
      clearCart();
      window.scrollTo(0, 0);
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

  if (order) {
    const orderRef = order.id.slice(-8).toUpperCase();
    const waNumber = settings?.whatsapp_number || "2348103173658";
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello Naffy Scents, here is my payment proof for order #${orderRef} (amount: ${formatNaira(order.total)}).`)}`;
    return (
      <main className="min-h-screen bg-[#faf9f6] px-5 pb-20 pt-28 text-stone-800 sm:pt-32">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border border-stone-200 bg-white p-7 text-center shadow-sm sm:p-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#762d38]/10 text-[#762d38]">
              <Check size={30} strokeWidth={1.7} />
            </div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#762d38]">Order received</p>
            <h1 className="mb-3 font-heading text-3xl text-stone-900">Thank you, {order.customer_name.split(" ")[0]}.</h1>
            <p className="text-sm text-stone-600">Your order has been created successfully.</p>
            <p className="mt-2 text-sm text-stone-500">Order reference: <strong className="text-[#762d38]">#{orderRef}</strong></p>
            <div className="my-7 rounded-xl bg-[#faf9f6] p-5 text-left">
              <SummaryRow label="Fulfilment" value={order.fulfilment_method === "Pickup" ? "Store pickup" : "Logistics delivery"} />
              <SummaryRow label="Order total" value={formatNaira(order.total)} strong />
              {order.fulfilment_method === "Pickup" ? (
                <SummaryRow label="Collection" value={`Ilaro Store · ${settings?.pickup_hours || pickupHours}`} />
              ) : (
                <SummaryRow label="Delivery estimate" value={Number(order.delivery_fee_min) === Number(order.delivery_fee_max) ? formatNaira(order.delivery_fee_min) : `${formatNaira(order.delivery_fee_min)} – ${formatNaira(order.delivery_fee_max)}`} />
              )}
            </div>
            {paidStatus === "submitted" ? (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-left">
                <p className="mb-1 text-sm font-semibold text-emerald-800">Payment confirmation received</p>
                <p className="text-xs leading-5 text-emerald-700">Your order will be processed after our team verifies the payment.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-stone-200 p-5 text-left">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#762d38]">Bank transfer payment</p>
                <p className="mb-1 text-sm text-stone-600">Transfer the exact order amount:</p>
                <p className="mb-4 text-2xl font-semibold text-stone-900">{formatNaira(order.total)}</p>
                {settings?.bank_name ? (
                  <div className="mb-4 space-y-2 rounded-lg bg-[#faf9f6] p-4 text-sm">
                    <SummaryRow label="Bank" value={settings.bank_name} />
                    {settings?.account_name && <SummaryRow label="Account name" value={settings.account_name} />}
                    {settings?.account_number && <SummaryRow label="Account number" value={settings.account_number} />}
                  </div>
                ) : (
                  <p className="mb-4 text-sm text-stone-500">Our team will share the bank details with you shortly.</p>
                )}
                {settings?.payment_instructions && <p className="mb-4 text-xs leading-5 text-stone-500">{settings.payment_instructions}</p>}
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="mb-3 flex w-full items-center justify-center gap-2 rounded-md border border-[#762d38] px-4 py-3 text-sm font-semibold text-[#762d38] transition hover:bg-[#762d38]/5">
                  <MessageCircle size={16} /> Send payment proof on WhatsApp
                </a>
                <div className="mb-3"><label className={labelClass}>Transaction reference *</label><input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder="Bank transfer reference" className={inputClass} required /></div>
                <div className="mb-4"><label className={labelClass}>Payment screenshot (optional · JPG/PNG/WebP · max 5 MB)</label><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file=e.target.files?.[0]; if (!file) return; if (!["image/jpeg","image/png","image/webp"].includes(file.type) || file.size>5*1024*1024) { setPaidStatus("error"); return; } setPaymentProof(file); setPaidStatus("idle"); }} className="w-full text-xs text-stone-600" />{paymentProof && <p className="mt-1 text-xs text-stone-500">{paymentProof.name} <button type="button" onClick={() => setPaymentProof(null)} className="ml-2 text-[#762d38] underline">Remove</button></p>}</div>
                <button onClick={handleConfirmPayment} disabled={paidStatus === "submitting"} className="w-full rounded-md bg-[#762d38] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#60232d] disabled:opacity-50">
                  {paidStatus === "submitting" ? "Submitting…" : "I've made the transfer"}
                </button>
                {paidStatus === "error" && <p className="mt-2 text-xs text-red-600">Please check your transaction reference and screenshot (JPG, PNG or WebP up to 5 MB), then try again.</p>}
                <p className="mt-3 text-xs leading-5 text-stone-500">Your payment is not marked as complete until our team verifies it.</p>
              </div>
            )}
            <p className="mt-6 text-xs text-stone-500">We’ll contact you on {order.phone} {order.fulfilment_method === "Pickup" ? "when your order is ready for collection." : "to confirm delivery and payment."}</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/shop" className="rounded-md bg-[#762d38] px-7 py-3 text-sm font-semibold text-white">Continue shopping</Link>
              <Link to={`/leave-review?order=${orderRef}`} className="rounded-md border border-stone-300 px-7 py-3 text-sm font-semibold text-stone-700">Leave a review</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] pb-20 pt-28 text-stone-800 sm:pt-32">
      <div className="mx-auto max-w-xl px-4 sm:px-5">
        <div className="mb-7 text-center">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#762d38]">NAFFY SCENTS</p><h1 className="font-heading text-3xl text-stone-900 sm:text-4xl">Secure checkout</h1><p className="mt-2 text-xs text-stone-500">Complete your details to place your order.</p>

        </div>

        <form onSubmit={placeOrder} className="mx-auto max-w-xl space-y-5">
          <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
              <button type="button" onClick={() => setSummaryOpen(v => !v)} className="flex w-full items-center justify-between text-left"><span className="font-heading text-xl text-stone-900">Order summary</span><ChevronDown size={18} className={`transition-transform ${summaryOpen ? "rotate-180" : ""}`} /></button>
              <p className="mt-1 text-xs text-stone-500">{items.reduce((n, item) => n + item.quantity, 0)} item(s) in your bag</p>
              {summaryOpen && <div className="my-5 space-y-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size_ml}`} className="flex gap-3">
                    <div className="h-16 w-14 shrink-0 overflow-hidden rounded-md bg-[#f3f0ec]"><img src={item.image} alt={item.name} className="h-full w-full object-cover" /></div>
                    <div className="min-w-0 flex-1"><p className="line-clamp-2 text-xs font-medium text-stone-800">{item.name}</p><p className="mt-1 text-[11px] text-stone-500">{item.is_bundle ? "Bundle" : `${item.size_ml}ml`} · Qty {item.quantity}</p></div>
                    <span className="whitespace-nowrap text-xs font-medium text-stone-700">{formatNaira(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>}
              <div className="flex gap-2">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Discount code" aria-label="Discount code" className="min-w-0 flex-1 rounded-md border border-stone-200 px-3 py-2.5 text-xs text-stone-800 outline-none focus:border-[#762d38]" />
                <button type="button" onClick={applyCoupon} className="rounded-md border border-[#762d38] px-3 py-2.5 text-xs font-semibold text-[#762d38] hover:bg-[#762d38]/5">Apply</button>
              </div>
              {couponMsg && <p className={`mt-2 text-xs ${discount > 0 ? "text-emerald-700" : "text-red-600"}`}>{couponMsg}</p>}
              <div className="my-5 border-t border-stone-200" />
              <SummaryRow label="Subtotal" value={formatNaira(subtotal)} />
              {discount > 0 && <SummaryRow label="Discount" value={`−${formatNaira(discount)}`} green />}
              <div className="mt-2"><SummaryRow label={isPickup ? "Pickup" : "Delivery estimate"} value={isPickup ? "Free" : deliveryZone === "lagos" ? formatNaira(settings?.delivery_fee_lagos ?? 2500) : deliveryZone === "nationwide" ? formatNaira(settings?.delivery_fee_nationwide ?? 4500) : `${formatNaira(ilaroMin)} – ${formatNaira(ilaroMax)}`} /></div>
              {!isPickup && <p className="mt-2 text-[11px] leading-5 text-stone-400">Final delivery fee is confirmed with you. It is not included in the order total below.</p>}
              <div className="my-5 border-t border-stone-200" />
              <div className="mb-5 flex items-center justify-between"><span className="text-sm font-semibold text-stone-800">Total</span><span className="text-xl font-semibold text-[#762d38]">{formatNaira(total)}</span></div>
              <button type="submit" disabled={placing || items.length === 0} className="w-full rounded-md bg-[#762d38] px-5 py-4 text-sm font-semibold tracking-wide text-white transition hover:bg-[#60232d] disabled:cursor-not-allowed disabled:opacity-50">{placing ? "Placing your order…" : "Place order"}</button>
              <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-stone-400"><Lock size={12} /> Secure order submission</p>
            </div>
            <p className="mt-4 text-center text-[11px] text-stone-400">Need help? <a className="font-medium text-[#762d38] underline underline-offset-2" href={`https://wa.me/${settings?.whatsapp_number || "2348103173658"}`} target="_blank" rel="noopener noreferrer">Contact us on WhatsApp</a></p>
</section>

          <div className="space-y-5">
            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
              <SectionHeading icon={<ShoppingBag size={17} />} title="Your details" subtitle="Tell us who we’re preparing this order for." />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className={labelClass}>First name <span className="font-normal normal-case tracking-normal text-stone-400">(optional)</span></label><input className={inputClass} autoComplete="given-name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="First name" /></div>
                <div><label className={labelClass}>Last name *</label><input className={inputClass} autoComplete="family-name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Last name" required /></div>
                <div><label className={labelClass}>Phone number *</label><input className={inputClass} type="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 080…" required /></div>
                {!isPickup && <div className="sm:col-span-2"><label className={labelClass}>Email address <span className="font-normal normal-case tracking-normal text-stone-400">(optional)</span></label><input className={inputClass} type="email" autoComplete="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} placeholder="you@example.com" /></div>}
              </div>
            </section>

            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading icon={<MapPin size={17} />} title="Delivery or pickup" subtitle="Choose how you’d like to receive your fragrance." />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => setFulfilment("delivery")} className={`rounded-lg border p-4 text-left transition ${!isPickup ? "border-[#762d38] bg-[#762d38]/[0.04] ring-1 ring-[#762d38]/10" : "border-stone-200 hover:border-stone-400"}`}>
                  <span className="mb-2 flex items-center justify-between text-sm font-semibold text-stone-800">Home delivery <Truck size={17} className="text-[#762d38]" /></span>
                  <span className="block text-xs leading-5 text-stone-500">Via {logisticsProvider}. Estimated fee: {deliveryZone === "lagos" ? formatNaira(settings?.delivery_fee_lagos ?? 2500) : deliveryZone === "nationwide" ? formatNaira(settings?.delivery_fee_nationwide ?? 4500) : `${formatNaira(ilaroMin)} – ${formatNaira(ilaroMax)}`}.</span>
                </button>
                <button type="button" onClick={() => setFulfilment("pickup")} className={`rounded-lg border p-4 text-left transition ${isPickup ? "border-[#762d38] bg-[#762d38]/[0.04] ring-1 ring-[#762d38]/10" : "border-stone-200 hover:border-stone-400"}`}>
                  <span className="mb-2 flex items-center justify-between text-sm font-semibold text-stone-800">Store pickup <ShoppingBag size={17} className="text-[#762d38]" /></span>
                  <span className="block text-xs leading-5 text-stone-500">Collect in Ilaro. Pickup hours: {pickupHours}.</span>
                </button>
              </div>
              {isPickup ? (
                <div className="mt-4 rounded-lg bg-[#faf9f6] p-4 text-xs leading-5 text-stone-600">Collection address: <strong className="font-semibold text-stone-800">{settings?.store_address || "Ilaro, Ogun State"}</strong><br />Pickup hours: {pickupHours}</div>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2"><label className={labelClass}>Street address *</label><input className={inputClass} autoComplete="street-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House number, street and area" required /></div>
                  <div><label className={labelClass}>Apartment / suite <span className="font-normal normal-case tracking-normal text-stone-400">(optional)</span></label><input className={inputClass} value={form.apartment} onChange={(e) => setForm({ ...form, apartment: e.target.value })} placeholder="Apartment, suite or unit" /></div>
                  <div><label className={labelClass}>Postal code <span className="font-normal normal-case tracking-normal text-stone-400">(optional)</span></label><input className={inputClass} value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} placeholder="Postal code" /></div>
                  <div><label className={labelClass}>City *</label><input className={inputClass} autoComplete="address-level2" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Your city" required /></div>
                  <div><label className={labelClass}>State *</label><select className={inputClass} autoComplete="address-level1" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>{NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div className="sm:col-span-2"><label className={labelClass}>Delivery destination</label><select className={inputClass} value={deliveryZone} onChange={(e) => setDeliveryZone(e.target.value)}><option value="ilaro">Ilaro and nearby</option><option value="lagos">Lagos</option><option value="nationwide">Other states (nationwide)</option></select></div>
                </div>
              )}
            </section>

            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading icon={<MessageCircle size={17} />} title="Customer instructions" subtitle="Optional notes for preparing or delivering your order." />
              <textarea className={inputClass + " min-h-[96px] resize-y"} value={form.customer_instructions} onChange={(e) => setForm({ ...form, customer_instructions: e.target.value })} placeholder="Add any special instructions…" />
            </section>

            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading icon={<CreditCard size={17} />} title="Payment method" subtitle="Your payment instructions will be shown after your order is placed." />
              <div className="flex items-start gap-3 rounded-lg border border-stone-200 bg-[#faf9f6] p-4">
                <div className="mt-0.5 rounded-md bg-white p-2 text-[#762d38]"><Lock size={17} /></div>
                <div><p className="text-sm font-semibold text-stone-800">Bank transfer</p><p className="mt-1 text-xs leading-5 text-stone-500">We’ll display the store’s bank details and your exact order amount on the confirmation screen. Payment is verified by our team before processing.</p></div>
              </div>
              <p className="mt-3 text-[11px] text-stone-400">Your personal details are used only to process and fulfil your order.</p>
            </section>
          </div>


        </form>
      </div>
    </main>
  );
}


function SectionHeading({ icon, title, subtitle }) {
  return <div className="mb-5 flex items-start gap-3"><span className="rounded-md bg-[#762d38]/[0.07] p-2 text-[#762d38]">{icon}</span><div><h2 className="font-heading text-xl text-stone-900">{title}</h2><p className="mt-1 text-xs text-stone-500">{subtitle}</p></div></div>;
}

function SummaryRow({ label, value, strong, green }) {
  return <div className="mb-2 flex items-start justify-between gap-4 text-xs"><span className="text-stone-500">{label}</span><span className={`text-right ${strong ? "font-semibold text-stone-900" : green ? "font-medium text-emerald-700" : "text-stone-700"}`}>{value}</span></div>;
}
