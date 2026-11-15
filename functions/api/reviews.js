const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8" },
});

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: "Review service is unavailable" }, 503);
  try {
    const body = await request.json();
    const customerName = String(body.customer_name || "").trim();
    const review = String(body.review || "").trim();
    const rating = Number(body.rating);
    const productId = String(body.product_id || "").trim();
    const productName = String(body.product_name || "").trim();
    const email = String(body.email || "").trim();
    const orderNumber = String(body.order_number || "").trim();

    if (!customerName || customerName.length > 120 || !review || review.length > 3000 ||
        !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return json({ error: "Please provide your name, a review and a rating from 1 to 5" }, 400);
    }
    if (productId) {
      const product = await env.DB.prepare("SELECT id, name FROM products WHERE id = ? LIMIT 1").bind(productId).first();
      if (!product) return json({ error: "The selected product could not be found" }, 404);
    }

    let verified = false;
    if (orderNumber) {
      const match = await env.DB.prepare(
        "SELECT id FROM orders WHERE UPPER(SUBSTR(id, -8)) = ? LIMIT 1"
      ).bind(orderNumber.toUpperCase()).first();
      verified = Boolean(match);
    }

    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO reviews (
        id, product_id, product_name, customer_name, email, rating, review,
        order_number, verified, featured, approved, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'Pending')`
    ).bind(id, productId || null, productName, customerName, email, rating, review, orderNumber, verified ? 1 : 0).run();

    return json({ review: { id, status: "Pending", verified } }, 201);
  } catch {
    return json({ error: "Could not submit your review. Please try again." }, 500);
  }
}
