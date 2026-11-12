import {
  PUBLIC_AUTH_ROUTES,
  PUBLIC_LEGACY_ROUTES,
  PUBLIC_MARKETING_ROUTES,
} from "@/lib/site-routes";

export type RouteKind = "public" | "login" | "page" | "api";

/** Webhooks and lead forms. Everything else under /api requires a session. */
export const PUBLIC_API_PREFIXES = [
  "/api/lead-audit",
  "/api/booking",
  "/api/early-access",
  "/api/stripe/webhook",
  "/api/marketing/callback",
  "/api/warehouse/pack-confirm",
] as const;

export function normalizePath(pathname: string): string {
  const path = (pathname || "/").split("?")[0].split("#")[0];
  if (path.length > 1 && path.endsWith("/")) return path.replace(/\/+$/, "");
  return path || "/";
}

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

export function isPublicAsset(pathname: string) {
  return (
    /\.[a-z0-9]+$/i.test(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/opengraph-image") ||
    pathname.startsWith("/twitter-image") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/apple-icon") ||
    pathname.startsWith("/favicon") ||
    pathname === "/manifest.json"
  );
}

export function isPublicApi(pathname: string) {
  return PUBLIC_API_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
}

/**
 * public — marketing, legal, auth callback, legacy redirects, public APIs
 * login  — the sign-in page (signed-in visitors are sent to `next`)
 * page   — internal screens, redirect to /login when there is no session
 * api    — private data, 401 JSON when there is no session
 */
export function classifyRequestPath(pathname: string): RouteKind {
  const path = normalizePath(pathname);
  if (isPublicAsset(path)) return "public";
  if (path === "/login") return "login";
  if (path.startsWith("/api/")) return isPublicApi(path) ? "public" : "api";
  if ((PUBLIC_MARKETING_ROUTES as string[]).includes(path)) return "public";
  if ((PUBLIC_AUTH_ROUTES as readonly string[]).includes(path)) return "public";
  if ((PUBLIC_LEGACY_ROUTES as readonly string[]).includes(path)) return "public";
  if (path === "/solutions" || path.startsWith("/solutions/")) return "public";
  if (path === "/sitemap.xml" || path === "/robots.txt") return "public";
  return "page";
}
