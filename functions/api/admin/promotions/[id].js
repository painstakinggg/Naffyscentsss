import {requireAdmin,json} from "../../_auth.js";
export async function onRequestPatch({request,env,params}) {
 const gate=await requireAdmin(request,env.DB);if(gate.response)return gate.response;
 let b;try{b=await request.json()}catch{return json({error:"Invalid request"},400)}
 if(typeof b.active!=="boolean")return json({error:"Invalid promotion status"},400);
 const r=await env.DB.prepare("UPDATE promotions SET active=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(b.active?1:0,params.id).run();
 return r.meta?.changes?json({ok:true}):json({error:"Promotion not found"},404);
}
export async function onRequestDelete({request,env,params}) {
 const gate=await requireAdmin(request,env.DB);if(gate.response)return gate.response;
 const r=await env.DB.prepare("DELETE FROM promotions WHERE id=?").bind(params.id).run();
 return r.meta?.changes?json({ok:true}):json({error:"Promotion not found"},404);
}
