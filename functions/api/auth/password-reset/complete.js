import {json,digest,hashPassword} from "../../_auth.js";
export async function onRequestPost({request,env}) {
 let b;try{b=await request.json()}catch{return json({error:"Invalid request"},400)}
 const token=String(b.token||""),password=String(b.new_password||"");
 if(token.length!==64)return json({error:"This reset link is invalid or expired"},400);
 if(password.length<10||password.length>128||!/[A-Za-z]/.test(password)||!/[0-9]/.test(password))return json({error:"Password must be 10–128 characters and include letters and numbers"},400);
 const tokenHash=await digest(token),row=await env.DB.prepare("SELECT user_id FROM password_resets WHERE token_hash=? AND expires_at>? LIMIT 1").bind(tokenHash,new Date().toISOString()).first();
 if(!row)return json({error:"This reset link is invalid or expired"},400);
 const passwordHash=await hashPassword(password);
 await env.DB.prepare("UPDATE users SET password_hash=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(passwordHash,row.user_id).run();
 await env.DB.prepare("DELETE FROM password_resets WHERE user_id=?").bind(row.user_id).run();
 await env.DB.prepare("DELETE FROM sessions WHERE user_id=?").bind(row.user_id).run();
 return json({ok:true});
}