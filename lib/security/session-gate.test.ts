import { describe, expect, test } from "vitest";
import { accountLabel, panelSubtitle } from "@/lib/account-label";
import { unwrapCompany } from "@/lib/company-embed";
import { classifyRequestPath } from "@/lib/route-access";
import { safeNextPath } from "@/lib/safe-next";

describe("safeNextPath", () => {
  test("keeps a same-origin relative path and its query", () => {
    expect(safeNextPath("/jobs?tab=open")).toBe("/jobs?tab=open");
    expect(safeNextPath("/admin/clients/abc")).toBe("/admin/clients/abc");
  });

  test("defaults when the value is missing or absolute", () => {
    expect(safeNextPath(null)).toBe("/dashboard");
    expect(safeNextPath("")).toBe("/dashboard");
    expect(safeNextPath("https://evil.example/phish")).toBe("/dashboard");
    expect(safeNextPath("//evil.example")).toBe("/dashboard");
    expect(safeNextPath("/\\evil.example")).toBe("/dashboard");
    expect(safeNextPath("/%2f%2fevil.example")).toBe("/dashboard");
    expect(safeNextPath("/login")).toBe("/dashboard");
    expect(safeNextPath("/login?next=/jobs")).toBe("/dashboard");
  });
});

describe("account labels", () => {
  test("prefers the company, then the email, then a neutral label", () => {
    expect(accountLabel("Northside Electrical", "a@cytron.ai")).toBe("Northside Electrical");
    expect(accountLabel("  ", "a@cytron.ai")).toBe("a@cytron.ai");
    expect(accountLabel(null, null)).toBe("Account");
    expect(panelSubtitle("Northside Electrical", "a@cytron.ai")).toBe("Northside Electrical — Overview");
    expect(panelSubtitle(null, "a@cytron.ai")).toBe("a@cytron.ai — Overview");
    expect(panelSubtitle(null, null)).toBe("Overview");
  });
});

describe("company embed", () => {
  test("reads an object or the first row of an array", () => {
    expect(unwrapCompany({ id: "c1", name: "Northside" })?.name).toBe("Northside");
    expect(unwrapCompany([{ id: "c1", name: "Northside" }])?.id).toBe("c1");
    expect(unwrapCompany([])).toBeNull();
    expect(unwrapCompany(null)).toBeNull();
  });
});

describe("route classification", () => {
  test("keeps marketing, legal, auth and lead flows public", () => {
    for (const path of [
      "/",
      "/pricing",
      "/privacy",
      "/terms",
      "/trades",
      "/contact",
      "/forgot-password",
      "/reset-password",
      "/auth/callback",
      "/auth/signout",
      "/booking",
      "/audit",
      "/free-audit",
      "/solutions/old",
      "/icon.svg",
      "/api/lead-audit",
      "/api/booking",
      "/api/early-access",
      "/api/stripe/webhook",
      "/api/marketing/callback",
      "/api/warehouse/pack-confirm",
    ]) {
      expect(classifyRequestPath(path), path).toBe("public");
    }
  });

  test("treats login as its own screen and gates the app", () => {
    expect(classifyRequestPath("/login")).toBe("login");
    expect(classifyRequestPath("/login/")).toBe("login");
    for (const path of ["/dashboard", "/jobs", "/admin/clients/abc", "/warehouse/pick", "/onboarding", "/email-preview"]) {
      expect(classifyRequestPath(path), path).toBe("page");
    }
    expect(classifyRequestPath("/api/dashboard")).toBe("api");
    expect(classifyRequestPath("/api/stripe/checkout")).toBe("api");
    expect(classifyRequestPath("/api/marketing/post")).toBe("api");
    expect(classifyRequestPath("/api/marketing-posts")).toBe("api");
    expect(classifyRequestPath("/api/admin/clients")).toBe("api");
  });
});
