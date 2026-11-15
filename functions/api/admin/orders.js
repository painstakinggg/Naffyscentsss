import {requireAdmin,json} from "../_auth.js";
export async function onRequestGet({request,env}) {
 const gate=await requireAdmin(request,env.DB);if(gate.response)return gate.response;
 try{const r=await env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 500").all();return json({orders:(r.results||[]).map(o=>({...o,items:parse(o.items),payment_confirmation_submitted:Boolean(o.payment_confirmation_submitted)}))})}
 catch{return json({error:"Unable to load orders"},500)}
}
function parse(v){try{return JSON.parse(v||"[]")}catch{return []}}
