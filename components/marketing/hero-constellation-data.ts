/** Decorative integration constellation behind the Cytron hero graph. */

export type ConstellationId =
  | "starshipit"
  | "shopify"
  | "xero"
  | "myob"
  | "excel"
  | "sheets"
  | "ads"
  | "gmail"
  | "calendar"
  | "outlook"
  | "hubspot"
  | "servicem8"
  | "square"
  | "whatsapp"
  | "stripe"
  | "woocommerce";

export type ConstellationTool = {
  id: ConstellationId;
  label: string;
  /** Origin of the mark, for the PR write-up. */
  source: "simple-icons" | "official";
};

export const CONSTELLATION_TOOLS: ConstellationTool[] = [
  { id: "starshipit", label: "Starshipit", source: "official" },
  { id: "shopify", label: "Shopify", source: "simple-icons" },
  { id: "xero", label: "Xero", source: "simple-icons" },
  { id: "myob", label: "MYOB", source: "simple-icons" },
  { id: "excel", label: "Microsoft Excel", source: "official" },
  { id: "sheets", label: "Google Sheets", source: "simple-icons" },
  { id: "ads", label: "Google Ads", source: "simple-icons" },
  { id: "gmail", label: "Gmail", source: "simple-icons" },
  { id: "calendar", label: "Google Calendar", source: "simple-icons" },
  { id: "outlook", label: "Microsoft Outlook", source: "official" },
  { id: "hubspot", label: "HubSpot", source: "simple-icons" },
  { id: "servicem8", label: "ServiceM8", source: "official" },
  { id: "square", label: "Square", source: "simple-icons" },
  { id: "whatsapp", label: "WhatsApp", source: "simple-icons" },
  { id: "stripe", label: "Stripe", source: "simple-icons" },
  { id: "woocommerce", label: "WooCommerce", source: "simple-icons" },
];

/** Meaningful pairs: tools that actually talk to each other in a Cytron flow. */
export const CONSTELLATION_EDGES: [ConstellationId, ConstellationId][] = [
  ["shopify", "starshipit"],
  ["shopify", "xero"],
  ["shopify", "woocommerce"],
  ["shopify", "stripe"],
  ["woocommerce", "starshipit"],
  ["woocommerce", "xero"],
  ["stripe", "xero"],
  ["square", "xero"],
  ["excel", "xero"],
  ["sheets", "xero"],
  ["servicem8", "xero"],
  ["servicem8", "myob"],
  ["myob", "excel"],
  ["ads", "hubspot"],
  ["hubspot", "gmail"],
  ["hubspot", "whatsapp"],
  ["gmail", "calendar"],
  ["outlook", "calendar"],
  ["outlook", "excel"],
  ["whatsapp", "servicem8"],
  ["gmail", "sheets"],
];

/** Match the foreground hero-flow loop so shimmers can stay loosely in phase. */
export const CONSTELLATION_LOOP_MS = 12_000;

/** Which edges shimmer during each window of the 12s hero pulse. */
export const SHIMMER_WINDOWS: { fromMs: number; toMs: number; edges: [ConstellationId, ConstellationId][] }[] = [
  { fromMs: 900, toMs: 2300, edges: [["whatsapp", "servicem8"], ["hubspot", "whatsapp"]] },
  { fromMs: 2500, toMs: 3900, edges: [["gmail", "calendar"], ["outlook", "calendar"]] },
  { fromMs: 4100, toMs: 5500, edges: [["ads", "hubspot"], ["hubspot", "gmail"]] },
  { fromMs: 5700, toMs: 7100, edges: [["shopify", "starshipit"], ["woocommerce", "starshipit"], ["shopify", "woocommerce"]] },
  { fromMs: 7300, toMs: 8700, edges: [["excel", "xero"], ["sheets", "xero"], ["stripe", "xero"], ["square", "xero"]] },
  { fromMs: 8900, toMs: 10400, edges: [["servicem8", "xero"], ["servicem8", "myob"]] },
];

type Anchor = {
  id: ConstellationId;
  x: number;
  y: number;
  amp: number;
  period: number;
  phase: number;
  xFrom?: "left" | "right";
  yFrom?: "top" | "bottom";
  xUnit?: "percent" | "px";
  yUnit?: "percent" | "px";
};

