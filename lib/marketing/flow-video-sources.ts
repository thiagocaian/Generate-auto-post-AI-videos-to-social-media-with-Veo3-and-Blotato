/** Mobile breakpoint used to pick 720p vs 1080p flow-video sources. */
export const FLOW_VIDEO_MOBILE_QUERY = "(max-width: 767px)";

export function isPresentSrc(src: string | null | undefined): src is string {
  return typeof src === "string" && src.trim().length > 0;
}

export type FlowVideoSourceInput = {
  srcWebm?: string | null;
  srcMp4?: string | null;
  srcWebmMobile?: string | null;
  srcMp4Mobile?: string | null;
};

export type SelectedFlowVideoSources = {
  webm?: string;
  mp4?: string;
  breakpoint: "mobile" | "desktop";
};

/**
 * Pick a single webm+mp4 pair for the active breakpoint.
 * `<source media>` is ignored inside `<video>`, so this must be decided in JS.
 * If the preferred breakpoint has no sources, fall back to the other.
 */
export function selectFlowVideoSources(
  sources: FlowVideoSourceInput,
  isMobile: boolean,
): SelectedFlowVideoSources {
  const desktop: Omit<SelectedFlowVideoSources, "breakpoint"> = {
    webm: isPresentSrc(sources.srcWebm) ? sources.srcWebm : undefined,
    mp4: isPresentSrc(sources.srcMp4) ? sources.srcMp4 : undefined,
  };
  const mobile: Omit<SelectedFlowVideoSources, "breakpoint"> = {
    webm: isPresentSrc(sources.srcWebmMobile) ? sources.srcWebmMobile : undefined,
    mp4: isPresentSrc(sources.srcMp4Mobile) ? sources.srcMp4Mobile : undefined,
  };
  const desktopHas = Boolean(desktop.webm || desktop.mp4);
  const mobileHas = Boolean(mobile.webm || mobile.mp4);

  if (isMobile && mobileHas) return { ...mobile, breakpoint: "mobile" };
  if (!isMobile && desktopHas) return { ...desktop, breakpoint: "desktop" };
  if (desktopHas) return { ...desktop, breakpoint: "desktop" };
  if (mobileHas) return { ...mobile, breakpoint: "mobile" };
  return { breakpoint: isMobile ? "mobile" : "desktop" };
}

export function hasFlowVideoSources(selected: SelectedFlowVideoSources): boolean {
  return Boolean(selected.webm || selected.mp4);
}
