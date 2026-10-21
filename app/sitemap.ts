import type { MetadataRoute } from "next";
import { INDUSTRIES } from "@/lib/industries";

const BASE = "https://cytron.com.au";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: "monthly", priority: 1 },
    ...INDUSTRIES.map((i) => ({ url: `${BASE}/${i.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
