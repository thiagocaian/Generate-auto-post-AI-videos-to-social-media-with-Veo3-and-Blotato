// Public marketing routes. Shared by the nav, the page transitions, the
// background switch and the auth middleware so they never drift apart.

export const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Use cases", href: "/use-cases" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
] as const;

export const INDUSTRY_SLUGS = ["trades", "clinics", "real-estate", "hospitality", "retail", "professional-services"] as const;

/** Pages rendered inside app/(site): they share the header, footer and 3D transition. */
export const SITE_ROUTES: string[] = ["/", ...NAV_LINKS.map((l) => l.href), ...INDUSTRY_SLUGS.map((s) => `/${s}`)];

/** Public, no-login pages (site pages plus the legal pages). */
export const PUBLIC_MARKETING_ROUTES: string[] = [...SITE_ROUTES, "/privacy", "/terms"];

export function isSiteRoute(pathname: string) {
  const p = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  return SITE_ROUTES.includes(p);
}

/** Which nav item is active for a path. Industry pages live under "Use cases". */
export function activeNavHref(pathname: string): string | null {
  if (INDUSTRY_SLUGS.some((s) => pathname === `/${s}`)) return "/use-cases";
  const hit = NAV_LINKS.find((l) => pathname === l.href || pathname.startsWith(l.href + "/"));
  return hit ? hit.href : null;
}

/** Old single-page anchors (/#services, /#faq …) and where they live now. */
export const LEGACY_HASHES: Record<string, string> = {
  services: "/services",
  agents: "/services#agents",
  numbers: "/use-cases#numbers",
  industries: "/use-cases",
  case: "/use-cases#case",
  week: "/use-cases#week",
  how: "/how-it-works",
  pricing: "/pricing",
  faq: "/pricing#faq",
  audit: "/contact",
};
