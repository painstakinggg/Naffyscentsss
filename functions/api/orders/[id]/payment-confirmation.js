import {json} from "../../_auth.js";
export async function onRequestPost({env,params}) {
 const r=await env.DB.prepare("UPDATE orders SET payment_confirmation_submitted=1,payment_confirmation_date=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=? AND payment_status='Unpaid'").bind(params.id).run();
 return r.meta?.changes?json({ok:true}):json({error:"Order not found or payment already processed"},404);
}
