import type { Metadata } from "next";

/** Production origin. Matches `metadataBase` in the root layout. */
const SITE_URL = "https://cytronai.com";

const DEFAULT_TITLE = "CYTRON — Specialists in automating repetitive office tasks";
const DEFAULT_DESCRIPTION =
  "Cytron specialises in automating repetitive office tasks for Australian trade, wholesale, e-commerce and warehouse operations. Back-office work runs on our own servers, with a free assessment and a read-only pilot first.";

/**
 * Next.js shallow-merges metadata. A child `openGraph` or `alternates`
 * object replaces the root one entirely, so every route that should not
 * inherit the homepage URL sets both its canonical and og:url here.
 */
export function pageMetadata(opts: {
  path: string;
  title?: string;
  description?: string;
  /** Login: keep the URL out of the index, but still self-canonical. */
  noindex?: boolean;
}): Metadata {
  const path = opts.path.startsWith("/") ? opts.path : `/${opts.path}`;
  const canonical = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  const title = opts.title ?? DEFAULT_TITLE;
  const description = opts.description ?? DEFAULT_DESCRIPTION;

  const metadata: Metadata = {
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "CYTRON",
      title,
      description,
      locale: "en_AU",
    },
  };

  if (opts.title) metadata.title = opts.title;
  if (opts.description) metadata.description = opts.description;
  if (opts.noindex) metadata.robots = { index: false, follow: true };

  return metadata;
}
