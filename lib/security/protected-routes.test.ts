import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PROTECTED_APP_PREFIXES, isProtectedAppPath } from "./protected-routes";

const root = path.resolve(__dirname, "../..");

describe("protected app routes", () => {
  it("gates real app prefixes and their sub-routes", () => {
    for (const prefix of PROTECTED_APP_PREFIXES) {
      expect(isProtectedAppPath(prefix)).toBe(true);
      expect(isProtectedAppPath(prefix + "/")).toBe(true);
      expect(isProtectedAppPath(prefix + "/nested")).toBe(true);
    }
    expect(isProtectedAppPath("/admin/audits/abc")).toBe(true);
    expect(isProtectedAppPath("/dashboard/settings")).toBe(true);
    expect(isProtectedAppPath("/warehouse/pick")).toBe(true);
    expect(isProtectedAppPath("/warehouse/scan")).toBe(true);
    expect(isProtectedAppPath("/auth/signout")).toBe(true);
    expect(isProtectedAppPath("/auth/signout/extra")).toBe(true);
  });

  it("does not gate unknown or public URLs", () => {
    const open = [
      "/",
      "/services",
      "/how-it-works",
      "/use-cases",
      "/pricing",
      "/contact",
      "/privacy",
      "/terms",
      "/login",
      "/forgot-password",
      "/reset-password",
      "/onboarding",
      "/auth/callback",
      "/api/dashboard",
      "/api/admin",
      "/this-page-does-not-exist-qa",
      "/.git/HEAD",
      "/.env",
      "/favicon.ico",
      "/dashboarding",
      "/administration",
    ];
    for (const pathname of open) {
      expect(isProtectedAppPath(pathname), pathname).toBe(false);
    }
  });

  it("classifies every top-level app directory", () => {
    const publicDirs = new Set([
      "(site)",
      "api",
      "auth",
      "forgot-password",
      "login",
      "onboarding",
      "privacy",
      "reset-password",
      "terms",
    ]);
    for (const entry of readdirSync(path.join(root, "app"))) {
      if (!statSync(path.join(root, "app", entry)).isDirectory()) continue;
      if (publicDirs.has(entry)) {
        expect(isProtectedAppPath("/" + entry), entry).toBe(false);
      } else {
        expect(isProtectedAppPath("/" + entry), entry).toBe(true);
      }
    }
  });

  it("does not gate files served from public/", () => {
    const publicRoot = path.join(root, "public");
    const walk = (dir: string, prefix = ""): string[] => {
      const out: string[] = [];
      for (const entry of readdirSync(dir)) {
        const abs = path.join(dir, entry);
        const rel = prefix ? `${prefix}/${entry}` : entry;
        if (statSync(abs).isDirectory()) out.push(...walk(abs, rel));
        else out.push("/" + rel);
      }
      return out;
    };
    const files = walk(publicRoot);
    expect(files.length).toBeGreaterThan(0);
    for (const pathname of files) {
      expect(isProtectedAppPath(pathname), pathname).toBe(false);
    }
  });

  it("keeps the middleware matcher aligned with the protected prefixes", () => {
    const src = readFileSync(path.join(root, "middleware.ts"), "utf8");
    const matcher = src.slice(src.indexOf("export const config"));
    expect(matcher).toContain("'/login'");
    expect(matcher).toContain("'/auth/signout'");
    expect(matcher).toContain("'/auth/signout/:path*'");
    for (const prefix of PROTECTED_APP_PREFIXES) {
      expect(matcher).toContain(`'${prefix}'`);
      expect(matcher).toContain(`'${prefix}/:path*'`);
    }
    expect(matcher).not.toContain("(?!_next/static");
  });
});
