const FALLBACK = "/dashboard";

/**
 * Accept only a same-origin relative path (plus its query and hash).
 * Rejects absolute URLs, protocol-relative paths, and backslash tricks
 * so a `next` parameter cannot become an open redirect.
 */
export function safeNextPath(input: string | null | undefined, fallback = FALLBACK): string {
  if (!input) return fallback;
  const value = input.trim();
  if (!value || value.length > 2000) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (/[\u0000\\]/.test(value) || value.includes("://")) return fallback;

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }
  if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.includes("\\") || decoded.includes("://")) {
    return fallback;
  }

  let url: URL;
  try {
    url = new URL(value, "http://localhost");
  } catch {
    return fallback;
  }
  if (url.origin !== "http://localhost" || url.username || url.password) return fallback;

  const path = url.pathname;
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return fallback;
  // Sending an authenticated visitor back to the login screen loops.
  if (path === "/login" || path.startsWith("/login/")) return fallback;

  return path + url.search + url.hash;
}
