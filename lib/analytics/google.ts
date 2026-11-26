/**
 * Google tag helpers for the Free Automation Assessment form.
 * Every export is a no-op unless the matching NEXT_PUBLIC id is set and,
 * in the browser, window.gtag exists. IDs are checked against a strict
 * pattern before they are written into the gtag snippet.
 */

export const GOOGLE_CONSENT_STORAGE_KEY = "cytron-google-consent";
export const GOOGLE_CLICK_IDS_STORAGE_KEY = "cytron-google-click-ids";

const GA_MEASUREMENT_ID = /^G-[A-Z0-9]+$/;
const GOOGLE_ADS_ID = /^AW-\d+$/;
const GOOGLE_ADS_LABEL = /^[A-Za-z0-9_-]+$/;
const CLICK_ID = /^[A-Za-z0-9_-]{1,200}$/;
const CLICK_ID_PARAMS = ["gclid", "gbraid", "wbraid"] as const;
const LEAD_EVENT_DEDUPE_MS = 10_000;

export type GoogleConsentChoice = "granted" | "denied";
export type GoogleClickIdParam = (typeof CLICK_ID_PARAMS)[number];
export type GoogleClickIds = Partial<Record<GoogleClickIdParam, string>>;

type Gtag = (...args: unknown[]) => void;
type KeyValueStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

export type GoogleTagConfig = {
  gaId: string | null;
  adsId: string | null;
  adsLabel: string | null;
  enhanced: boolean;
};

let lastLeadEventAt = Number.NEGATIVE_INFINITY;

export function resetGoogleLeadEventGuard(): void {
  lastLeadEventAt = Number.NEGATIVE_INFINITY;
}

function matched(value: string | undefined, pattern: RegExp): string | null {
  const trimmed = value?.trim() ?? "";
  return pattern.test(trimmed) ? trimmed : null;
}

export function readGoogleTagConfig(): GoogleTagConfig {
  // Direct NEXT_PUBLIC_ reads so Next can inline them into the client bundle.
  // A dynamic process.env[name] lookup stays empty in the browser.
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const googleAdsLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
  const googleAdsEnhanced = process.env.NEXT_PUBLIC_GOOGLE_ADS_ENHANCED;
  return {
    gaId: matched(gaMeasurementId, GA_MEASUREMENT_ID),
    adsId: matched(googleAdsId, GOOGLE_ADS_ID),
    adsLabel: matched(googleAdsLabel, GOOGLE_ADS_LABEL),
    enhanced: googleAdsEnhanced?.trim() === "true",
  };
}

export function isGoogleTagConfigured(): boolean {
  const { gaId, adsId } = readGoogleTagConfig();
  return Boolean(gaId || adsId);
}

export function googleTagLoaderId(): string | null {
  const { gaId, adsId } = readGoogleTagConfig();
  return gaId || adsId;
}

function consentUpdate(choice: GoogleConsentChoice) {
  return {
    ad_storage: choice,
    analytics_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
  };
}

export function googleTagBootstrapScript(): string {
  const { gaId, adsId, enhanced } = readGoogleTagConfig();
  const lines = [
    "window.dataLayer = window.dataLayer || [];",
    "function gtag(){dataLayer.push(arguments);}",
    "window.gtag = gtag;",
    "gtag('consent', 'default', {",
    "  ad_storage: 'denied',",
    "  analytics_storage: 'denied',",
    "  ad_user_data: 'denied',",
    "  ad_personalization: 'denied'",
    "});",
    "try {",
    `  var stored = localStorage.getItem('${GOOGLE_CONSENT_STORAGE_KEY}');`,
    "  if (stored === 'granted' || stored === 'denied') {",
    "    gtag('consent', 'update', {",
    "      ad_storage: stored,",
    "      analytics_storage: stored,",
    "      ad_user_data: stored,",
    "      ad_personalization: stored",
    "    });",
    "  }",
    "} catch (e) {}",
    "gtag('js', new Date());",
  ];
  if (gaId) lines.push(`gtag('config', '${gaId}');`);
  if (adsId && enhanced) lines.push(`gtag('config', '${adsId}', { allow_enhanced_conversions: true });`);
  else if (adsId) lines.push(`gtag('config', '${adsId}');`);
  return lines.join("\n");
}

function browserGtag(): Gtag | null {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return null;
  return window.gtag;
}

function browserStore(kind: "localStorage" | "sessionStorage"): KeyValueStore | null {
  if (typeof window === "undefined") return null;
  try {
    return window[kind];
  } catch {
    return null;
  }
}

