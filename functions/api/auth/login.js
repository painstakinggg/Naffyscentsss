import { createSession, verifyPassword, json, cookie, validEmail, publicUser } from "../_auth.js";

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: "Authentication service unavailable" }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request" }, 400); }
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!validEmail(email) || !password || password.length > 128) return json({ error: "Invalid email or password" }, 400);
  try {
    const user = await env.DB.prepare("SELECT id, email, full_name, role, email_verified, password_hash FROM users WHERE email = ? LIMIT 1").bind(email).first();
    if (!user || !(await verifyPassword(password, user.password_hash))) return json({ error: "Invalid email or password" }, 401);
    const session = await createSession(env.DB, user.id);
    return json({ user: publicUser(user) }, 200, { "set-cookie": cookie("naffy_session", session.token, session.maxAge) });
  } catch {
    return json({ error: "Unable to sign in" }, 500);
  }
}
