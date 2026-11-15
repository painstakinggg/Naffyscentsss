const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

export async function onRequestPost({ params, env }) {
  if (!env.DB) return json({ error: "Order service is unavailable" }, 503);
  const id = String(params.id || "").trim();
  if (!id) return json({ error: "Order not found" }, 404);

  try {
    const order = await env.DB.prepare(
      "SELECT id, payment_confirmation_submitted, payment_confirmation_date FROM orders WHERE id = ? LIMIT 1"
    ).bind(id).first();
    if (!order) return json({ error: "Order not found" }, 404);

    if (!order.payment_confirmation_submitted) {
      await env.DB.prepare(
        `UPDATE orders
         SET payment_confirmation_submitted = 1,
             payment_confirmation_date = datetime('now'),
             updated_at = datetime('now')
         WHERE id = ? AND payment_confirmation_submitted = 0`
      ).bind(id).run();
    }

    return json({ submitted: true });
  } catch {
    return json({ error: "Could not submit payment confirmation" }, 500);
  }
}
