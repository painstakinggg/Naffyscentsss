const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  },
});

export async function onRequestPost({ request, env }) {
  const supplied = request.headers.get("authorization") || "";
  if (!env.IMAGE_IMPORT_TOKEN || supplied !== "Bearer " + env.IMAGE_IMPORT_TOKEN) {
    return json({ ok: false, error: "Not found" }, 404);
  }
  if (!env.DB || !env.MEDIA) {
    return json({ ok: false, error: "D1 or R2 binding is missing" }, 503);
  }

  const rows = await env.DB.prepare(
    "SELECT id, name, images FROM products WHERE images IS NOT NULL ORDER BY name"
  ).all();

  const results = [];
  for (const product of rows.results || []) {
    let sources;
    try {
      sources = JSON.parse(product.images);
    } catch {
      results.push({ id: product.id, name: product.name, status: "skipped", reason: "Invalid images JSON" });
      continue;
    }

    const source = Array.isArray(sources) ? sources[0] : null;
    if (typeof source !== "string" || !source.startsWith("https://images.pexels.com/")) {
      results.push({ id: product.id, name: product.name, status: "skipped", reason: "No Pexels source URL" });
      continue;
    }

    try {
      const parsed = new URL(source);
      if (parsed.hostname !== "images.pexels.com") throw new Error("Unapproved image host");

      const response = await fetch(source, {
        headers: { "user-agent": "NAFFY-SCENTS-IMAGE-IMPORT/1.0" },
        redirect: "follow",
      });
      if (!response.ok) throw new Error("Pexels returned HTTP " + response.status);
      const finalUrl = new URL(response.url);
      if (finalUrl.hostname !== "images.pexels.com") throw new Error("Image redirected to an unapproved host");

      const contentType = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
      const extensions = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };
      const extension = extensions[contentType];
      if (!extension) throw new Error("Unsupported image type: " + (contentType || "unknown"));

      const declaredSize = Number(response.headers.get("content-length") || 0);
      if (declaredSize > 8 * 1024 * 1024) throw new Error("Image exceeds 8 MB limit");
      const bytes = await response.arrayBuffer();
      if (!bytes.byteLength || bytes.byteLength > 8 * 1024 * 1024) throw new Error("Image is empty or exceeds 8 MB limit");

      const filename = product.id + "." + extension;
      const objectKey = "products/" + filename;
      await env.MEDIA.put(objectKey, bytes, {
        httpMetadata: { contentType },
        customMetadata: { productId: product.id, source: "Pexels" },
      });

      const imagePath = "/api/media/" + filename;
      await env.DB.prepare("UPDATE products SET images = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(JSON.stringify([imagePath]), product.id)
        .run();

      results.push({ id: product.id, name: product.name, status: "uploaded", bytes: bytes.byteLength, path: imagePath });
    } catch (error) {
      results.push({
        id: product.id,
        name: product.name,
        status: "failed",
        reason: error instanceof Error ? error.message : "Unknown import error",
      });
    }
  }

  const uploaded = results.filter(item => item.status === "uploaded").length;
  const failed = results.filter(item => item.status === "failed").length;
  return json({
    ok: failed === 0 && uploaded === results.length && results.length > 0,
    total: results.length,
    uploaded,
    failed,
    skipped: results.length - uploaded - failed,
    results,
  }, failed > 0 ? 207 : 200);
}
