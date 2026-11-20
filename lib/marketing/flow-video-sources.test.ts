import assert from "node:assert/strict";
import { describe, test } from "vitest";
import {
  hasFlowVideoSources,
  isPresentSrc,
  selectFlowVideoSources,
} from "@/lib/marketing/flow-video-sources";

const all = {
  srcWebm: "/flow-desktop.webm",
  srcMp4: "/flow-desktop.mp4",
  srcWebmMobile: "/flow-mobile.webm",
  srcMp4Mobile: "/flow-mobile.mp4",
};

describe("selectFlowVideoSources", () => {
  test("treats empty or whitespace sources as missing", () => {
    assert.equal(isPresentSrc(undefined), false);
    assert.equal(isPresentSrc(null), false);
    assert.equal(isPresentSrc(""), false);
    assert.equal(isPresentSrc("  "), false);
    assert.equal(isPresentSrc("/ok.mp4"), true);
  });

  test("picks only the mobile pair on a mobile breakpoint", () => {
    const selected = selectFlowVideoSources(all, true);
    assert.equal(selected.breakpoint, "mobile");
    assert.equal(selected.webm, "/flow-mobile.webm");
    assert.equal(selected.mp4, "/flow-mobile.mp4");
    assert.equal(hasFlowVideoSources(selected), true);
  });

  test("picks only the desktop pair on a desktop breakpoint", () => {
    const selected = selectFlowVideoSources(all, false);
    assert.equal(selected.breakpoint, "desktop");
    assert.equal(selected.webm, "/flow-desktop.webm");
    assert.equal(selected.mp4, "/flow-desktop.mp4");
  });

  test("falls back to desktop when mobile sources are missing", () => {
    const selected = selectFlowVideoSources(
      { srcWebm: all.srcWebm, srcMp4: all.srcMp4 },
      true,
    );
    assert.equal(selected.breakpoint, "desktop");
    assert.equal(selected.webm, "/flow-desktop.webm");
    assert.equal(selected.mp4, "/flow-desktop.mp4");
  });

  test("falls back to mobile when desktop sources are missing", () => {
    const selected = selectFlowVideoSources(
      { srcWebmMobile: all.srcWebmMobile, srcMp4Mobile: all.srcMp4Mobile },
      false,
    );
    assert.equal(selected.breakpoint, "mobile");
    assert.equal(selected.webm, "/flow-mobile.webm");
    assert.equal(selected.mp4, "/flow-mobile.mp4");
  });

  test("allows a single format at the active breakpoint", () => {
    const selected = selectFlowVideoSources({ srcMp4Mobile: "/only.mp4" }, true);
    assert.equal(selected.breakpoint, "mobile");
    assert.equal(selected.webm, undefined);
    assert.equal(selected.mp4, "/only.mp4");
  });

  test("returns no sources when every src is missing", () => {
    const selected = selectFlowVideoSources({}, true);
    assert.equal(selected.webm, undefined);
    assert.equal(selected.mp4, undefined);
    assert.equal(hasFlowVideoSources(selected), false);
  });
});
