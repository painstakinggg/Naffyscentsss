import { currentUser, digest, json, clearCookie } from "../_auth.js";

export async function onRequestPost({ request, env }) {
  if (env.DB) {
    const raw = request.headers.get("Cookie") || "";
    const token = raw.split(";").map((part) => part.trim()).find((part) => part.startsWith("naffy_session="))?.slice("naffy_session=".length);
    if (token) {
      try { await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(await digest(token)).run(); } catch {}
    }
  }
  return json({ success: true }, 200, { "set-cookie": clearCookie() });
}