export function readGoogleConsent(storage?: KeyValueStore): GoogleConsentChoice | null {
  const store = storage ?? browserStore("localStorage");
  if (!store) return null;
  try {
    const value = store.getItem(GOOGLE_CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function updateGoogleConsent(choice: GoogleConsentChoice): void {
  const gtag = browserGtag();
  if (!gtag) return;
  gtag("consent", "update", consentUpdate(choice));
}

export function writeGoogleConsent(choice: GoogleConsentChoice, storage?: KeyValueStore): void {
  const store = storage ?? browserStore("localStorage");
  if (store) {
    try {
      store.setItem(GOOGLE_CONSENT_STORAGE_KEY, choice);
    } catch {
      // Storage can throw in private mode. The click still updates gtag below.
    }
  }
  updateGoogleConsent(choice);
}

export function applyStoredGoogleConsent(storage?: KeyValueStore): GoogleConsentChoice | null {
  const choice = readGoogleConsent(storage);
  if (choice) updateGoogleConsent(choice);
  return choice;
}

export function readGoogleClickIds(storage?: KeyValueStore): GoogleClickIds {
  const store = storage ?? browserStore("sessionStorage");
  if (!store) return {};
  try {
    const raw = store.getItem(GOOGLE_CLICK_IDS_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const record = parsed as Record<string, unknown>;
    const ids: GoogleClickIds = {};
    for (const key of CLICK_ID_PARAMS) {
      const value = record[key];
      if (typeof value === "string" && CLICK_ID.test(value)) ids[key] = value;
    }
    return ids;
  } catch {
    return {};
  }
}

export function captureGoogleClickIds(search: string, storage?: KeyValueStore): GoogleClickIds {
  const store = storage ?? browserStore("sessionStorage");
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const found: GoogleClickIds = {};
  for (const key of CLICK_ID_PARAMS) {
    const value = params.get(key)?.trim() ?? "";
    if (CLICK_ID.test(value)) found[key] = value;
  }
  if (!store || Object.keys(found).length === 0) return found;
  const next = { ...readGoogleClickIds(store), ...found };
  try {
    store.setItem(GOOGLE_CLICK_IDS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    return found;
  }
  return next;
}

/** Trimmed, lowercased address. Empty or malformed values are omitted. */
export function normalizeLeadEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  if (!email || email.length > 200) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

/**
 * E.164 for the Ads user_data payload. A leading + keeps the typed country
 * code. Numbers without one are treated as Australian.
 */
export function normalizeLeadPhone(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  let normalized = digits;
  if (!trimmed.startsWith("+")) {
    if (digits.startsWith("0")) normalized = `61${digits.slice(1)}`;
    else if (!digits.startsWith("61")) normalized = `61${digits}`;
  }
  if (!/^[1-9]\d{7,14}$/.test(normalized)) return null;
  return `+${normalized}`;
}

function leadUserData(lead?: { email?: string; phone?: string }): { email?: string; phone_number?: string } | null {
  if (!lead) return null;
  const email = lead.email ? normalizeLeadEmail(lead.email) : null;
  const phone = lead.phone ? normalizeLeadPhone(lead.phone) : null;
  const data: { email?: string; phone_number?: string } = {};
  if (email) data.email = email;
  if (phone) data.phone_number = phone;
  return data.email || data.phone_number ? data : null;
}

function claimLeadEvent(now: number): boolean {
  if (now - lastLeadEventAt < LEAD_EVENT_DEDUPE_MS) return false;
  lastLeadEventAt = now;
  return true;
}

export function trackLeadAuditSubmitted(lead?: { email?: string; phone?: string }): void {
  const gtag = browserGtag();
  if (!gtag) return;

  const { gaId, adsId, adsLabel, enhanced } = readGoogleTagConfig();
  const sendLead = Boolean(gaId);
  const sendAds = Boolean(adsId && adsLabel);
  if (!sendLead && !sendAds) return;
  if (!claimLeadEvent(Date.now())) return;

  if (sendLead) {
    gtag("event", "generate_lead", {
      form_name: "contact",
      page_location: window.location.href,
    });
  }

  if (!sendAds || !adsId || !adsLabel) return;

  if (enhanced && readGoogleConsent() === "granted") {
    const userData = leadUserData(lead);
    // gtag hashes this before it leaves the browser. Do not log it.
    if (userData) gtag("set", "user_data", userData);
  }

  gtag("event", "conversion", {
    send_to: `${adsId}/${adsLabel}`,
    transaction_id: crypto.randomUUID(),
  });
}
