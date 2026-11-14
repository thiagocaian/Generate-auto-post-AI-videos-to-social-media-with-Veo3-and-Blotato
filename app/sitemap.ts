import type { MetadataRoute } from "next";
import { INDUSTRIES } from "@/lib/industries";
import { NAV_LINKS } from "@/lib/site-routes";

const BASE = "https://cytronai.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: "monthly", priority: 1 },
    ...NAV_LINKS.map((l) => ({ url: `${BASE}${l.href}`, changeFrequency: "monthly" as const, priority: 0.9 })),
    ...INDUSTRIES.map((i) => ({ url: `${BASE}/${i.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
