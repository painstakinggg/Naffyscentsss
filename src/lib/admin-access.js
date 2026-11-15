// Admin status is granted only by the authenticated user's server-issued D1 role.
// Never grant admin access based on an email address or client-side allowlist.
export const isAppAdmin = (user) => user?.role === "admin";
