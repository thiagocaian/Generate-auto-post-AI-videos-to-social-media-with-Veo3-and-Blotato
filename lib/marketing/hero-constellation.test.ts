import assert from "node:assert/strict";
import { describe, test } from "vitest";
import {
  CONSTELLATION_EDGES,
  CONSTELLATION_TOOLS,
  DESKTOP_TILE,
  MD_MIN,
  MOBILE_BOTTOM_BAND,
  MOBILE_TILE,
  MOBILE_ANCHORS,
  MOBILE_TOOL_IDS,
  MOBILE_TOP_BAND,
  STACKED_COPY_CLEARANCE_Y,
  activeShimmerKeys,
  driftedPositions,
  edgeKey,
  restPositions,
  tileSizeFor,
  type ConstellationId,
} from "@/components/marketing/hero-constellation-data";

const IDS = CONSTELLATION_TOOLS.map((t) => t.id);

describe("hero constellation", () => {
  test("includes 16 tools Cytron can integrate with", () => {
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
      "afterpay",
      "stripe",
      "woocommerce",
    ];
    assert.deepEqual([...IDS].sort(), [...wanted].sort());
    const shipping = CONSTELLATION_TOOLS.find((t) => t.id === "starshipit");
    assert.equal(shipping?.label, "Shipping");
    assert.equal(shipping?.source, "generic");
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

  test("desktop and tablet tile size and node count are unchanged", () => {
    assert.equal(tileSizeFor(768), DESKTOP_TILE);
    assert.equal(tileSizeFor(1010), DESKTOP_TILE);
    assert.equal(tileSizeFor(1440), DESKTOP_TILE);
    assert.equal(restPositions(768, 1000).length, 16);
    assert.equal(restPositions(1279, 1100).length, 16);
    assert.equal(restPositions(1440, 800).length, 16);
    assert.equal(tileSizeFor(MD_MIN - 1), MOBILE_TILE);
  });

  test("mobile layout uses the 8 preferred icons and smaller tiles", () => {
    assert.equal(MOBILE_TOOL_IDS.length, 8);
    for (const id of ["starshipit", "shopify", "xero", "excel", "gmail", "ads", "servicem8", "stripe"] as const) {
      assert.ok(MOBILE_TOOL_IDS.includes(id), id);
    }
    const rest = restPositions(390, 770);
    assert.equal(rest.length, 8);
    assert.deepEqual(rest.map((p) => p.id), MOBILE_TOOL_IDS);
    assert.equal(tileSizeFor(360), MOBILE_TILE);
    assert.ok(MOBILE_TILE < DESKTOP_TILE);
  });

  test("mobile tiles stay in the top and bottom edge bands at 360, 390 and 430", () => {
    const maxAmp = 3;
    const radius = MOBILE_TILE / 2;
    const cases: [number, number][] = [
      [360, 700],
      [360, 770],
      [360, 1400],
      [390, 770],
      [390, 1400],
      [430, 705],
      [430, 1400],
    ];
    for (const [w, h] of cases) {
      const rest = restPositions(w, h);
      const live = driftedPositions(w, h, 8300, false);
      assert.equal(rest.length, 8);
      for (let i = 0; i < rest.length; i++) {
        const p = rest[i];
        const top = p.y - radius - maxAmp;
        const bottom = p.y + radius + maxAmp;
        const inTop = bottom <= MOBILE_TOP_BAND;
        const inBottom = top >= h - MOBILE_BOTTOM_BAND;
        assert.ok(inTop || inBottom, `${p.id} leaves the edge bands at ${w}x${h} (y ${p.y.toFixed(1)})`);
        assert.ok(p.x - radius - maxAmp > 0 && p.x + radius + maxAmp < w, `${p.id} clips horizontally at ${w}x${h}`);
        const dx = Math.abs(live[i].x - p.x);
        const dy = Math.abs(live[i].y - p.y);
        assert.ok(dx <= maxAmp + 0.01, `${p.id} dx ${dx}`);
        assert.ok(dy <= maxAmp + 0.01, `${p.id} dy ${dy}`);
      }
      const frozen = driftedPositions(w, h, 8000, true, { x: 12, y: -9 });
      assert.deepEqual(frozen, rest);
    }
  });

  test("WhatsApp is not in the constellation, and Afterpay sits in its place at every layout", () => {
    assert.ok(!IDS.includes("whatsapp" as ConstellationId));
    assert.ok(IDS.includes("afterpay"));
    for (const [w, h] of [[360, 770], [390, 770], [430, 705], [768, 1000], [1010, 1040], [1280, 800], [1440, 800]] as const) {
      const rest = restPositions(w, h);
      const ids = rest.map((p) => p.id);
      assert.ok(!ids.includes("whatsapp" as ConstellationId), `whatsapp at ${w}`);
      if (w >= 768) assert.ok(ids.includes("afterpay"), `afterpay missing at ${w}`);
      assert.equal(rest.length, w < 768 ? 8 : 16);
    }
  });

  test("wide layout at 1280 and 1440 keeps every tile inside the hero", () => {
    const tileRadius = 22;
    const maxAmp = 6;
    for (const [w, h] of [[1280, 800], [1440, 800]] as const) {
      const rest = restPositions(w, h);
      assert.equal(rest.length, 16);
      for (const p of rest) {
        assert.ok(p.x - tileRadius - maxAmp > 0 && p.x + tileRadius + maxAmp < w, `${p.id} x at ${w}`);
        assert.ok(p.y - tileRadius - maxAmp > 0 && p.y + tileRadius + maxAmp < h, `${p.id} y at ${w}`);
      }
    }
  });

  test("mobile anchors use stable edge pixels, not viewport units", () => {
    assert.equal(MOBILE_ANCHORS.length, 8);
    for (const a of MOBILE_ANCHORS) {
      assert.equal(a.yUnit, "px");
      assert.ok(a.yFrom === "top" || a.yFrom === "bottom", a.id);
      // x is a percent of the hero width (stable on address-bar resize); y is px from an edge.
      assert.ok(a.x > 0 && a.x < 100, a.id);
    }
  });
});
