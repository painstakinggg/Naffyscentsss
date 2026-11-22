export async function onRequestPost({ request, env, params }) {
  if (!env.DB || !env.MEDIA) return new Response(JSON.stringify({ error: "Payment proof storage is unavailable" }), { status: 503, headers: { "content-type": "application/json" } });
  const orderId = String(params.id || "");
  const order = await env.DB.prepare("SELECT id FROM orders WHERE id=?").bind(orderId).first();
  if (!order) return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: { "content-type": "application/json" } });
  let form;
  try { form = await request.formData(); } catch { return new Response(JSON.stringify({ error: "Invalid upload" }), { status: 400, headers: { "content-type": "application/json" } }); }
  const file = form.get("file");
  if (!file || typeof file.arrayBuffer !== "function") return new Response(JSON.stringify({ error: "Choose a payment screenshot" }), { status: 400, headers: { "content-type": "application/json" } });
  const allowed = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  if (!allowed[file.type]) return new Response(JSON.stringify({ error: "Only JPG, PNG or WebP images are accepted" }), { status: 400, headers: { "content-type": "application/json" } });
  if (file.size < 1 || file.size > 5 * 1024 * 1024) return new Response(JSON.stringify({ error: "Screenshot must be 5 MB or smaller" }), { status: 400, headers: { "content-type": "application/json" } });
  const key = "payment-proofs/" + orderId + "/" + crypto.randomUUID() + "." + allowed[file.type];
  await env.MEDIA.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  return new Response(JSON.stringify({ key }), { status: 201, headers: { "content-type": "application/json" } });
}