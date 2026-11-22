import { requireAdmin, json } from "../_auth.js";
export async function onRequestGet({ request, env }) {
  const gate = await requireAdmin(request, env.DB);
  if (gate.response) return gate.response;
  try {
    await env.DB.prepare("CREATE TABLE IF NOT EXISTS order_checkout_details (order_id TEXT PRIMARY KEY, apartment TEXT, postal_code TEXT, customer_instructions TEXT, delivery_zone TEXT, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)").run();
    await env.DB.prepare("CREATE TABLE IF NOT EXISTS order_payment_details (order_id TEXT PRIMARY KEY, transaction_reference TEXT NOT NULL, payment_proof_key TEXT, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)").run();
    const result = await env.DB.prepare("SELECT o.*, d.apartment, d.postal_code, d.customer_instructions, d.delivery_zone, p.transaction_reference, p.payment_proof_key FROM orders o LEFT JOIN order_checkout_details d ON d.order_id=o.id LEFT JOIN order_payment_details p ON p.order_id=o.id ORDER BY o.created_at DESC LIMIT 500").all();
    return json({ orders: (result.results || []).map(o => ({ ...o, items: parse(o.items), payment_confirmation_submitted: Boolean(o.payment_confirmation_submitted), has_payment_proof: Boolean(o.payment_proof_key) })) });
  } catch {
    return json({ error: "Unable to load orders" }, 500);
  }
}
function parse(value) { try { return JSON.parse(value || "[]"); } catch { return []; } }