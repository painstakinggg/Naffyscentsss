import {json} from "./_auth.js";
export async function onRequestGet({env}) {
 try { const r=await env.DB.prepare("SELECT id,product_id,product_name,customer_name,rating,review,location,verified,created_at FROM reviews WHERE featured=1 AND (approved=1 OR status='Approved') ORDER BY created_at DESC LIMIT 12").all(); return json({reviews:(r.results||[]).map(x=>({...x,verified:Boolean(x.verified)}))}); }
 catch { return json({error:"Unable to load reviews"},500); }
}
export async function onRequestPost({request,env}) {
 let b;try{b=await request.json()}catch{return json({error:"Invalid request"},400)}
 const name=String(b.customer_name||"").trim().slice(0,120),review=String(b.review||"").trim().slice(0,3000),rating=Number(b.rating),email=String(b.email||"").trim().toLowerCase().slice(0,254),orderNumber=String(b.order_number||"").trim().toUpperCase().slice(0,8);
 if(!name||review.length<5||!Number.isInteger(rating)||rating<1||rating>5)return json({error:"Enter your name, a review and a 1–5 star rating"},400);
 let productId=String(b.product_id||"").trim()||null,productName=String(b.product_name||"").trim().slice(0,160);
 if(productId){const p=await env.DB.prepare("SELECT id,name FROM products WHERE id=?").bind(productId).first();if(!p)return json({error:"Product not found"},404);productName=p.name}
 let verified=0;
 if(orderNumber&&email){const order=await env.DB.prepare("SELECT id FROM orders WHERE upper(substr(id,-8))=? AND lower(customer_email)=? LIMIT 1").bind(orderNumber,email).first();verified=order?1:0}
 const id=crypto.randomUUID();
 await env.DB.prepare("INSERT INTO reviews(id,product_id,product_name,customer_name,email,rating,review,order_number,verified,featured,approved,status) VALUES(?,?,?,?,?,?,?,?,?,0,0,'Pending')").bind(id,productId,productName,name,email,rating,review,orderNumber,verified).run();
 return json({ok:true},201);
}
