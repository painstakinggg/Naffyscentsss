import { createSession, hashPassword, json, cookie, validEmail, publicUser } from "../_auth.js";

const ADMIN_EMAIL = "painstaking.web@gmail.com";

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: "Authentication service unavailable" }, 503);
  if (!env.ADMIN_SETUP_TOKEN || env.ADMIN_SETUP_TOKEN.length < 32) {
    return json({ error: "Administrator setup has not been securely enabled yet" }, 503);
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request" }, 400); }

  const token = String(body.token || "");
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const fullName = String(body.full_name || "NAFFY SCENTS Administrator").trim().slice(0, 120);

  if (!safeEqual(token, env.ADMIN_SETUP_TOKEN)) {
    console.warn("NAFFY admin bootstrap token mismatch", {
      secretConfigured: typeof env.ADMIN_SETUP_TOKEN === "string" && env.ADMIN_SETUP_TOKEN.length >= 32,
      secretLength: typeof env.ADMIN_SETUP_TOKEN === "string" ? env.ADMIN_SETUP_TOKEN.length : 0,
      submittedTokenLength: token.length,
      lengthsMatch: typeof env.ADMIN_SETUP_TOKEN === "string" && token.length === env.ADMIN_SETUP_TOKEN.length,
      requestHost: new URL(request.url).host,
    });
    return json({ error: "Invalid setup token" }, 403);
  }
  if (email !== ADMIN_EMAIL || !validEmail(email)) return json({ error: "Administrator email is not permitted" }, 400);
  if (password.length < 12 || password.length > 128 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return json({ error: "Use a password of 12–128 characters containing letters and numbers" }, 400);
  }

  let stage = "prepare-account";
  try {
    const id = crypto.randomUUID();
    stage = "hash-password";
    const passwordHash = await hashPassword(password, (hashStage) => { stage = hashStage; });
    stage = "insert-admin";
    const result = await env.DB.prepare(
      "INSERT INTO users (id, email, password_hash, full_name, role, email_verified) SELECT ?, ?, ?, ?, 'admin', 0 WHERE NOT EXISTS (SELECT 1 FROM users)"
    ).bind(id, email, passwordHash, fullName || "NAFFY SCENTS Administrator").run();

    if (!result.meta?.changes) {
      return json({ error: "Setup is closed because an account already exists. Please use the normal login or recovery process." }, 409);
    }

    stage = "confirm-admin";
    const user = await env.DB.prepare(
      "SELECT id, email, full_name, role, email_verified FROM users WHERE id = ? LIMIT 1"
    ).bind(id).first();
    if (!user || user.role !== "admin") return json({ error: "Administrator account could not be confirmed" }, 500);

    stage = "create-session";
    const session = await createSession(env.DB, id);
    return json({ user: publicUser(user) }, 201, {
      "set-cookie": cookie("naffy_session", session.token, session.maxAge),
    });
  } catch (error) {
    console.error("NAFFY admin bootstrap failed", {
      stage,
      errorName: error?.name || "Error",
      errorMessage: String(error?.message || "Unknown error").slice(0, 500),
    });
    if (String(error?.message || "").toLowerCase().includes("unique")) {
      return json({ error: "An account already exists; setup is closed" }, 409);
    }
    return json({ error: "Unable to complete administrator setup", stage }, 500);
  }
}
