import {requireAdmin,json} from "../_auth.js";
export async function onRequestPost({request,env}) {
 const gate=await requireAdmin(request,env.DB);if(gate.response)return gate.response;
 if(!env.MEDIA)return json({error:"Image storage is not configured"},503);
 const form=await request.formData().catch(()=>null);const file=form?.get("file");
 if(!file||typeof file.arrayBuffer!=="function")return json({error:"Choose an image file"},400);
 const types={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
 const ext=types[file.type];if(!ext)return json({error:"Only JPG, PNG and WebP images are supported"},415);
 if(file.size>8*1024*1024)return json({error:"Image must be 8 MB or smaller"},413);
 const bytes=await file.arrayBuffer();if(!bytes.byteLength)return json({error:"Image file is empty"},400);
 const filename="naffy-"+Date.now()+Math.floor(Math.random()*1000000)+"."+ext;
 const key="products/"+filename;
 await env.MEDIA.put(key,bytes,{httpMetadata:{contentType:file.type}});
 return json({file_url:"/api/media/"+filename},201);
}