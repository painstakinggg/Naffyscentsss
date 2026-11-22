import { currentUser, json, publicUser } from "../_auth.js";

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ error: "Authentication service unavailable" }, 503);
  try {
    const user = await currentUser(request, env.DB);
    return user ? json({ user: publicUser(user) }) : json({ user: null }, 401);
  } catch {
    return json({ error: "Unable to verify session" }, 500);
  }
}