/** In the stacked (md–xl) layout, tile centres stay below this % of hero height so the copy is clear. */
export const STACKED_COPY_CLEARANCE_Y = 44;

/**
 * Positions are percentages of the hero section.
 * `wide` (xl, graph beside the copy) keeps a quiet zone over the headline.
 * `stacked` (md–xl) keeps every tile below the headline, subtitle and form.
 */
const WIDE: Anchor[] = [
  { id: "outlook", x: 6, y: 10, amp: 5, period: 14.2, phase: 0.2 },
  { id: "excel", x: 16, y: 7, amp: 6, period: 16.1, phase: 1.1 },
  { id: "ads", x: 5, y: 32, amp: 5, period: 12.8, phase: 2.4 },
  { id: "gmail", x: 8, y: 54, amp: 6, period: 15.4, phase: 0.7 },
  { id: "whatsapp", x: 6, y: 76, amp: 5, period: 13.6, phase: 3.0 },
  { id: "servicem8", x: 22, y: 86, amp: 6, period: 17.0, phase: 1.8 },
  { id: "myob", x: 40, y: 90, amp: 4, period: 14.8, phase: 2.2 },
  { id: "sheets", x: 50, y: 8, amp: 5, period: 13.2, phase: 0.4 },
  { id: "calendar", x: 62, y: 6, amp: 6, period: 15.8, phase: 2.8 },
  { id: "hubspot", x: 78, y: 9, amp: 5, period: 12.4, phase: 1.4 },
  { id: "shopify", x: 93, y: 18, amp: 6, period: 16.4, phase: 0.1 },
  { id: "starshipit", x: 94, y: 40, amp: 5, period: 14.0, phase: 2.0 },
  { id: "stripe", x: 93, y: 62, amp: 6, period: 15.1, phase: 3.3 },
  { id: "square", x: 88, y: 82, amp: 5, period: 13.9, phase: 0.9 },
  { id: "woocommerce", x: 70, y: 90, amp: 5, period: 16.8, phase: 2.6 },
  { id: "xero", x: 54, y: 88, amp: 6, period: 12.6, phase: 1.6 },
];

const STACKED: Anchor[] = [
  { id: "outlook", x: 6, y: 50, amp: 4, period: 14.2, phase: 0.2 },
  { id: "sheets", x: 22, y: 52, amp: 4, period: 13.2, phase: 0.4 },
  { id: "calendar", x: 93, y: 50, amp: 5, period: 15.8, phase: 2.8 },
  { id: "excel", x: 7, y: 62, amp: 5, period: 16.1, phase: 1.1 },
  { id: "xero", x: 48, y: 56, amp: 5, period: 12.6, phase: 1.6 },
  { id: "hubspot", x: 92, y: 62, amp: 5, period: 12.4, phase: 1.4 },
  { id: "ads", x: 8, y: 74, amp: 5, period: 12.8, phase: 2.4 },
  { id: "myob", x: 36, y: 72, amp: 4, period: 14.8, phase: 2.2 },
  { id: "stripe", x: 72, y: 70, amp: 5, period: 15.1, phase: 3.3 },
  { id: "shopify", x: 94, y: 74, amp: 5, period: 16.4, phase: 0.1 },
  { id: "gmail", x: 10, y: 86, amp: 5, period: 15.4, phase: 0.7 },
  { id: "whatsapp", x: 24, y: 88, amp: 5, period: 13.6, phase: 3.0 },
  { id: "servicem8", x: 40, y: 90, amp: 5, period: 17.0, phase: 1.8 },
  { id: "woocommerce", x: 58, y: 88, amp: 4, period: 16.8, phase: 2.6 },
  { id: "square", x: 76, y: 90, amp: 4, period: 13.9, phase: 0.9 },
  { id: "starshipit", x: 93, y: 86, amp: 5, period: 14.0, phase: 2.0 },
];

export type NodePoint = {
  id: ConstellationId;
  x: number;
  y: number;
};

/** Below md the constellation is a smaller 8-icon frame around the hero edges. */
export const MD_MIN = 768;
const XL_MIN = 1280;

export const DESKTOP_TILE = 44;
export const MOBILE_TILE = 32;

export function tileSizeFor(width: number) {
  return width < MD_MIN ? MOBILE_TILE : DESKTOP_TILE;
}

