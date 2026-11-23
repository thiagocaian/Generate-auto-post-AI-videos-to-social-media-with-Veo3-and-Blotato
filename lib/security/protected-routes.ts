// App routes that require a signed-in user. Middleware must gate these
// prefixes only. Unknown URLs are not in this list, so the app router can
// answer them with 404 instead of redirecting to /login.
//
// Intentionally not gated here (they enforce their own rules, or they are
// public): /api/*, /auth/callback, /login, /forgot-password, /reset-password,
// /onboarding, and the marketing/legal pages.

export const PROTECTED_APP_PREFIXES = [
  "/admin",
  "/billing",
  "/calendar",
  "/compliance",
  "/dashboard",
  "/email-preview",
  "/field-commander",
  "/invoices",
  "/jobs",
  "/marketing",
  "/materials",
  "/operator",
  "/platforms",
  "/quotes",
  "/reports",
  "/warehouse",
] as const;

const PROTECTED_EXACT = ["/auth/signout"] as const;

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

export function isProtectedAppPath(pathname: string) {
  const path = normalizePath(pathname);
  if (PROTECTED_EXACT.some((exact) => path === exact || path.startsWith(exact + "/"))) {
    return true;
  }
  return PROTECTED_APP_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(prefix + "/")
  );
}
