import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    let order;
    try {
      order = await req.json();
    } catch (e) {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (!order || (!order.id && !order.customer_name)) {
      return Response.json({ error: 'Missing order data' }, { status: 400 });
    }

    const items = Array.isArray(order.items) ? order.items : [];
    const itemList = items.map((i) => {
      const qty = Number(i.quantity) || 1;
      const lineTotal = Number(i.price || 0) * qty;
      const size = i.is_bundle ? ' (Combo)' : (i.size_ml ? ` (${i.size_ml}ml)` : '');
      return `• ${i.name || 'Item'}${size} × ${qty} — ₦${lineTotal.toLocaleString()}`;
    }).join('\n');

    const fulfilment = order.fulfilment_method || 'Logistics Delivery';
    const deliveryLine = fulfilment === 'Pickup'
      ? 'Pickup (₦0 delivery) — customer collects in store' + (order.pickup_hours ? ` (${order.pickup_hours})` : '')
      : `Delivery (Ilaro): ₦${Number(order.delivery_fee_min || 0).toLocaleString()} – ₦${Number(order.delivery_fee_max || 0).toLocaleString()} (final charge confirmed on confirmation)`;

    const subject = `New Naffy Scents Order — ${order.customer_name || 'Customer'}`;
    const body = `A new order has been placed on Naffy Scents.

Customer: ${order.customer_name || ''}
Phone: ${order.phone || ''}
Email: ${order.customer_email || '—'}
Address: ${order.address || ''}, ${order.city || ''}, ${order.state || ''}

Fulfilment: ${fulfilment}
${deliveryLine}

Items:
${itemList || '—'}

Subtotal: ₦${Number(order.subtotal || 0).toLocaleString()}
Discount: ₦${Number(order.discount || 0).toLocaleString()}
Delivery fee (recorded): ₦${Number(order.delivery_fee || 0).toLocaleString()}
Total: ₦${Number(order.total || 0).toLocaleString()}

Order reference: ${order.id || ''}
Coupon: ${order.coupon_code || '—'}
`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'Ekundayonofisat91@gmail.com',
      subject,
      body,
    });

    return Response.json({ ok: true, sent: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}