import { json } from "../../_auth.js";
export async function onRequestPost({ request, env, params }) {
  if (!env.DB) return json({ error: "Order service unavailable" }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request" }, 400); }
  const reference = String(body.transaction_reference || "").trim().slice(0, 160);
  const proofKey = String(body.payment_proof_key || "").trim();
  if (!reference) return json({ error: "Transaction reference is required" }, 400);
  if (proofKey && !proofKey.startsWith("payment-proofs/" + params.id + "/")) return json({ error: "Invalid payment proof reference" }, 400);
  try {
    await env.DB.prepare("CREATE TABLE IF NOT EXISTS order_payment_details (order_id TEXT PRIMARY KEY, transaction_reference TEXT NOT NULL, payment_proof_key TEXT, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)").run();
    const order = await env.DB.prepare("SELECT id FROM orders WHERE id=? AND payment_status='Unpaid'").bind(params.id).first();
    if (!order) return json({ error: "Order not found or payment already processed" }, 404);
    await env.DB.prepare("INSERT INTO order_payment_details (order_id,transaction_reference,payment_proof_key,updated_at) VALUES (?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(order_id) DO UPDATE SET transaction_reference=excluded.transaction_reference,payment_proof_key=excluded.payment_proof_key,updated_at=CURRENT_TIMESTAMP").bind(params.id, reference, proofKey || null).run();
    const result = await env.DB.prepare("UPDATE orders SET payment_confirmation_submitted=1,payment_confirmation_date=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=? AND payment_status='Unpaid'").bind(params.id).run();
    return result.meta?.changes ? json({ ok: true }) : json({ error: "Payment confirmation could not be recorded" }, 409);
  } catch {
    return json({ error: "Could not save payment confirmation" }, 500);
  }
}