import { createSession, hashPassword, json, cookie, validEmail, publicUser } from "../_auth.js";

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: "Authentication service unavailable" }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request" }, 400); }
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const fullName = String(body.full_name || "").trim().slice(0, 120);
  if (!validEmail(email)) return json({ error: "Enter a valid email address" }, 400);
  if (password.length < 10 || password.length > 128) return json({ error: "Password must be 10–128 characters" }, 400);
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return json({ error: "Password must include letters and numbers" }, 400);

  try {
    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    await env.DB.prepare("INSERT INTO users (id, email, password_hash, full_name, role, email_verified) VALUES (?, ?, ?, ?, 'user', 0)")
      .bind(id, email, passwordHash, fullName || null).run();
    const session = await createSession(env.DB, id);
    const user = await env.DB.prepare("SELECT id, email, full_name, role, email_verified FROM users WHERE id = ?").bind(id).first();
    return json({ user: publicUser(user) }, 201, { "set-cookie": cookie("naffy_session", session.token, session.maxAge) });
  } catch (error) {
    if (String(error?.message || "").toLowerCase().includes("unique")) return json({ error: "An account with this email already exists" }, 409);
    return json({ error: "Unable to create account" }, 500);
  }
}
