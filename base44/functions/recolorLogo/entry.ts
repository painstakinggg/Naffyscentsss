import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import OpenAI from 'npm:openai@6.45.0';

const DEFAULT_SOURCE = "https://i.ibb.co/whhz97DB/Snapchat-1012925652-removebg-preview.png";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    let body: any = {};
    try { body = await req.json(); } catch (e) {}
    const sourceUrl = body?.sourceUrl || DEFAULT_SOURCE;

    const imgRes = await fetch(sourceUrl);
    if (!imgRes.ok) return Response.json({ error: 'Could not fetch source logo' }, { status: 502 });
    const buf = await imgRes.arrayBuffer();
    const file = new File([buf], "logo.png", { type: "image/png" });

    const { baseURL, token } = base44.asServiceRole.aiGateway.connection();
    const client = new OpenAI({ baseURL, apiKey: token, maxRetries: 0 });

    const result: any = await client.images.edit({
      model: "gpt_image_2",
      prompt: "Recolor this exact logo using only two brand colors: deep dark maroon (#6B2424) and warm beige (#E8D9B8). Preserve the exact logo design, shape, text, layout, proportions, and composition. Do NOT redesign, do NOT add or remove elements, do NOT change the design concept. Only change the fill colors so the logo uses dark maroon and beige. Keep the background fully transparent.",
      image: file,
      output_format: "png",
      background: "transparent",
      n: 1,
    });

    const url = result?.data?.[0]?.url || null;
    const b64 = result?.data?.[0]?.b64_json || null;

    if (url) {
      return Response.json({ url, uploaded: false, usage: result?.usage || null });
    }
    if (b64) {
      const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const upFile = new File([bin], "logo-maroon-beige.png", { type: "image/png" });
      const out: any = await base44.asServiceRole.integrations.Core.UploadPublicFile({ file: upFile });
      return Response.json({ url: out.file_url, uploaded: true, usage: result?.usage || null });
    }
    return Response.json({ error: 'No image returned', raw: JSON.stringify(result?.data || {}) }, { status: 500 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}