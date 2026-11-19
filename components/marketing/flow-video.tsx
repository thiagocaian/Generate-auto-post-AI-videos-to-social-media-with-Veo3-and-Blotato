"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

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

function present(src: string | null | undefined): src is string {
  return typeof src === "string" && src.trim().length > 0;
}

/**
 * Video-ready slot for a back-office flow.
 * Renders a poster always. If sources are provided, lazy-loads a muted looping
 * video when the slot is in view, unless the user prefers reduced motion.
 * Missing sources are valid: the poster stands alone.
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

  const hasDesktop = present(srcWebm) || present(srcMp4);
  const hasMobile = present(srcWebmMobile) || present(srcMp4Mobile);
  const hasVideo = hasDesktop || hasMobile;
  const loadVideo = hasVideo && inView && !reduced;

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
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-contain bg-white"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={poster}
          aria-hidden="true"
        >
          {present(srcWebmMobile) ? <source src={srcWebmMobile} type="video/webm" media="(max-width: 767px)" /> : null}
          {present(srcMp4Mobile) ? <source src={srcMp4Mobile} type="video/mp4" media="(max-width: 767px)" /> : null}
          {present(srcWebm) ? <source src={srcWebm} type="video/webm" /> : null}
          {present(srcMp4) ? <source src={srcMp4} type="video/mp4" /> : null}
        </video>
      ) : null}
    </figure>
  );
}