/**
 * Mobile copy starts after `pt-14` (56px). The graph column ends with `pb-12` plus
 * the flow's `py-6`, leaving about 72px clear at the bottom. Tiles (plus drift)
 * must stay inside those bands.
 */
export const MOBILE_TOP_BAND = 56;
export const MOBILE_BOTTOM_BAND = 56;

/** Preferred mobile set, in left-to-right order (top row, then bottom row). */
export const MOBILE_TOOL_IDS: ConstellationId[] = [
  "excel",
  "gmail",
  "ads",
  "servicem8",
  "starshipit",
  "shopify",
  "xero",
  "stripe",
];

/**
 * Fixed inset from the hero edges so the tiles sit in the padding, never on the
 * title, form, CTAs or mobile graph. `y` is in pixels from the named edge.
 */
const MOBILE: Anchor[] = [
  { id: "excel", x: 10, y: 22, yUnit: "px", yFrom: "top", amp: 3, period: 16.1, phase: 1.1 },
  { id: "gmail", x: 32, y: 22, yUnit: "px", yFrom: "top", amp: 3, period: 15.4, phase: 0.7 },
  { id: "ads", x: 68, y: 22, yUnit: "px", yFrom: "top", amp: 3, period: 12.8, phase: 2.4 },
  { id: "servicem8", x: 90, y: 22, yUnit: "px", yFrom: "top", amp: 3, period: 17.0, phase: 1.8 },
  { id: "starshipit", x: 10, y: 24, yUnit: "px", yFrom: "bottom", amp: 3, period: 14.0, phase: 2.0 },
  { id: "shopify", x: 32, y: 24, yUnit: "px", yFrom: "bottom", amp: 3, period: 16.4, phase: 0.1 },
  { id: "xero", x: 68, y: 24, yUnit: "px", yFrom: "bottom", amp: 3, period: 12.6, phase: 1.6 },
  { id: "stripe", x: 90, y: 24, yUnit: "px", yFrom: "bottom", amp: 3, period: 15.1, phase: 3.3 },
];

export function anchorsFor(width: number): Anchor[] {
  if (width < MD_MIN) return MOBILE;
  return width >= XL_MIN ? WIDE : STACKED;
}

function axisValue(
  value: number,
  size: number,
  unit: "percent" | "px" | undefined,
  from: "start" | "end" | "left" | "right" | "top" | "bottom" | undefined,
  end: "right" | "bottom",
) {
  const px = unit === "px" ? value : (value / 100) * size;
  return from === end || from === "end" ? size - px : px;
}

export function restPositions(width: number, height: number): NodePoint[] {
  return anchorsFor(width).map((a) => ({
    id: a.id,
    x: axisValue(a.x, width, a.xUnit, a.xFrom, "right"),
    y: axisValue(a.y, height, a.yUnit, a.yFrom, "bottom"),
  }));
}

/** Slow organic drift, a few pixels. `tMs` is wall time, not loop time. */
export function driftedPositions(
  width: number,
  height: number,
  tMs: number,
  reduced: boolean,
  parallax: { x: number; y: number } = { x: 0, y: 0 },
): NodePoint[] {
  const rest = restPositions(width, height);
  if (reduced) return rest;
  const anchors = anchorsFor(width);
  return rest.map((p, i) => {
    const a = anchors[i];
    const ang = (tMs / 1000) * ((Math.PI * 2) / a.period) + a.phase;
    return {
      id: p.id,
      x: p.x + Math.sin(ang) * a.amp + parallax.x,
      y: p.y + Math.cos(ang * 0.92) * a.amp + parallax.y,
    };
  });
}

export function edgeKey(a: ConstellationId, b: ConstellationId) {
  return a < b ? `${a}__${b}` : `${b}__${a}`;
}

export function activeShimmerKeys(loopMs: number): Set<string> {
  const t = ((loopMs % CONSTELLATION_LOOP_MS) + CONSTELLATION_LOOP_MS) % CONSTELLATION_LOOP_MS;
  const keys = new Set<string>();
  for (const w of SHIMMER_WINDOWS) {
    if (t >= w.fromMs && t < w.toMs) {
      for (const [a, b] of w.edges) keys.add(edgeKey(a, b));
    }
  }
  return keys;
}
