import { requireAdmin, json } from "../_auth.js";
const arrayFields = ["images","occasions","moods","bundle_items"];
const boolFields = ["featured","bestseller","available","is_bundle"];
const fields = ["name","slug","short_description","description","price","compare_at_price","category","gender","fragrance_family","top_notes","heart_notes","base_notes","size_ml","images","stock","featured","bestseller","rating","review_count","occasions","intensity","moods","available","is_bundle","bundle_items"];
const normalize = (row) => ({...row,...Object.fromEntries(arrayFields.map(k=>[k,parse(row[k])])),...Object.fromEntries(boolFields.map(k=>[k,Boolean(row[k])]))});
function parse(v){try{return JSON.parse(v||"[]")}catch{return []}}
export async function onRequestGet({request,env}) {
 const gate=await requireAdmin(request,env.DB); if(gate.response)return gate.response;
 try { const r=await env.DB.prepare("SELECT * FROM products ORDER BY created_at DESC,name ASC").all(); return json({products:(r.results||[]).map(normalize)}); }
 catch { return json({error:"Unable to load products"},500); }
}
export async function onRequestPost({request,env}) {
 const gate=await requireAdmin(request,env.DB); if(gate.response)return gate.response;
 let body; try{body=await request.json()}catch{return json({error:"Invalid request"},400)}
 if(!String(body.name||"").trim()||!Number.isFinite(Number(body.price))||Number(body.price)<0)return json({error:"Product name and valid price are required"},400);
 const id=crypto.randomUUID(), slug=String(body.slug||body.name).trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
 const values=fields.map(k=>arrayFields.includes(k)?JSON.stringify(Array.isArray(body[k])?body[k]:[]):boolFields.includes(k)?(body[k]?1:0):body[k]??(k==="price"?0:k==="compare_at_price"||k==="stock"||k==="review_count"?0:k==="size_ml"?100:k==="rating"?5:null));
 try {
  await env.DB.prepare(`INSERT INTO products (id,${fields.join(",")}) VALUES (${["? ",...fields.map(()=>"?")].join(",")})`).bind(id,...values).run();
  const row=await env.DB.prepare("SELECT * FROM products WHERE id=?").bind(id).first(); return json({product:normalize(row)},201);
 } catch(e){return json({error:String(e.message||"Unable to create product").includes("UNIQUE")?"A product with this slug already exists":"Unable to create product"},400)}
}
