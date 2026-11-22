import {requireAdmin,json} from "../../_auth.js";
export async function onRequestPatch({request,env,params}) {
 const gate=await requireAdmin(request,env.DB);if(gate.response)return gate.response;
 let body;try{body=await request.json()}catch{return json({error:"Invalid request"},400)}
 const sets=[],values=[];
 if(["Pending","Approved","Rejected"].includes(body.status)){sets.push("status=?");values.push(body.status);sets.push("approved=?");values.push(body.status==="Approved"?1:0);if(body.status==="Rejected"){sets.push("featured=0")}}
 if(typeof body.featured==="boolean"){sets.push("featured=?");values.push(body.featured?1:0)}
 if(!sets.length)return json({error:"No valid moderation change supplied"},400);
 const r=await env.DB.prepare(`UPDATE reviews SET ${sets.join(",")},updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(...values,params.id).run();
 return r.meta?.changes?json({ok:true}):json({error:"Review not found"},404);
}
export async function onRequestDelete({request,env,params}) {
 const gate=await requireAdmin(request,env.DB);if(gate.response)return gate.response;
 const r=await env.DB.prepare("DELETE FROM reviews WHERE id=?").bind(params.id).run();
 return r.meta?.changes?json({ok:true}):json({error:"Review not found"},404);
}
