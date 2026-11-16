import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, LoaderCircle, AlertCircle } from "lucide-react";
import { formatNaira } from "@/lib/images";

export default function PaystackCallback() {
  const [params] = useSearchParams();
  const [state, setState] = useState({ loading: true, paid: false, message: "Confirming your payment securely…" });
  const reference = params.get("reference") || "";

  useEffect(() => {
    let active = true;
    if (!reference) {
      setState({ loading: false, paid: false, message: "No payment reference was returned." });
      return () => { active = false; };
    }
    fetch("/api/paystack/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reference })
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "We could not verify this payment.");
        if (!data.paid) throw new Error("Payment is not yet confirmed. If you were debited, please contact Naffy Scents.");
        if (active) setState({ loading: false, paid: true, message: "Your payment has been verified and your order is being processed.", order: data.order });
      })
      .catch((error) => {
        if (active) setState({ loading: false, paid: false, message: error.message || "Payment verification failed." });
      });
    return () => { active = false; };
  }, [reference]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#faf9f6] px-5 py-20 text-stone-800">
      <section className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${state.loading ? "bg-stone-100 text-stone-600" : state.paid ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {state.loading ? <LoaderCircle size={30} className="animate-spin" /> : state.paid ? <Check size={30} /> : <AlertCircle size={30} />}
        </div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#762d38]">Naffy Scents · Paystack</p>
        <h1 className="mb-3 font-heading text-2xl text-stone-900">{state.loading ? "Verifying payment" : state.paid ? "Payment successful" : "Payment not confirmed"}</h1>
        <p className="text-sm leading-6 text-stone-600">{state.message}</p>
        {state.paid && state.order && <p className="mt-4 text-sm font-semibold text-stone-800">Order total: {formatNaira(state.order.total)}</p>}
        {!state.loading && <Link to="/shop" className="mt-7 inline-flex rounded-md bg-[#762d38] px-7 py-3 text-sm font-semibold text-white">{state.paid ? "Continue shopping" : "Return to store"}</Link>}
      </section>
    </main>
  );
}
