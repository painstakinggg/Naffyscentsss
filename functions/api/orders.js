import {json} from "./_auth.js";
export async function onRequestPost({request,env}) {
 if(!env.DB)return json({error:"Order service unavailable"},503);
 let b;try{b=await request.json()}catch{return json({error:"Invalid request"},400)}
 const name=String(b.customer_name||"").trim().slice(0,120),phone=String(b.phone||"").trim().slice(0,40),method=b.fulfilment_method==="Pickup"?"Pickup":"Logistics Delivery";
 if(!name||!phone)return json({error:"Name and phone number are required"},400);
 const itemsIn=Array.isArray(b.items)?b.items:[];if(!itemsIn.length||itemsIn.length>30)return json({error:"Your cart is empty or contains too many items"},400);
 try {
  const items=[];
  for(const item of itemsIn){
   const id=String(item.id||"");const qty=Math.floor(Number(item.quantity));
   if(!id||!Number.isInteger(qty)||qty<1||qty>50)return json({error:"Invalid cart item"},400);
   const p=await env.DB.prepare("SELECT id,name,price,size_ml,images,available,is_bundle FROM products WHERE id=?").bind(id).first();
   if(!p||!p.available)return json({error:"One of the products is no longer available"},409);
   let images=[];try{images=JSON.parse(p.images||"[]")}catch{}
   items.push({id:p.id,name:p.name,price:Number(p.price),size_ml:Number(item.size_ml||p.size_ml),quantity:qty,image:String(item.image||images[0]||""),is_bundle:Boolean(p.is_bundle)});
  }
  const subtotal=items.reduce((s,x)=>s+x.price*x.quantity,0);
  let discount=0,couponCode="";
  const code=String(b.coupon_code||"").trim().toUpperCase();
  if(code){
   const promo=await env.DB.prepare("SELECT code,discount_type,discount_value FROM promotions WHERE code=? AND active=1 LIMIT 1").bind(code).first();
   if(!promo)return json({error:"Coupon is invalid or inactive"},400);
   discount=promo.discount_type==="percentage"?Math.round(subtotal*Number(promo.discount_value)/100):Number(promo.discount_value);
   discount=Math.min(subtotal,Math.max(0,discount));couponCode=promo.code;
  }
  const settings=await env.DB.prepare("SELECT delivery_fee_ilaro_min,delivery_fee_ilaro_max,logistics_provider FROM store_settings ORDER BY updated_at DESC LIMIT 1").first();
  const min=method==="Pickup"?0:Number(settings?.delivery_fee_ilaro_min??1000),max=method==="Pickup"?0:Number(settings?.delivery_fee_ilaro_max??2000);
  const total=Math.max(0,subtotal-discount);
  const id=crypto.randomUUID();
  const row={id,customer_name:name,customer_email:method==="Pickup"?"":String(b.customer_email||"").trim().slice(0,254),phone,address:method==="Pickup"?"":String(b.address||"").trim().slice(0,500),city:method==="Pickup"?"":String(b.city||"").trim().slice(0,120),state:method==="Pickup"?"":String(b.state||"").trim().slice(0,120),items,fulfilment_method:method,subtotal,delivery_fee:0,delivery_fee_min:min,delivery_fee_max:max,delivery_info_note:method==="Pickup"?"":`Delivery within Ilaro: ₦${min} – ₦${max} via ${settings?.logistics_provider||"Josh Logistics"}`,discount,total,status:"Awaiting Payment Confirmation",payment_status:"Unpaid",coupon_code:couponCode};
  await env.DB.prepare("INSERT INTO orders (id,customer_name,customer_email,phone,address,city,state,items,fulfilment_method,subtotal,delivery_fee,delivery_fee_min,delivery_fee_max,delivery_info_note,discount,total,status,payment_status,coupon_code) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
   .bind(id,row.customer_name,row.customer_email,row.phone,row.address,row.city,row.state,JSON.stringify(items),method,subtotal,0,min,max,row.delivery_info_note,discount,total,row.status,row.payment_status,couponCode).run();
  return json({order:row},201);
 }catch{return json({error:"Could not place order. Please try again."},500)}
}
