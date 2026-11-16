import { json } from "../_auth.js";

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: "Order service unavailable" }, 503);
  if (!env.PAYSTACK_SECRET_KEY || !env.PAYSTACK_SECRET_KEY.startsWith("sk_test_")) {
    return json({ error: "Paystack test mode is not configured" }, 503);
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request" }, 400); }
  const orderId = String(body.order_id || "").trim();
  if (!orderId) return json({ error: "Order reference is required" }, 400);

  try {
    const order = await env.DB.prepare(
      "SELECT id, customer_name, customer_email, total, payment_status FROM orders WHERE id=? LIMIT 1"
    ).bind(orderId).first();
    if (!order || order.payment_status !== "Unpaid") return json({ error: "Order not found or already paid" }, 404);
    const email = String(order.customer_email || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "A valid email address is required for Paystack payment" }, 400);

    const amountKobo = Math.round(Number(order.total) * 100);
    if (!Number.isSafeInteger(amountKobo) || amountKobo < 100) return json({ error: "Invalid payment amount" }, 400);

    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS paystack_transactions (
        reference TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        amount_kobo INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'initialized',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    const reference = `NAFFY-${order.id.replace(/-/g, "").slice(0, 24)}-${crypto.randomUUID().slice(0, 8)}`;
    const origin = new URL(request.url).origin;
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        amount: amountKobo,
        currency: "NGN",
        reference,
        callback_url: `${origin}/payment/callback`,
        metadata: {
          order_id: order.id,
          customer_name: order.customer_name,
          custom_fields: [{ display_name: "Naffy Scents Order", variable_name: "order_id", value: order.id }]
        }
      })
    });
    const payload = await paystackResponse.json();
    if (!paystackResponse.ok || !payload.status || !payload.data?.authorization_url) {
      return json({ error: payload.message || "Could not start Paystack checkout" }, 502);
    }

    await env.DB.prepare(
      "INSERT INTO paystack_transactions (reference,order_id,amount_kobo,status) VALUES (?,?,?,'initialized')"
    ).bind(reference, order.id, amountKobo).run();

    return json({ authorization_url: payload.data.authorization_url, reference });
  } catch {
    return json({ error: "Could not initialize Paystack payment" }, 500);
  }
}
