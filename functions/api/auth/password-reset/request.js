import {json,digest} from "../../_auth.js";
export async function onRequestPost({request,env}) {
 if(!env.DB)return json({error:"Password reset is unavailable"},503);
 let b;try{b=await request.json()}catch{return json({error:"Invalid request"},400)}
 const email=String(b.email||"").trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return json({error:"Enter a valid email address"},400);
 if(!env.RESEND_API_KEY||!env.EMAIL_FROM)return json({error:"Password reset email is not configured yet. Please contact the store administrator."},503);
 const user=await env.DB.prepare("SELECT id,email FROM users WHERE email=? LIMIT 1").bind(email).first();
 if(user){
  const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,"0")).join("");
  const tokenHash=await digest(token),expires=new Date(Date.now()+30*60*1000).toISOString();
  await env.DB.prepare("DELETE FROM password_resets WHERE user_id=?").bind(user.id).run();
  await env.DB.prepare("INSERT INTO password_resets(token_hash,user_id,expires_at) VALUES(?,?,?)").bind(tokenHash,user.id,expires).run();
  const origin=new URL(request.url).origin,link=origin+"/reset-password?token="+encodeURIComponent(token);
  const mail=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"authorization":"Bearer "+env.RESEND_API_KEY,"content-type":"application/json"},body:JSON.stringify({from:env.EMAIL_FROM,to:[email],subject:"Reset your Naffy Scents password",html:`<p>We received a request to reset your Naffy Scents password.</p><p><a href="${link}">Reset password</a></p><p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>`})});
  if(!mail.ok)return json({error:"Unable to send reset email. Please try again later."},502);
 }
 return json({message:"If an account exists with that email, a reset link will be sent."});
}