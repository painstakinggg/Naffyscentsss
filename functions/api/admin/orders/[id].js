import {requireAdmin,json} from "../../_auth.js";
const statuses=["Awaiting Payment Confirmation","Confirmed","Picked Up","Delivered","Canceled"];
export async function onRequestPatch({request,env,params}) {
 const gate=await requireAdmin(request,env.DB);if(gate.response)return gate.response;
 let body;try{body=await request.json()}catch{return json({error:"Invalid request"},400)}
 if(!statuses.includes(body.status))return json({error:"Invalid order status"},400);
 const result=await env.DB.prepare("UPDATE orders SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(body.status,params.id).run();
 return result.meta?.changes?json({ok:true}):json({error:"Order not found"},404);
}
