const STATIC_ASSETS = new Set([
  "product-gold-render.jpg",
  "product-amber-render.jpg",
  "product-smoky-render.jpg",
  "product-midnight-render.jpg",
  "product-frosted-render.jpg",
  "product-emerald-render.jpg",
  "product-onyx-render.jpg",
  "promo-banner-render.jpg",
  "category-her-render.jpg",
  "category-him-render.jpg",
  "brand-favicon-render.jpg",
  "social-og-render.jpg",
]);

export async function onRequestGet({ params, env }) {
  const filename = String(params.key || "");
  const isProductImage = /^naffy-[0-9]+\.(?:jpg|png|webp)$/.test(filename);
  const isStaticAsset = STATIC_ASSETS.has(filename);

  if (!isProductImage && !isStaticAsset) {
    return new Response("Not found", { status: 404 });
  }
  if (!env.MEDIA) return new Response("Media storage unavailable", { status: 503 });

  const objectKey = isProductImage
    ? "products/" + filename
    : "recovered-base44/" + filename;
  const object = await env.MEDIA.get(objectKey);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}
