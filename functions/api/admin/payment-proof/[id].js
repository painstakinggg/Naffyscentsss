import { requireAdmin, json } from "../../_auth.js";
export async function onRequestGet({ request, env, params }) {
  const gate = await requireAdmin(request, env.DB);
  if (gate.response) return gate.response;
  if (!env.MEDIA) return json({ error: "Media storage unavailable" }, 503);
  const row = await env.DB.prepare("SELECT payment_proof_key FROM order_payment_details WHERE order_id=?").bind(params.id).first();
  const key = String(row?.payment_proof_key || "");
  if (!key || !key.startsWith("payment-proofs/" + params.id + "/")) return json({ error: "Payment proof not found" }, 404);
  const object = await env.MEDIA.get(key);
  if (!object) return json({ error: "Payment proof not found" }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "private, no-store");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}