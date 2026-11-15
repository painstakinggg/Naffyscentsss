import {json} from "../_auth.js";
export async function onRequestPost({request,env}) {
 if(!env.DB||!env.ADMIN_BOOTSTRAP_TOKEN)return json({error:"Administrator bootstrap is not configured"},503);
 const supplied=request.headers.get("authorization")||"";
 if(supplied!=="Bearer "+env.ADMIN_BOOTSTRAP_TOKEN)return json({error:"Not found"},404);
 let b;try{b=await request.json()}catch{return json({error:"Invalid request"},400)}
 const email=String(b.email||"").trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:"Enter a valid registered email"},400);
 const count=await env.DB.prepare("SELECT COUNT(*) AS total FROM users WHERE role='admin'").first();
 if(Number(count?.total)>0)return json({error:"An administrator has already been configured"},409);
 const user=await env.DB.prepare("SELECT id FROM users WHERE email=? LIMIT 1").bind(email).first();
 if(!user)return json({error:"Register this email through the storefront before administrator setup"},404);
 await env.DB.prepare("UPDATE users SET role='admin',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(user.id).run();
 return json({ok:true,message:"The first administrator account is configured."});
}