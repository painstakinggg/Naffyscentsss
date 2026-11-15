export async function onRequestGet({ params, env }) {
  const filename = String(params.key || "");
  if (!/^naffy-[0-9]+\.(?:jpg|png|webp)$/.test(filename)) {
    return new Response("Not found", { status: 404 });
  }
  if (!env.MEDIA) return new Response("Media storage unavailable", { status: 503 });

  const object = await env.MEDIA.get("products/" + filename);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}
