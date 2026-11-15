const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8" },
});

const parseArray = (value) => {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: "Order service is unavailable" }, 503);

  try {
    const body = await request.json();
    const customerName = String(body.customer_name || "").trim();
    const phone = String(body.phone || "").trim();
    const fulfilment = body.fulfilment_method;
    const items = Array.isArray(body.items) ? body.items : [];

    if (!customerName || !phone || !items.length) {
      return json({ error: "Name, phone number and at least one item are required" }, 400);
    }
    if (!["Pickup", "Logistics Delivery"].includes(fulfilment)) {
      return json({ error: "Invalid fulfilment method" }, 400);
    }
    if (fulfilment === "Logistics Delivery" &&
        (!String(body.address || "").trim() || !String(body.city || "").trim() || !String(body.state || "").trim())) {
      return json({ error: "Delivery address, city and state are required" }, 400);
    }

    const cleanItems = [];
    let subtotal = 0;
    for (const item of items) {
      const productId = String(item.id || "").trim();
      const quantity = Number(item.quantity);
      if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        return json({ error: "One or more cart items are invalid" }, 400);
      }

      const product = await env.DB.prepare(
        "SELECT id, name, price, size_ml, images, stock, available, is_bundle FROM products WHERE id = ? LIMIT 1"
      ).bind(productId).first();

      if (!product || !product.available) {
        return json({ error: "A product in your cart is no longer available" }, 409);
      }
      if (Number(product.stock) < quantity) {
        return json({ error: `${product.name} does not have enough stock` }, 409);
      }

      const price = Number(product.price);
      if (!Number.isFinite(price) || price < 0) {
        return json({ error: "A product price is invalid. Please contact the store" }, 500);
      }
      subtotal += price * quantity;
      const images = parseArray(product.images);
      cleanItems.push({
        id: product.id,
        name: product.name,
        price,
        size_ml: Number(item.size_ml || product.size_ml || 100),
        quantity,
        image: images[0] || "",
        is_bundle: Boolean(product.is_bundle),
      });
    }

    let discount = 0;
    const couponCode = String(body.coupon_code || "").trim().toUpperCase();
    if (couponCode) {
      const promotion = await env.DB.prepare(
        "SELECT discount_type, discount_value FROM promotions WHERE UPPER(code) = ? AND active = 1 LIMIT 1"
      ).bind(couponCode).first();
      if (!promotion) return json({ error: "The coupon is invalid or inactive" }, 400);
      const value = Number(promotion.discount_value) || 0;
      discount = promotion.discount_type === "percentage"
        ? Math.round(subtotal * Math.min(value, 100) / 100)
        : Math.min(Math.max(value, 0), subtotal);
    }

    const settings = await env.DB.prepare(
      "SELECT delivery_fee_ilaro_min, delivery_fee_ilaro_max, logistics_provider FROM store_settings ORDER BY updated_at DESC LIMIT 1"
    ).first();

    const isPickup = fulfilment === "Pickup";
    const deliveryMin = isPickup ? 0 : Number(settings?.delivery_fee_ilaro_min ?? 1000);
    const deliveryMax = isPickup ? 0 : Number(settings?.delivery_fee_ilaro_max ?? 2000);
    const logisticsProvider = settings?.logistics_provider || "Josh Logistics";
    const deliveryNote = isPickup ? "" :
      `Delivery within Ilaro: ₦${deliveryMin.toLocaleString("en-NG")} – ₦${deliveryMax.toLocaleString("en-NG")} via ${logisticsProvider}`;

    const id = crypto.randomUUID();
    const total = Math.max(0, subtotal - discount);
    const order = {
      id,
      customer_name: customerName,
      customer_email: isPickup ? "" : String(body.customer_email || "").trim(),
      phone,
      address: isPickup ? "" : String(body.address || "").trim(),
      city: isPickup ? "" : String(body.city || "").trim(),
      state: isPickup ? "" : String(body.state || "").trim(),
      items: cleanItems,
      fulfilment_method: fulfilment,
      subtotal,
      delivery_fee: 0,
      delivery_fee_min: deliveryMin,
      delivery_fee_max: deliveryMax,
      delivery_info_note: deliveryNote,
      discount,
      total,
      status: "Awaiting Payment Confirmation",
      payment_status: "Unpaid",
      payment_reference: null,
      payment_confirmation_submitted: 0,
      payment_confirmation_date: null,
      coupon_code: discount > 0 ? couponCode : "",
    };

    await env.DB.prepare(
      `INSERT INTO orders (
        id, customer_name, customer_email, phone, address, city, state, items,
        fulfilment_method, subtotal, delivery_fee, delivery_fee_min, delivery_fee_max,
        delivery_info_note, discount, total, status, payment_status, coupon_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      order.id, order.customer_name, order.customer_email, order.phone, order.address,
      order.city, order.state, JSON.stringify(order.items), order.fulfilment_method,
      order.subtotal, order.delivery_fee, order.delivery_fee_min, order.delivery_fee_max,
      order.delivery_info_note, order.discount, order.total, order.status,
      order.payment_status, order.coupon_code
    ).run();

    return json({ order }, 201);
  } catch (error) {
    return json({ error: "Could not place order. Please try again." }, 500);
  }
}
