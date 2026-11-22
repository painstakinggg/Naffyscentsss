import { requireAdmin, json } from "../../_auth.js";
const arrays=["images","occasions","moods","bundle_items"], bools=["featured","bestseller","available","is_bundle"];
const fields=["name","slug","short_description","description","price","compare_at_price","category","gender","fragrance_family","top_notes","heart_notes","base_notes","size_ml","images","stock","featured","bestseller","rating","review_count","occasions","intensity","moods","available","is_bundle","bundle_items"];
export async function onRequestPatch({request,env,params}) {
 const gate=await requireAdmin(request,env.DB);if(gate.response)return gate.response;
 let body;try{body=await request.json()}catch{return json({error:"Invalid request"},400)}
 const updates=fields.filter(k=>Object.hasOwn(body,k));
 if(!updates.length)return json({error:"No valid fields supplied"},400);
 const values=updates.map(k=>arrays.includes(k)?JSON.stringify(Array.isArray(body[k])?body[k]:[]):bools.includes(k)?(body[k]?1:0):body[k]);
 try {
  const result=await env.DB.prepare(`UPDATE products SET ${updates.map(k=>k+" = ?").join(",")}, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(...values,params.id).run();
  if(!result.meta?.changes)return json({error:"Product not found"},404);
  return json({ok:true});
 }catch{return json({error:"Unable to update product"},400)}
}
export async function onRequestDelete({request,env,params}) {
 const gate=await requireAdmin(request,env.DB);if(gate.response)return gate.response;
 const result=await env.DB.prepare("DELETE FROM products WHERE id=?").bind(params.id).run();
 return result.meta?.changes?json({ok:true}):json({error:"Product not found"},404);
}
