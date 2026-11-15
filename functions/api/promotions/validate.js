const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: "Promotion service is unavailable" }, 503);
  try {
    const body = await request.json();
    const code = String(body.code || "").trim().toUpperCase();
    const subtotal = Number(body.subtotal);
    if (!code || !Number.isFinite(subtotal) || subtotal < 0) {
      return json({ error: "Enter a valid coupon code" }, 400);
    }
    const promotion = await env.DB.prepare(
      "SELECT code, discount_type, discount_value FROM promotions WHERE UPPER(code) = ? AND active = 1 LIMIT 1"
    ).bind(code).first();
    if (!promotion) return json({ error: "Invalid coupon" }, 404);
    const value = Math.max(0, Number(promotion.discount_value) || 0);
    const discount = promotion.discount_type === "percentage"
      ? Math.round(subtotal * Math.min(value, 100) / 100)
      : Math.min(value, subtotal);
    return json({ valid: true, code: promotion.code, discount });
  } catch {
    return json({ error: "Could not verify coupon" }, 500);
  }
}
