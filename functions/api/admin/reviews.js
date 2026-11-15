import {requireAdmin,json} from "../_auth.js";
export async function onRequestGet({request,env}) {
 const gate=await requireAdmin(request,env.DB);if(gate.response)return gate.response;
 try{const r=await env.DB.prepare("SELECT * FROM reviews ORDER BY created_at DESC LIMIT 500").all();return json({reviews:(r.results||[]).map(x=>({...x,verified:Boolean(x.verified),featured:Boolean(x.featured),approved:Boolean(x.approved)}))})}
 catch{return json({error:"Unable to load reviews"},500)}
}
