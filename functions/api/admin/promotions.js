import {requireAdmin,json} from "../_auth.js";
export async function onRequestGet({request,env}) {
 const gate=await requireAdmin(request,env.DB);if(gate.response)return gate.response;
 const r=await env.DB.prepare("SELECT * FROM promotions ORDER BY created_at DESC LIMIT 200").all();return json({promotions:r.results||[]});
}
export async function onRequestPost({request,env}) {
 const gate=await requireAdmin(request,env.DB);if(gate.response)return gate.response;
 let b;try{b=await request.json()}catch{return json({error:"Invalid request"},400)}
 const title=String(b.title||"").trim(),code=String(b.code||"").trim().toUpperCase(),type=b.discount_type==="fixed"?"fixed":"percentage",value=Number(b.discount_value);
 if(!title||!code||!Number.isFinite(value)||value<=0||(type==="percentage"&&value>100))return json({error:"Enter a title, code and valid discount"},400);
 try{const id=crypto.randomUUID();await env.DB.prepare("INSERT INTO promotions(id,title,description,code,discount_type,discount_value,active) VALUES(?,?,?,?,?,?,?)").bind(id,title,String(b.description||""),code,type,value,b.active===false?0:1).run();return json({promotion:await env.DB.prepare("SELECT * FROM promotions WHERE id=?").bind(id).first()},201)}
 catch{return json({error:"Promotion code already exists or could not be created"},409)}
}
