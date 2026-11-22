import { describe, expect, it } from "vitest";
import { hoursSummary } from "./hours-summary";

describe("hoursSummary", () => {
  it("sums only the picked rows of the example (6 + 4 + 3)", () => {
    expect(
      hoursSummary([
        { hours: 6, top: true },
        { hours: 4, top: true },
        { hours: 3, top: true },
        { hours: 2, top: false },
      ]),
    ).toBe("3 picked · 13 h / week");
  });

  it("handles nothing picked", () => {
    expect(hoursSummary([{ hours: 5, top: false }])).toBe("0 picked · 0 h / week");
  });
});
