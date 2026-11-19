"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  FLOW_VIDEO_MOBILE_QUERY,
  hasFlowVideoSources,
  selectFlowVideoSources,
} from "@/lib/marketing/flow-video-sources";

export type FlowVideoProps = {
  label: string;
  poster: string;
  posterMobile?: string;
  srcWebm?: string | null;
  srcMp4?: string | null;
  srcWebmMobile?: string | null;
  srcMp4Mobile?: string | null;
  className?: string;
};

/**
 * SSR-safe matchMedia hook. The first client render stays on the default
 * (desktop) until mount, then tracks the query and updates on change.
 */
function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/**
 * Video-ready slot for a back-office flow.
 * Renders a poster always. If sources are provided, lazy-loads a muted looping
 * video when the slot is in view, unless the user prefers reduced motion.
 * Missing sources are valid: the poster stands alone.
 *
 * Video sources are chosen in JS (not <source media>, which browsers ignore
 * inside <video>) so a desktop viewport never starts a mobile 720p file.
 */
export default function FlowVideo({
  label,
  poster,
  posterMobile,
  srcWebm,
  srcMp4,
  srcWebmMobile,
  srcMp4Mobile,
  className = "",
}: FlowVideoProps) {
  const reduced = useReducedMotion() === true;
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const isMobile = useMediaQuery(FLOW_VIDEO_MOBILE_QUERY);
  const mediaReady = isMobile !== null;

  const selected = selectFlowVideoSources(
    { srcWebm, srcMp4, srcWebmMobile, srcMp4Mobile },
    isMobile === true,
  );
  const hasVideo = hasFlowVideoSources(selected);
  const loadVideo = mediaReady && hasVideo && inView && !reduced;
  const videoPoster = isMobile === true && posterMobile ? posterMobile : poster;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= 0.25),
      { threshold: [0, 0.25, 0.5, 1] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (loadVideo) {
      const play = video.play();
      if (play && typeof play.catch === "function") play.catch(() => {});
    } else {
      video.pause();
    }
  }, [loadVideo]);

  return (
    <figure ref={rootRef} className={`relative overflow-hidden bg-white ${className}`.trim()} aria-label={label}>
      <picture>
        {posterMobile ? <source media="(max-width: 767px)" srcSet={posterMobile} type="image/webp" /> : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={poster} alt="" width={1600} height={900} className="h-auto w-full" decoding="async" />
      </picture>
      {loadVideo ? (
        <video
          key={selected.breakpoint}
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-contain bg-white"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={videoPoster}
          aria-hidden="true"
        >
          {selected.webm ? <source src={selected.webm} type="video/webm" /> : null}
          {selected.mp4 ? <source src={selected.mp4} type="video/mp4" /> : null}
        </video>
      ) : null}
    </figure>
  );
}
