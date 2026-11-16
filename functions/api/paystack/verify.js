import { json } from "../_auth.js";

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: "Order service unavailable" }, 503);
  if (!env.PAYSTACK_SECRET_KEY || !env.PAYSTACK_SECRET_KEY.startsWith("sk_test_")) {
    return json({ error: "Paystack test mode is not configured" }, 503);
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request" }, 400); }
  const reference = String(body.reference || "").trim();
  if (!/^[A-Za-z0-9.=-]{5,100}$/.test(reference)) return json({ error: "Invalid payment reference" }, 400);

  try {
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

    const payment = await env.DB.prepare(
      "SELECT reference,order_id,amount_kobo,status FROM paystack_transactions WHERE reference=? LIMIT 1"
    ).bind(reference).first();
    if (!payment) return json({ error: "Payment reference was not found" }, 404);

    const verification = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` }
    });
    const payload = await verification.json();
    if (!verification.ok || !payload.status || !payload.data) {
      return json({ error: payload.message || "Could not verify payment" }, 502);
    }

    const tx = payload.data;
    if (tx.reference !== reference || tx.currency !== "NGN" || Number(tx.amount) !== Number(payment.amount_kobo)) {
      await env.DB.prepare("UPDATE paystack_transactions SET status='amount_mismatch',updated_at=CURRENT_TIMESTAMP WHERE reference=?").bind(reference).run();
      return json({ error: "Payment details did not match this order" }, 409);
    }

    if (tx.status !== "success") {
      await env.DB.prepare("UPDATE paystack_transactions SET status=?,updated_at=CURRENT_TIMESTAMP WHERE reference=?").bind(String(tx.status || "pending"), reference).run();
      return json({ ok: false, paid: false, status: tx.status || "pending" }, 200);
    }

    await env.DB.batch([
      env.DB.prepare("UPDATE paystack_transactions SET status='success',updated_at=CURRENT_TIMESTAMP WHERE reference=?").bind(reference),
      env.DB.prepare("UPDATE orders SET payment_status='Paid',status='Processing',payment_confirmation_submitted=1,payment_confirmation_date=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=? AND payment_status='Unpaid'").bind(payment.order_id)
    ]);

    const order = await env.DB.prepare("SELECT id,payment_status,status,total FROM orders WHERE id=? LIMIT 1").bind(payment.order_id).first();
    if (!order || order.payment_status !== "Paid") return json({ error: "Payment was verified but the order status could not be updated" }, 409);
    return json({ ok: true, paid: true, order: { id: order.id, payment_status: order.payment_status, status: order.status, total: order.total } });
  } catch {
    return json({ error: "Payment verification failed. Please contact the store if your account was debited." }, 500);
  }
}
