import { onRequestPost } from "./import-images.js";

export async function onRequestGet({ request, env }) {
  const internalRequest = new Request(request.url, {
    method: "POST",
    headers: {
      authorization: "Bearer " + (env.IMAGE_IMPORT_TOKEN || ""),
    },
  });
  return onRequestPost({ request: internalRequest, env });
}
