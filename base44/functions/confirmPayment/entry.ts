import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    let body: any;
    try {
      body = await req.json();
    } catch (e) {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const orderId = body?.orderId || body?.order_id || body?.id;
    if (!orderId) {
      return Response.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const order: any = await base44.asServiceRole.entities.Order.get(orderId);
    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    // Prevent duplicate payment-confirmation submissions
    if (order.payment_confirmation_submitted) {
      return Response.json({ ok: true, already_submitted: true, sent: false });
    }

    await base44.asServiceRole.entities.Order.update(orderId, {
      status: 'Awaiting Payment Confirmation',
      payment_status: 'Pending',
      payment_confirmation_submitted: true,
      payment_confirmation_date: new Date().toISOString(),
    });

    const items = Array.isArray(order.items) ? order.items : [];
    const itemList = items.map((i: any) => {
      const qty = Number(i.quantity) || 1;
      const lineTotal = Number(i.price || 0) * qty;
      const size = i.is_bundle ? ' (Combo)' : (i.size_ml ? ` (${i.size_ml}ml)` : '');
      return `• ${i.name || 'Item'}${size} × ${qty} — ₦${lineTotal.toLocaleString()}`;
    }).join('\n');

    const fulfilment = order.fulfilment_method || 'Logistics Delivery';
    const deliveryLine = fulfilment === 'Pickup'
      ? 'Pickup (₦0 delivery) — customer collects in store'
      : `Delivery (Ilaro): ₦${Number(order.delivery_fee_min || 0).toLocaleString()} – ₦${Number(order.delivery_fee_max || 0).toLocaleString()} (final charge confirmed on verification)`;

    const ref = (order.id || '').slice(-8).toUpperCase();
    const subject = `Payment Confirmation — ${order.customer_name || 'Customer'} · ${ref}`;
    const emailBody = `A customer has clicked "I've Paid" for their Naffy Scents order.

⚠️ Payment still needs to be manually verified before this order is fulfilled.

Order number: ${order.id || ''}
Customer: ${order.customer_name || ''}
Phone: ${order.phone || ''}
Email: ${order.customer_email || '—'}
Fulfilment: ${fulfilment}
${deliveryLine}

Items:
${itemList || '—'}

Subtotal: ₦${Number(order.subtotal || 0).toLocaleString()}
Delivery fee (recorded): ₦${Number(order.delivery_fee || 0).toLocaleString()}
Total: ₦${Number(order.total || 0).toLocaleString()}

Order date/time: ${order.created_date || new Date().toISOString()}

The customer has submitted a payment confirmation. Please verify the bank transfer and mark the order as Confirmed once verified.
`;

    let emailSent = false;
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'Ekundayonofisat91@gmail.com',
        subject,
        body: emailBody,
      });
      emailSent = true;
    } catch (emailErr) {
      // Order state is already updated; email delivery may require a registered recipient or paid plan + custom domain.
    }

    return Response.json({ ok: true, sent: emailSent, already_submitted: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}