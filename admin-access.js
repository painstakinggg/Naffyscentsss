// Client-side admin access allowlist.
// Grants dashboard access to specific trusted emails whose Base44 system
// role is "user" (role cannot be changed to "admin" on the Free plan),
// while keeping all existing role === "admin" users working.
//
// NOTE: This is a UI gate only, identical in trust level to the previous
// role === "admin" check. It does not change backend/data access.
const ADMIN_EMAILS = ["ekundayonofisat91@gmail.com"];

export const isAppAdmin = (user) =>
  user?.role === "admin" ||
  (Boolean(user?.email) && ADMIN_EMAILS.includes(user.email.toLowerCase()));