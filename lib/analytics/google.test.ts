import { afterEach, describe, expect, it, vi } from "vitest";
import { createLeadAuditSchema } from "@/lib/validation/lead-audit";
import {
  GOOGLE_CLICK_IDS_STORAGE_KEY,
  GOOGLE_CONSENT_STORAGE_KEY,
  applyStoredGoogleConsent,
  captureGoogleClickIds,
  googleTagBootstrapScript,
  googleTagLoaderId,
  isGoogleTagConfigured,
  normalizeLeadEmail,
  normalizeLeadPhone,
  readGoogleClickIds,
  resetGoogleLeadEventGuard,
  trackLeadAuditSubmitted,
  writeGoogleConsent,
} from "./google";

const ENV_KEYS = [
  "NEXT_PUBLIC_GA_MEASUREMENT_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL",
  "NEXT_PUBLIC_GOOGLE_ADS_ENHANCED",
] as const;

type MemoryStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

function memoryStore(): MemoryStore {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

function installBrowser(store = memoryStore()) {
  const calls: unknown[][] = [];
  const logs: unknown[][] = [];
  vi.stubGlobal("window", {
    location: { href: "https://cytronai.com/contact?gclid=from-url" },
    localStorage: store,
    sessionStorage: store,
    gtag: (...args: unknown[]) => {
      calls.push(args);
    },
  });
  vi.spyOn(console, "log").mockImplementation((...args) => {
    logs.push(args);
  });
  vi.spyOn(console, "info").mockImplementation((...args) => {
    logs.push(args);
  });
  vi.spyOn(console, "debug").mockImplementation((...args) => {
    logs.push(args);
  });
  vi.spyOn(console, "warn").mockImplementation((...args) => {
    logs.push(args);
  });
  return { calls, logs, store };
}

afterEach(() => {
  resetGoogleLeadEventGuard();
  for (const key of ENV_KEYS) delete process.env[key];
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("google tag config", () => {
  it("stays off when the ids are missing or malformed", () => {
    expect(isGoogleTagConfigured()).toBe(false);
    expect(googleTagLoaderId()).toBeNull();
    expect(googleTagBootstrapScript()).not.toContain("gtag('config'");

    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-ABC');alert(1)";
    process.env.NEXT_PUBLIC_GOOGLE_ADS_ID = "AW-12;evil";
    expect(googleTagLoaderId()).toBeNull();
    expect(googleTagBootstrapScript()).not.toContain("alert");
    expect(googleTagBootstrapScript()).not.toContain("evil");
  });

  it("sets consent denied before config and loads only the ids that validate", () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST1234";
    process.env.NEXT_PUBLIC_GOOGLE_ADS_ID = "AW-1234567890";
    process.env.NEXT_PUBLIC_GOOGLE_ADS_ENHANCED = "true";

    const script = googleTagBootstrapScript();
    expect(googleTagLoaderId()).toBe("G-TEST1234");
    expect(script.indexOf("gtag('consent', 'default'")).toBeLessThan(script.indexOf("gtag('config'"));
    expect(script).toContain("ad_storage: 'denied'");
    expect(script).toContain("analytics_storage: 'denied'");
    expect(script).toContain("ad_user_data: 'denied'");
    expect(script).toContain("ad_personalization: 'denied'");
    expect(script).toContain("gtag('config', 'G-TEST1234');");
    expect(script).toContain("gtag('config', 'AW-1234567890', { allow_enhanced_conversions: true });");
  });
});

describe("trackLeadAuditSubmitted", () => {
  it("does nothing when gtag or the ids are missing", () => {
    const { calls } = installBrowser();
    trackLeadAuditSubmitted({ email: "jane@acme.com.au", phone: "0400000000" });
    expect(calls).toEqual([]);

    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST1234";
    vi.unstubAllGlobals();
    trackLeadAuditSubmitted({ email: "jane@acme.com.au" });
    expect(calls).toEqual([]);
  });

  it("sends generate_lead and one Ads conversion for a successful submit", () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST1234";
    process.env.NEXT_PUBLIC_GOOGLE_ADS_ID = "AW-1234567890";
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL = "leadLabel1";
    const { calls } = installBrowser();

    trackLeadAuditSubmitted();
    trackLeadAuditSubmitted();

    expect(calls).toEqual([
      ["event", "generate_lead", { form_name: "contact", page_location: "https://cytronai.com/contact?gclid=from-url" }],
      ["event", "conversion", { send_to: "AW-1234567890/leadLabel1", transaction_id: expect.any(String) }],
    ]);
  });

  it("sends normalized user_data only after consent when enhanced conversions are on", () => {
    process.env.NEXT_PUBLIC_GOOGLE_ADS_ID = "AW-1234567890";
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL = "leadLabel1";
    process.env.NEXT_PUBLIC_GOOGLE_ADS_ENHANCED = "true";
    const { calls, logs, store } = installBrowser();
    writeGoogleConsent("granted", store);

    trackLeadAuditSubmitted({ email: "  Jane@Acme.com.au ", phone: "0400 000 000" });

    expect(calls.map((call) => call[0])).toEqual(["consent", "set", "event"]);
    expect(calls[1]).toEqual(["set", "user_data", { email: "jane@acme.com.au", phone_number: "+61400000000" }]);
    expect(calls[2]?.[1]).toBe("conversion");
    expect(JSON.stringify(logs)).not.toContain("jane@acme.com.au");
    expect(JSON.stringify(logs)).not.toContain("+61400000000");
  });

  it("does not send user_data when consent is denied or the flag is off", () => {
    process.env.NEXT_PUBLIC_GOOGLE_ADS_ID = "AW-1234567890";
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL = "leadLabel1";
    process.env.NEXT_PUBLIC_GOOGLE_ADS_ENHANCED = "true";
    const denied = installBrowser();
    writeGoogleConsent("denied", denied.store);
    trackLeadAuditSubmitted({ email: "jane@acme.com.au", phone: "0400000000" });
    expect(denied.calls.some((call) => call[0] === "set")).toBe(false);

    resetGoogleLeadEventGuard();
    process.env.NEXT_PUBLIC_GOOGLE_ADS_ENHANCED = "false";
    const granted = installBrowser();
    writeGoogleConsent("granted", granted.store);
    trackLeadAuditSubmitted({ email: "jane@acme.com.au", phone: "0400000000" });
    expect(granted.calls.some((call) => call[0] === "set")).toBe(false);
  });
});

describe("consent and click ids", () => {
  it("stores the choice and updates gtag", () => {
    const { calls, store } = installBrowser();
    expect(applyStoredGoogleConsent(store)).toBeNull();
    writeGoogleConsent("granted", store);
    expect(store.getItem(GOOGLE_CONSENT_STORAGE_KEY)).toBe("granted");
    expect(calls.at(-1)?.[0]).toBe("consent");
    expect(calls.at(-1)?.[2]).toMatchObject({ ad_storage: "granted", analytics_storage: "granted" });
  });

  it("keeps gclid, gbraid and wbraid from the landing URL", () => {
    const store = memoryStore();
    captureGoogleClickIds("?gclid=click-1&gbraid=brand-1&utm_source=ads", store);
    captureGoogleClickIds("?wbraid=web-1", store);
    expect(readGoogleClickIds(store)).toEqual({ gclid: "click-1", gbraid: "brand-1", wbraid: "web-1" });
    expect(store.getItem(GOOGLE_CLICK_IDS_STORAGE_KEY)).not.toContain("utm_source");

    captureGoogleClickIds("?gclid=bad%20id", store);
    expect(readGoogleClickIds(store).gclid).toBe("click-1");
  });
});

describe("lead field normalization", () => {
  it("normalizes email and Australian phone numbers", () => {
    expect(normalizeLeadEmail("  Jane@Acme.com.au ")).toBe("jane@acme.com.au");
    expect(normalizeLeadEmail("not-an-email")).toBeNull();
    expect(normalizeLeadPhone("0400 000 000")).toBe("+61400000000");
    expect(normalizeLeadPhone("+1 (415) 555-2671")).toBe("+14155552671");
    expect(normalizeLeadPhone("")).toBeNull();
  });
});

describe("lead audit click ids", () => {
  it("accepts click ids on the request and drops them before storage", () => {
    const parsed = createLeadAuditSchema(new Date("2026-11-10T02:00:00.000Z")).safeParse({
      name: "Jane Smith",
      businessName: "Acme Plumbing",
      email: "jane@acme.com.au",
      consent: true,
      gclid: "click-1",
      gbraid: "brand-1",
      wbraid: "web-1",
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data).not.toHaveProperty("gclid");
    expect(parsed.data).not.toHaveProperty("gbraid");
    expect(parsed.data).not.toHaveProperty("wbraid");
  });
});
