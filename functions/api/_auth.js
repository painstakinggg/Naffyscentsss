const encoder = new TextEncoder();
const SESSION_SECONDS = 60 * 60 * 24 * 14;
const ITERATIONS = 310000;

export const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
});

const toBase64Url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
const fromBase64Url = (value) => Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

export async function hashPassword(password, onStage = () => {}) {
  onStage("hash-generate-salt");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  onStage("hash-import-key");
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  onStage("hash-derive-bits");
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS }, key, 256);
  onStage("hash-encode-result");
  return `pbkdf2_sha256$${ITERATIONS}$${toBase64Url(salt)}$${toBase64Url(bits)}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, iterationsText, saltText, expectedText] = String(stored || "").split("$");
  if (scheme !== "pbkdf2_sha256") return false;
  const iterations = Number(iterationsText);
  if (!Number.isInteger(iterations) || iterations < 100000 || iterations > 1000000) return false;
  const salt = fromBase64Url(saltText);
  const expected = fromBase64Url(expectedText);
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const actual = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256));
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

export async function digest(value) {
  return toBase64Url(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

export function cookie(name, value, maxAge) {
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearCookie() {
  return cookie("naffy_session", "", 0);
}

export async function createSession(db, userId) {
  const token = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = await digest(token);
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000).toISOString();
  await db.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)").bind(tokenHash, userId, expiresAt).run();
  return { token, maxAge: SESSION_SECONDS };
}

export async function currentUser(request, db) {
  const raw = request.headers.get("Cookie") || "";
  const token = raw.split(";").map((part) => part.trim()).find((part) => part.startsWith("naffy_session="))?.slice("naffy_session=".length);
  if (!token || !db) return null;
  const tokenHash = await digest(token);
  const row = await db.prepare(
    "SELECT u.id, u.email, u.full_name, u.role, u.email_verified FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > ? LIMIT 1"
  ).bind(tokenHash, new Date().toISOString()).first();
  return row || null;
}

export const publicUser = (user) => user ? ({
  id: user.id, email: user.email, full_name: user.full_name, role: user.role, email_verified: Boolean(user.email_verified),
}) : null;

export function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export async function requireAdmin(request, db) {
  const user = await currentUser(request, db);
  if (!user) return { user: null, response: json({ error: "Authentication required" }, 401) };
  if (user.role !== "admin") return { user: null, response: json({ error: "Administrator access required" }, 403) };
  return { user, response: null };
}
