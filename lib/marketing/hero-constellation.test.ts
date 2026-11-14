import assert from "node:assert/strict";
import { describe, test } from "vitest";
import {
  CONSTELLATION_EDGES,
  CONSTELLATION_TOOLS,
  STACKED_COPY_CLEARANCE_Y,
  activeShimmerKeys,
  driftedPositions,
  edgeKey,
  restPositions,
  type ConstellationId,
} from "@/components/marketing/hero-constellation-data";

const IDS = CONSTELLATION_TOOLS.map((t) => t.id);

describe("hero constellation", () => {
  test("includes 16 tools Cytron can integrate with, including Starshipit", () => {
    assert.equal(CONSTELLATION_TOOLS.length, 16);
    const wanted = [
      "starshipit",
      "shopify",
      "xero",
      "myob",
      "excel",
      "sheets",
      "ads",
      "gmail",
      "calendar",
      "outlook",
      "hubspot",
      "servicem8",
      "square",
      "whatsapp",
      "stripe",
      "woocommerce",
    ];
    assert.deepEqual([...IDS].sort(), [...wanted].sort());
    assert.equal(CONSTELLATION_TOOLS.find((t) => t.id === "starshipit")?.source, "official");
  });

  test("every edge connects two known tools and includes the meaningful pairs", () => {
    const idSet = new Set(IDS);
    for (const [a, b] of CONSTELLATION_EDGES) {
      assert.notEqual(a, b);
      assert.ok(idSet.has(a), a);
      assert.ok(idSet.has(b), b);
    }
    const keys = new Set(CONSTELLATION_EDGES.map(([a, b]) => edgeKey(a, b)));
    const required: [ConstellationId, ConstellationId][] = [
      ["shopify", "starshipit"],
      ["shopify", "xero"],
      ["ads", "hubspot"],
      ["hubspot", "gmail"],
      ["excel", "xero"],
      ["sheets", "xero"],
    ];
    for (const [a, b] of required) {
      assert.ok(keys.has(edgeKey(a, b)), `${a}-${b}`);
    }
  });

  test("rest positions stay inside the hero and reduced motion does not drift", () => {
    const w = 1440;
    const h = 800;
    const rest = restPositions(w, h);
    assert.equal(rest.length, 16);
    for (const p of rest) {
      assert.ok(p.x > 0 && p.x < w, p.id);
      assert.ok(p.y > 0 && p.y < h, p.id);
    }
    const frozen = driftedPositions(w, h, 8000, true, { x: 12, y: -9 });
    assert.deepEqual(frozen, rest);
  });

  test("live drift stays within a few pixels of the rest position", () => {
    const w = 1440;
    const h = 800;
    const rest = restPositions(w, h);
    const live = driftedPositions(w, h, 5300, false);
    for (let i = 0; i < rest.length; i++) {
      const dx = Math.abs(live[i].x - rest[i].x);
      const dy = Math.abs(live[i].y - rest[i].y);
      assert.ok(dx <= 8, `${live[i].id} dx ${dx}`);
      assert.ok(dy <= 8, `${live[i].id} dy ${dy}`);
    }
  });

  test("shimmer windows light a subset of edges over the 12s loop", () => {
    const atRest = activeShimmerKeys(0);
    assert.equal(atRest.size, 0);
    const midFulfilment = activeShimmerKeys(6500);
    assert.ok(midFulfilment.has(edgeKey("shopify", "starshipit")));
    const midFinance = activeShimmerKeys(8000);
    assert.ok(midFinance.has(edgeKey("excel", "xero")));
  });

  test("stacked layout keeps every tile below the headline, subtitle and form", () => {
    const tileRadius = 22;
    const maxAmp = 6;
    const cases: [number, number][] = [
      [768, 1000],
      [1010, 1040],
      [1279, 1100],
    ];
    for (const [w, h] of cases) {
      const rest = restPositions(w, h);
      assert.equal(rest.length, 16);
      const clearance = (STACKED_COPY_CLEARANCE_Y / 100) * h;
      for (const p of rest) {
        const top = p.y - tileRadius - maxAmp;
        assert.ok(
          top >= clearance,
          `${p.id} top ${top.toFixed(1)} overlaps copy at ${w}x${h} (clearance ${clearance.toFixed(1)})`,
        );
      }
    }
  });
});
