import {requireAdmin,json} from "../../_auth.js";
const statuses=["Awaiting Payment Confirmation","Confirmed","Picked Up","Delivered","Canceled"];
const paymentStatuses=["Unpaid","Pending","Paid"];
export async function onRequestPatch({request,env,params}) {
 const gate=await requireAdmin(request,env.DB);if(gate.response)return gate.response;
 let body;try{body=await request.json()}catch{return json({error:"Invalid request"},400)}
 const sets=[],values=[];
 if(body.status!==undefined){if(!statuses.includes(body.status))return json({error:"Invalid order status"},400);sets.push("status=?");values.push(body.status)}
 if(body.payment_status!==undefined){if(!paymentStatuses.includes(body.payment_status))return json({error:"Invalid payment status"},400);sets.push("payment_status=?");values.push(body.payment_status)}
 if(!sets.length)return json({error:"No valid order update supplied"},400);
 sets.push("updated_at=CURRENT_TIMESTAMP");
 const result=await env.DB.prepare(`UPDATE orders SET ${sets.join(",")} WHERE id=?`).bind(...values,params.id).run();
 return result.meta?.changes?json({ok:true}):json({error:"Order not found"},404);
}