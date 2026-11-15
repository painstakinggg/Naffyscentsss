import { onRequestPost } from "./import-images.js";

export async function onRequestGet({ request, env }) {
  if (!env.DB || !env.IMAGE_IMPORT_TOKEN) {
    return new Response("Image import is not configured", { status: 503 });
  }

  const url = new URL(request.url);
  const supplied = url.searchParams.get("key") || "";
  if (!/^[a-f0-9]{64}$/.test(supplied)) {
    return new Response("Not found", { status: 404 });
  }

  // Atomically claim the short-lived token. A second request cannot run the importer.
  const claim = await env.DB.prepare(
    "UPDATE naffy_image_import_guard " +
    "SET consumed_at = CURRENT_TIMESTAMP " +
    "WHERE id = 1 AND token = ? AND consumed_at IS NULL " +
    "AND expires_at > CURRENT_TIMESTAMP RETURNING id"
  ).bind(supplied).first();

  if (!claim) {
    return new Response("This one-time import link is invalid, expired, or already used.", {
      status: 410,
      headers: { "cache-control": "no-store" },
    });
  }

  const internalRequest = new Request(new URL("/api/import-images", url.origin), {
    method: "POST",
    headers: { authorization: "Bearer " + env.IMAGE_IMPORT_TOKEN },
  });

  const result = await onRequestPost({ request: internalRequest, env });
  const body = await result.text();
  return new Response(body, {
    status: result.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
