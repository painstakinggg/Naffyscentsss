import {json} from "../_auth.js";
export async function onRequestPost({request,env}) {
 let b;try{b=await request.json()}catch{return json({error:"Invalid request"},400)}
 const code=String(b.code||"").trim().toUpperCase(),subtotal=Number(b.subtotal);
 if(!code||!Number.isFinite(subtotal)||subtotal<0)return json({error:"Enter a valid coupon"},400);
 const p=await env.DB.prepare("SELECT code,discount_type,discount_value FROM promotions WHERE code=? AND active=1 LIMIT 1").bind(code).first();
 if(!p)return json({error:"Invalid coupon"},404);
 const discount=Math.min(subtotal,Math.max(0,p.discount_type==="percentage"?Math.round(subtotal*p.discount_value/100):p.discount_value));
 return json({valid:true,code:p.code,discount});
}
